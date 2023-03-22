import { smtpConfig } from './index'
import nodemailer, { Transporter } from 'nodemailer'
import { renderTemplate } from '../utils/template'

interface IMailOptions {
  from: string
  to: string
  subject: string
  html: string
}

class Mail {
  static mail: Mail
  transporter: Transporter

  private constructor () {
    this.transporter = nodemailer.createTransport({
      ...smtpConfig,
      logger: true,
      requireTLS: true
    })
  }

  public static getMail (): Mail {
    if (Mail.mail == null) {
      Mail.mail = new Mail()
    }
    return Mail.mail
  }

  public async sendMail (
    template: string,
    args: any,
    to: string,
    subject: string,
    prefix: string
  ): Promise<void> {
    const html = await renderTemplate(template, args)

    const mailOptions: IMailOptions = {
      from: `"${smtpConfig.auth.user}" <${smtpConfig.auth.user}>`,
      to,
      subject,
      html
    }
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error != null) {
        console.error(prefix, error)
      }
    })
  }
}

export default Mail
