import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import sgMail from '@sendgrid/mail';

import { SENDGRID_API_KEY, SENDGRID_SENDER } from '../config';

sgMail.setApiKey(SENDGRID_API_KEY);

export default (userEmail: string, messageObj: { subject: string; text: string } & Partial<MailDataRequired>) => {
  const { subject, text, replyTo } = messageObj;

  const msg: MailDataRequired = {
    to: userEmail,
    from: SENDGRID_SENDER,
    subject, 
    text,
  };

  if (replyTo) msg.replyTo = replyTo;

  return sgMail.send(msg);
};
