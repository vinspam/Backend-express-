import { NextFunction, Request, Response } from 'express';

import * as ILocalizations from '../utils/localizations';

import { IAuthInfo } from '../modules/auth/auth.types';
import UserService from '../modules/user/user.service';
import { ROLE, STATUS } from '../modules/user/user.constant';
import { PAYMENT_STATUS } from '../modules/payment/payment.constant';

const localizations = ILocalizations['en'];

export default function checkPermissions({
  roles,
  statusArr,
  paymentStatusArr,
}: {
  roles?: Array<ROLE>;
  statusArr?: Array<STATUS>;
  paymentStatusArr?: Array<PAYMENT_STATUS>;
} = {}) {
  return async (
    req: Request & { token: { [key: string]: unknown }; user: IAuthInfo; paymentStatus: PAYMENT_STATUS },
    res: Response,
    next: NextFunction
  ) => {
    try {
      
      const baseRoles = [ROLE.ADMIN, ROLE.USER];
      const baseStatusArr = [STATUS.VERIFIED, STATUS.WITH_PAYMENT, STATUS.WITHOUT_PAYMENT];
      const basePaymentStatusArr = [PAYMENT_STATUS.HAVE, PAYMENT_STATUS.DO_NOT_HAVE];
      roles = !roles ? baseRoles : roles;
      statusArr = !statusArr ? baseStatusArr : statusArr;
      paymentStatusArr = !paymentStatusArr ? basePaymentStatusArr : paymentStatusArr;

      const userService = new UserService();
      const user = req.user?.userId ? await userService.getItemById(req.user.userId) : null;
      if (user?.role && req.user.role && req.user.status) {
        if (
          roles.includes(user.role) &&
          statusArr.includes(user.status) &&
          (user.role === ROLE.ADMIN ||
            req.paymentStatus === PAYMENT_STATUS.NONE ||
            paymentStatusArr.includes(req.paymentStatus))
        ) {
          if (user.role !== req.user.role || user.status !== req.user.status) {
            return res.status(401).json({
              error: localizations.ERRORS.AUTH.USE_NEW_TOKEN,
              oldUser: req.user,
              newUser: { userId: user._id, role: user.role, status: user.status },
            });
          }
          return next();
        }
      }
      return res.status(403).json({
        error: localizations.ERRORS.OTHER.FORBIDDEN,
        paymentStatus: req.paymentStatus,
        oldUser: req.user,
        newUser: user ? { userId: user._id, role: user.role, status: user.status } : null,
      });
    } catch (error) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };
}
