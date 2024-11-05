import { Stripe } from 'stripe';
import memoize from 'memoizee';

import { CustomError } from '../../../utils/helpers';
import * as localizations from '../../../utils/localizations';
import ILocalization from '../../../utils/localizations/localizations.interface';

import PaymentService from './stripe.service';
import PaymentSettingsService from '../../payment_settings/payment_settings.service';
import UserService from '../../user/user.service';
import {IFreeChallenge} from '../../user/user.types';
import { IAuthInfo } from '../../auth/auth.types'
import { IPayment, ISubscribeData, IData, IWeeks } from '../payment.types';
import { MEMOIZE_TIME, PAYMENT_STATUS, PaymentType } from '../payment.constant';
import { IPaymentSettings } from '../../payment_settings/payment_settings.types';
import logger from '../../../utils/logger';
import PlanController from '../../plan/plan.controller';
import { Interface } from 'readline';


export default class StripeController {
  private paymentService: PaymentService;
  private paymentSettingsService: PaymentSettingsService;
  private localizations: ILocalization;
  private userService: UserService;
  private planController : PlanController;
  public getMemoizePaymentStatus: ((userId) => Promise<PAYMENT_STATUS>) &
    memoize.Memoized<(userId) => Promise<PAYMENT_STATUS>>;

  constructor() {
    this.paymentService = new PaymentService();
    this.paymentSettingsService = new PaymentSettingsService();
    this.userService = new UserService();
    this.planController = new PlanController();
    this.localizations = localizations['en'];

    this.getMemoizePaymentStatus = memoize(this.paymentStatus, { promise: true, maxAge: MEMOIZE_TIME });
  }

  private getPaymentSettings = async (): Promise<IPaymentSettings> => {
    let paymentSettings: IPaymentSettings;

    try {
      paymentSettings = await this.paymentSettingsService.getPaymentSettings();
    } catch (error) {
      throw new CustomError(500, '');
    }
    if (!paymentSettings) {
      paymentSettings = await this.paymentSettingsService.createDefault();
    }

    return paymentSettings;
  };
 
  private checkSuccessChallenge = async(userId:string) =>{
    try{
      const weeks =  await this.planController.getWeeks({userId},0)
      const completedWeeks  = (<IWeeks>weeks).completedWeek
      for(var i = 0; i < completedWeeks.length; i ++) {
        if(completedWeeks[i] == false)
          return false
      }
      return true
  
    }catch(err){
      console.log(err, 'checkSuccessChallenge')
      return false
    }
  }

  private getFullSubscribeInfo = async (userId: string, isPrivate = false) => {
    const user = await this.userService.getItemById(userId)
    if(user.freeChallenge && isPrivate) {
      const endDay = user.freeChallenge.endDay;
      const startDay = user.freeChallenge.startDay;
      const nowDate = new Date()
      if(user.freeChallenge.isCompleted == false && user.freeChallenge.inProgress == true) { // In case freechallenge is not completed yet and going now.
          if(endDay < nowDate) { // If Date is expired....
              try{
                    console.log('expired')
                    // check challenge is successed
                    const isSuccess = await this.checkSuccessChallenge(userId)        
                    
                    // create subscribe with upfront and then unsubscribe if he fails challenge
                    if(isSuccess == false) {
                      
                      const customerPaymentInfo = await this.paymentService.getCustomerByUserId(userId);
                      const paymentSettings = await this.getPaymentSettings();
                      
                      await this.paymentService.createFreeSubscribe(paymentSettings,customerPaymentInfo.customerId,true)
                      console.log('free challenge subscription created...')
                      let customerInfo = await this.paymentService.getCustomerInfo(
                        paymentSettings.secretKey,
                        customerPaymentInfo.customerId
                      );              
                      
                      const subscription  = customerInfo.subscriptions.data[0]
                      await this.paymentService.unsubscribe(
                        paymentSettings.secretKey,
                        subscription.id  
                      )
                      console.log('free challenge subscription deleted...')
                    
                    }

                  //Update Database 
                  const newFreeChallenge = user.freeChallenge
                  newFreeChallenge.isCompleted = true
                  newFreeChallenge.inProgress = false
                  await this.userService.update({_id:userId},{freeChallenge:newFreeChallenge})

              }catch(err){
                console.log(err, 'challenge error')
              }  
          }
          return [
              <ISubscribeData>{
              id: '',
              price: 0,
              currency: '',
              interval: 'month',
              intervalCount: 1,
              name: '',
              start: Number(startDay),
              end: Number(endDay),
              trialStart: Number(startDay),
              trialEnd: Number(endDay),
              status: 'trialing',
              priceId: '',
              cancelAtPeriodEnd: endDay < nowDate,
            }
        ];
      
      }
     
    
    
    }
    let customerPaymentInfo;
    try {
      customerPaymentInfo = await this.paymentService.getCustomerByUserId(userId);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.GET_CUSTOMER);
    }

