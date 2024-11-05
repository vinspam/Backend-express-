import { generateCode, CustomError } from '../../utils/helpers';
import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';
import sendMail from '../../utils/mailing';

import ForgotPasswordService from './forgot_password.service';
import UserService from '../user/user.service';

export default class ForgotPasswordController {
  private forgotPasswordService: ForgotPasswordService;
  private userService: UserService;
  private localizations: ILocalization;

  constructor() {
    this.forgotPasswordService = new ForgotPasswordService();
    this.userService = new UserService();

    this.localizations = localizations['en'];
  }

  forgotPassword = async ({ email }) => {
    const user = await this.userService.getItem({ email });

    if (!user) throw new CustomError(404, this.localizations.ERRORS.USER.NOT_EXIST);

    const code = generateCode();

    const info = await this.forgotPasswordService.updateOrInsert({ userId: user._id }, { code });

    try {
      await sendMail(user.email, {
        subject: 'confirmation mail',
        text: `Your confirmation code ${code}`,
      });
    } catch (err) {
      throw new Error(this.localizations.ERRORS.OTHER.EMAIL_WITH_CODE_NOT_SENDED);
    }

    return {
      id: info._id,
    };
  };

  checkCode = async (id, { code }) => {
    const item = await this.forgotPasswordService.getItemById(id);

    if (!item) throw new CustomError(404, this.localizations.ERRORS.OTHER.ITEM_NOT_FOUND);
    if (code != item.code) throw new Error(this.localizations.ERRORS.OTHER.CODE_IS_INVALID);

    return {
      message: 'Success',
    };
  };

  resetPassword = async (id, { code, password }) => {
    const item = await this.forgotPasswordService.getItemById(id);

    if (!item) throw new CustomError(404, this.localizations.ERRORS.OTHER.ITEM_NOT_FOUND);

    if (code != item.code) throw new Error(this.localizations.ERRORS.OTHER.CODE_IS_INVALID);

    await this.userService.resetPassword(item.userId, password);
    await this.forgotPasswordService.deleteById(item._id);

    return {
      message: 'Success',
    };
  };
}
