import { Router } from 'express';
import StripeController from './stripe.controller';
import actionHandler from '../../../middleware/actionHandler';
import * as mapProperty from '../../../utils/interfaces';
import checkPermissions from '../../../middleware/checkPermissions';
import validateSchema from '../../../middleware/validateSchema';
import * as validate from './stripe.validate';

const stripeController = new StripeController();

const stripeRouter = Router()

stripeRouter.post(
  '/',
  validateSchema(validate.priceIdValidate, mapProperty.getBody),
  checkPermissions(),
  actionHandler(stripeController.createSubscribe, [mapProperty.getUserInfo, mapProperty.getBody])
);

stripeRouter.get('/', actionHandler(stripeController.getSubscribe, mapProperty.getUserInfo));

stripeRouter.put(
  '/',
  validateSchema(validate.subscribeIdValidate, mapProperty.getBody),
  checkPermissions(),
  actionHandler(stripeController.unsubscribe, [mapProperty.getUserInfo, mapProperty.getBody])
);

stripeRouter.post(
  '/free',
  checkPermissions(),
  actionHandler(stripeController.createFreeSubscribe, [mapProperty.getUserInfo])
);
stripeRouter.post(
  '/joinToFreeChallenge',
  checkPermissions(),
  actionHandler(stripeController.joinToFreeChallenge, [mapProperty.getUserInfo])
);

stripeRouter.get(
  '/subscribes',
  checkPermissions(),
  actionHandler(stripeController.getSubscriptions, [mapProperty.getQuery, mapProperty.getUserInfo])
);

stripeRouter.post(
  '/payment-method',
  validateSchema(validate.paymentMethodIdValidate, mapProperty.getBody),
  checkPermissions(),
  actionHandler(stripeController.attachPaymentMethod, [mapProperty.getUserInfo, mapProperty.getBody])
);

stripeRouter.get(
  '/payment-method',
  checkPermissions(),
  actionHandler(stripeController.getPaymentMethod, mapProperty.getUserInfo)
);

stripeRouter.put(
  '/payment-method',
  validateSchema(validate.paymentMethodIdValidate, mapProperty.getBody),
  checkPermissions(),
  actionHandler(stripeController.changePaymentMethod, [mapProperty.getBody, mapProperty.getUserInfo])
);

stripeRouter.delete(
  '/payment-method',
  validateSchema(validate.paymentMethodIdValidate, mapProperty.getBody),
  checkPermissions(),
  actionHandler(stripeController.detachPaymentMethod, [mapProperty.getBody, mapProperty.getUserInfo])
);

stripeRouter.put(
  '/customer',
  validateSchema(validate.replaceCustomerValidate, mapProperty.getBody),
  actionHandler(stripeController.replaceCustomer, [mapProperty.getUserInfo, mapProperty.getBody])
)

export default stripeRouter;