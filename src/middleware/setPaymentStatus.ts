import { NextFunction, Request, Response } from 'express';

import PaymentController from '../modules/payment/stripe/stripe.controller';
import { IAuthInfo } from '../modules/auth/auth.types';
import { PAYMENT_STATUS } from '../modules/payment/payment.constant';

import logger from '../utils/logger';

const paymentController = new PaymentController();

export default async function setPaymentStatus(
  req: Request & { user: IAuthInfo; paymentStatus: PAYMENT_STATUS },
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId ? req.user.userId : undefined;

    req.paymentStatus = await paymentController.getMemoizePaymentStatus(userId);

    if (req.path && req.path.indexOf('/payment/stripe') === 0) {
      // clear userId result
      await paymentController.getMemoizePaymentStatus.delete(userId);
    }
  } catch (err) {
    logger.error(err);
  }

  next();
}
