import BaseService from '../../utils/base/service';
import { ForgotPassword } from '../../utils/db';
import { IForgotPassword } from './forgot_password.types';

export default class ForgotPasswordService extends BaseService<IForgotPassword> {
  constructor() {
    super(ForgotPassword);
  }
}
