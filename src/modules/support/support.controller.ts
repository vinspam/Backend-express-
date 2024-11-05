import { SENDGRID_SUPPORT } from '../../config';

import * as localizations from '../../utils/localizations';
import ILocalization from '../..//utils/localizations/localizations.interface';

import sendMail from '../../utils/mailing';

export default class EquipmentController {
  private localizations: ILocalization;

  constructor() {
    this.localizations = localizations['en'];
  }

  public sendEmail = async (info: { name: string; email: string; comment: string }) => {
    try {
      await sendMail(SENDGRID_SUPPORT, {
        subject: `Support request from ${info.email}`,
        text: `${info.name || 'User'} with email < ${info.email} > send comment: ${info.comment}`,
        replyTo: { email: info.email, name: info.name },
      });
    } catch (err) {
      throw new Error(this.localizations.ERRORS.OTHER.ERROR_WITH_SEND_MESSAGE);
    }

    return {
      message: 'Success',
    };
  };
}