    const paymentSettings = await this.getPaymentSettings();

    let customerInfo: Stripe.Customer;
    try {
      customerInfo = await this.paymentService.getCustomerInfo(
        paymentSettings.secretKey,
        customerPaymentInfo.customerId
      );
    } catch (e) {
      console.log(e)
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.GET_CUSTOMER_INFO);
    }

    return customerInfo.subscriptions.data.map((subscription: Stripe.Subscription & { plan: Stripe.Plan }) => {
      return <ISubscribeData>{
        id: subscription?.id,
        price: subscription?.plan?.amount / 100,
        currency: subscription?.plan?.currency,
        interval: subscription?.plan?.interval,
        intervalCount: subscription?.plan?.interval_count,
        name: subscription?.plan?.nickname,
        start: subscription?.current_period_start,
        end: subscription?.current_period_end,
        trialStart: subscription?.trial_start,
        trialEnd: subscription?.trial_end,
        status: subscription?.status,
        priceId: subscription.plan.id,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    });
  };

  public createCustomer = async ({
    userId,
    email,
    name,
  }: {
    userId: string;
    email: string;
    name: string;
  }): Promise<{ status: number }> => {
    const paymentSettings = await this.getPaymentSettings();

    let customerInfo: Stripe.Response<Stripe.Customer>;
    try {
      customerInfo = await this.paymentService.createCustomer(paymentSettings.secretKey, { email, name });
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.CREATE_CUSTOMER);
    }

    const payload = <IPayment>{
      userId,
      payloadData: {
        customerId: customerInfo.id,
      },
      type: PaymentType.STRIPE,
    };

    try {
      await this.paymentService.bindUserIdWithStripe(payload);
    } catch (error) {
      throw new Error(this.localizations.ERRORS.OTHER.SOMETHING_WENT_WRONG);
    }

    return {
      status: 201,
    };
  };

  public paymentStatus = async (userId?: string): Promise<PAYMENT_STATUS> => {
    if (!userId) {
      return PAYMENT_STATUS.NONE;
    }

    try {
      const subscribes = await this.getFullSubscribeInfo(userId);

      if (subscribes.length) {
        return PAYMENT_STATUS.HAVE;
      }

      return PAYMENT_STATUS.DO_NOT_HAVE;
    } catch (error) {
      return PAYMENT_STATUS.NONE;
    }
  };

  public attachPaymentMethod = async ({ userId }, { paymentMethodId }) => {
    const paymentSettings = await this.getPaymentSettings();

    let customerPaymentInfo;
    try {
      customerPaymentInfo = await this.paymentService.getCustomerByUserId(userId);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.GET_CUSTOMER);
    }

    try {
      await this.paymentService.attachPaymentMethod(
        paymentSettings.secretKey,
        paymentMethodId,
        customerPaymentInfo.customerId
      );
      await this.paymentService.changeDefaultPaymentMethod(
        paymentSettings.secretKey,
        paymentMethodId,
        customerPaymentInfo.customerId
      );
    } catch (e) {
      console.log(e)
      throw new CustomError(500, '');
    }

    return {
      status: 200,
      payload: {
        message: 'Attached',
      },
    };
  };

  public createSubscribe = async (
    { userId }: { userId: string },
    { priceId }: { priceId: string }
  ): Promise<{ status: number; payload: object }> => {

   
    let customerPaymentInfo;
    try {
      customerPaymentInfo = await this.paymentService.getCustomerByUserId(userId);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.GET_CUSTOMER);
    }

    const paymentSettings = await this.getPaymentSettings();
    const paymentMethods = await this.paymentService.getPaymentMethod(
      paymentSettings.secretKey,
      customerPaymentInfo.customerId
    );
    const customerInfo = await this.paymentService.getCustomerInfo(
      paymentSettings.secretKey,
      customerPaymentInfo.customerId
    );

    if (!paymentMethods.find((method) => method.id === customerInfo.invoice_settings.default_payment_method)) {
      throw new CustomError(400, this.localizations.ERRORS.PAYMENT.USER_CARDS_EMPTY);
    }
   
    const subscribesInfo = await this.getFullSubscribeInfo(userId);
   

    if (!subscribesInfo.length) {
      await this.paymentService.createSubscribe(paymentSettings, customerPaymentInfo.customerId, priceId);
      await this.paymentService.update(
        { 'payloadData.customerId': customerPaymentInfo.customerId },
        { 'payloadData.haveTrialDays': true }
      );
    } else if (subscribesInfo[0]?.status === 'trialing') {
      const trialInDays = (subscribesInfo[0]?.trialEnd - Date.now() / 1000) / 60 / 60 / 24;
      await this.paymentService.createSubscribe(
        paymentSettings,
        customerPaymentInfo.customerId,
        priceId,
        Number(trialInDays.toFixed())
      );
      await this.paymentService.deleteSubscribe(paymentSettings.secretKey, subscribesInfo[0].id);
    } else if (subscribesInfo[0]?.status === 'active') {
      const trialInDays = (subscribesInfo[0]?.end - Date.now() / 1000) / 60 / 60 / 24;
      await this.paymentService.createSubscribe(
        paymentSettings,
        customerPaymentInfo.customerId,
        priceId,
        Number(trialInDays.toFixed())
      );
      await this.paymentService.deleteSubscribe(paymentSettings.secretKey, subscribesInfo[0].id);
    } else {
      throw new CustomError(400, 'Current subscribe not active or trialing');
    }
    
    try{
        const userData = await  this.userService.getItemById(userId)
        if(userData.freeChallenge) {
          const newFreeChallenge : IFreeChallenge = userData.freeChallenge
          const dayEnd = newFreeChallenge.endDay;
          const nowDate = new Date()
          if(dayEnd < nowDate) {
            newFreeChallenge.isCompleted = true
          }
          newFreeChallenge.inProgress = false
        await this.userService.update({_id : userId},{freeChallenge : newFreeChallenge})
      }
    } catch (err) {

    }

    return {
      status: 201,
      payload: {
        message: 'Created',
      },
    };
  };

  private checkFreePaymentSetting = (paymentSettings) => {
    if (!paymentSettings?.freeSubscribe?.available) {
      throw new CustomError(400, 'Free subscribe does not available');
    }

    if (
      !(
        paymentSettings?.freeSubscribe?.payment?.card &&
        paymentSettings?.freeSubscribe?.payment?.cvc &&
        paymentSettings?.freeSubscribe?.payment?.expireYear &&
        paymentSettings?.freeSubscribe?.payment?.expireMonth &&
        paymentSettings?.freeSubscribe?.priceId
      )
    ) {
      throw new CustomError(500, 'Something went wrong');
    }
  };

  public createFreeSubscribe = async ({ userId }: { userId: string }): Promise<{ status: number; payload: object }> => {
    const paymentSettings = await this.getPaymentSettings();
    this.checkFreePaymentSetting(paymentSettings);

    const subscribesInfo = await this.getFullSubscribeInfo(userId);

    if (subscribesInfo.length) {
      throw new CustomError(400, 'Free subscribe for this user is not available');
    }

    let paymentMethod: Stripe.Response<Stripe.PaymentMethod>;
    try {
      paymentMethod = await this.paymentService.createPaymentMethod(
        paymentSettings.secretKey,
        paymentSettings.freeSubscribe.payment
      );
    } catch (error) {
      throw new CustomError(500, 'Internal Server Error');
    }

    let customerPaymentInfo;
    try {
      customerPaymentInfo = await this.paymentService.getCustomerByUserId(userId);
    } catch (error) {
      throw new CustomError(500, 'Internal Server Error');
    }

    try {
      await this.paymentService.attachPaymentMethod(
        paymentSettings.secretKey,
        paymentMethod.id,
        customerPaymentInfo.customerId
      );
      await this.paymentService.changeDefaultPaymentMethod(
        paymentSettings.secretKey,
        paymentMethod.id,
        customerPaymentInfo.customerId
      );
    } catch (error) {
      throw new CustomError(500, 'Internal Server Error');
    }

    try {
      await this.paymentService.createFreeSubscribe(paymentSettings, customerPaymentInfo.customerId);
    } catch (error) {
      await this.paymentService.detachPaymentMethod(paymentSettings.secretKey, paymentMethod.id);
      throw new CustomError(500, 'Internal Server Error');
    }

    try {
      await this.paymentService.detachPaymentMethod(paymentSettings.secretKey, paymentMethod.id);
    } catch (error) {
      throw new CustomError(500, 'Internal Server Error');
    }

    return {
      status: 201,
      payload: {
        message: 'Created',
      },
    };
  };
  
  public getSubscribe = async ({ userId }: { userId: string }) => {
    const subscribes = await this.getFullSubscribeInfo(userId, true);

    if (!subscribes.length) {
      throw new CustomError(404, this.localizations.ERRORS.PAYMENT.SUBSCRIBE_NOT_FOUND);
    }

    return {
      status: 200,
      payload: subscribes,
    };
  };

  public getPaymentMethod = async ({ userId }: { userId: string }) => {
    let customerPaymentInfo;
    try {
      customerPaymentInfo = await this.paymentService.getCustomerByUserId(userId);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.GET_CUSTOMER);
    }

    const paymentSettings = await this.getPaymentSettings();
    const paymentMethods = await this.paymentService.getPaymentMethod(
      paymentSettings.secretKey,
      customerPaymentInfo.customerId
    );

    if (!paymentMethods.length) {
      throw new CustomError(404, this.localizations.ERRORS.PAYMENT.USER_CARDS_EMPTY);
    }

    const customerInfo = await this.paymentService.getCustomerInfo(
      paymentSettings.secretKey,
      customerPaymentInfo.customerId
    );

    return paymentMethods.map((method) => {
      return {
        id: method.id,
        expMonth: method.card.exp_month,
        expYear: method.card.exp_year,
        lastNumber: method.card.last4,
        brand: method.card.brand,
        cvcCheck: method.card.checks.cvc_check,
        default: customerInfo.invoice_settings.default_payment_method === method.id,
      };
    });
  };

  public getSubscriptions = async ({ forUser }, { userId }) => {
    const paymentSettings = await this.getPaymentSettings();

    let subscriptions;
    try {
      subscriptions = await this.paymentService.getSubscriptions(paymentSettings);
    } catch (error) {
      console.log(error)
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.GET_SUBSCRIBE);
    }

    if (!forUser) {
      return subscriptions;
    }

    const userSubscribes = await this.getFullSubscribeInfo(userId);
    const priceIds = userSubscribes.map((subscribe) => subscribe.priceId);

    const availableSubscribePeriod = Object.keys(subscriptions).filter(
      (subscribePeriod) => !priceIds.includes(subscriptions[subscribePeriod].id)
    );

    return availableSubscribePeriod.map((period) => subscriptions[period]);
  };
  public joinToFreeChallenge = async(
    { userId }: { userId: string }
  ): Promise<{ status: number; payload: object }> =>{
    const user = await this.userService.getItemById(userId)
    try{
      if(user.freeChallenge != undefined) {
     
        const newFreeChallenge : IFreeChallenge = user.freeChallenge
        if(newFreeChallenge.isCompleted == false)
          {
              newFreeChallenge.inProgress = true
              await this.userService.update({_id:userId},{freeChallenge: newFreeChallenge})         
          }

      } else {
      
        let nextMonthDate = new Date();
        let currentMonth = nextMonthDate.getMonth();
        nextMonthDate.setMonth(currentMonth + 1);
        const newFreeChallenge : IFreeChallenge = {
          startDay: new Date(),
          endDay: nextMonthDate,
          isCompleted: false,
          inProgress: true
        }

        await this.userService.updateOrInsert({_id:userId},{freeChallenge: newFreeChallenge})         
      
      }
    }catch(err){
      return {
        status: 400,
        payload: {
          message: 'Failed',
        },
      };
    }
    return {
      status: 200,
      payload: {
        message: 'Success',
      },
    };
  }
  public unsubscribe = async (
    { userId }: { userId: string },
    { subscribeId }: { subscribeId: string }
  ): Promise<{ status: number; payload: object }> => {
    const subscribes = await this.getFullSubscribeInfo(userId);

    const subscribe = subscribes.find((sub) => sub.id === subscribeId);

    if (!subscribe) {
      throw new CustomError(403, this.localizations.ERRORS.PAYMENT.PERMISSION_DENIED);
    }

    const paymentSettings = await this.getPaymentSettings();

    try {
      console.log(subscribeId,'subscribeId')
      await this.paymentService.unsubscribe(paymentSettings.secretKey, subscribeId);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.DELETE_SUBSCRIBE);
    }
 
    return {
      status: 200,
      payload: {
        message: 'Unsubscribe',
      },
    };
  };

  public deleteSubscribe = async (
    { userId }: { userId: string },
    { subscribeId }: { subscribeId: string }
  ): Promise<{ status: number; payload: object }> => {
    const subscribes = await this.getFullSubscribeInfo(userId);

    const subscribe = subscribes.find((sub) => sub.id === subscribeId);

    if (!subscribe) {
      throw new CustomError(400, 'Subscribes empty');
    }

    if (subscribe.status === 'active') {
      throw new CustomError(400, 'Subscribe with status active сan not be deleted');
    }

    const paymentSettings = await this.getPaymentSettings();

    try {
      await this.paymentService.deleteSubscribe(paymentSettings.secretKey, subscribeId);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.DELETE_SUBSCRIBE);
    }

    return {
      status: 200,
      payload: {
        message: 'Deleted',
      },
    };
  };

  public getAdminInfo = async ({
    userId,
  }: {
    userId: string;
  }): Promise<{ status: number; payload: ISubscribeData[] }> => {
    const subscribes = await this.getFullSubscribeInfo(userId);

    if (!subscribes.length) {
      throw new CustomError(404, this.localizations.ERRORS.PAYMENT.SUBSCRIBE_NOT_FOUND);
    }

    return {
      status: 200,
      payload: subscribes,
    };
  };

  public detachPaymentMethod = async (
    { paymentMethodId }: { paymentMethodId: string },
    { userId }: { userId: string }
  ) => {
    let customerPaymentInfo;
    try {
      customerPaymentInfo = await this.paymentService.getCustomerByUserId(userId);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.GET_CUSTOMER);
    }

    const paymentSettings = await this.getPaymentSettings();
    const paymentMethods = await this.paymentService.getPaymentMethod(
      paymentSettings.secretKey,
      customerPaymentInfo.customerId
    );

    if (!paymentMethods.length) {
      throw new CustomError(404, this.localizations.ERRORS.PAYMENT.USER_CARDS_EMPTY);
    }

    if (!paymentMethods.find((paymentMethod) => paymentMethod.id === paymentMethodId)) {
      throw new CustomError(403, this.localizations.ERRORS.PAYMENT.PERMISSION_DENIED);
    }

    await this.paymentService.detachPaymentMethod(paymentSettings.secretKey, paymentMethodId);

    return {
      status: 200,
      payload: {
        message: 'Detach',
      },
    };
  };

  public changePaymentMethod = async (
    { paymentMethodId }: { paymentMethodId: string },
    { userId }: { userId: string }
  ): Promise<{ status: number; payload: object }> => {
    let customerPaymentInfo;
    try {
      customerPaymentInfo = await this.paymentService.getCustomerByUserId(userId);
    } catch (error) {
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.GET_CUSTOMER);
    }

    const paymentSettings = await this.getPaymentSettings();

    const paymentMethods = await this.paymentService.getPaymentMethod(
      paymentSettings.secretKey,
      customerPaymentInfo.customerId
    );

    if (!paymentMethods.length) {
      throw new CustomError(404, this.localizations.ERRORS.PAYMENT.USER_CARDS_EMPTY);
    }

    const customerInfo = await this.paymentService.getCustomerInfo(
      paymentSettings.secretKey,
      customerPaymentInfo.customerId
    );

    if (paymentMethodId === customerInfo.invoice_settings.default_payment_method) {
      throw new CustomError(400, 'Already default payment method');
    }

    await this.paymentService.changeDefaultPaymentMethod(
      paymentSettings.secretKey,
      paymentMethodId,
      customerPaymentInfo.customerId
    );

    return {
      status: 201,
      payload: {
        message: 'Card change',
      },
    };
  };

  replaceCustomer = async ({ userId }: IAuthInfo, data: IData) => {
    const paymentSettings = await this.paymentSettingsService.getPaymentSettings();

    try {
      await this.paymentService.replaceCustomer(paymentSettings.secretKey, userId, data.customerId)
    } catch (error) {
      logger.error(error)
      throw new CustomError(500, this.localizations.ERRORS.PAYMENT.REPLACE_CUSTOMER);
    }

    return {
      status: 201,
      payload: {
        message: 'Successfully replaced customer!',
      },
    };
  }
}
