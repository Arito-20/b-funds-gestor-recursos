import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AlertType } from '../../../domain/enums';
import {
  SendAlertEmailParams,
  SendAlertEmailResult,
} from './email.types';

@Injectable()
export class EmailService {
  private getMode(): string {
    return (process.env.ALERT_EMAIL_MODE ?? 'MOCK').toUpperCase();
  }

  private getAllowlist(): string[] {
    const raw = process.env.ALERT_EMAIL_ALLOWLIST?.trim();
    if (!raw) return [];
    return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  }

  private getTestRecipient(): string | null {
    const value = process.env.ALERT_EMAIL_TEST_RECIPIENT?.trim();
    return value || null;
  }

  private getFromAddress(): string {
    return process.env.SMTP_FROM?.trim() || 'B-Funds Alerts <no-reply@belcorp.biz>';
  }

  async sendAlertEmail(params: SendAlertEmailParams): Promise<SendAlertEmailResult> {
    const mode = this.getMode();
    const originalRecipient = params.to.trim();

    if (mode !== 'SMTP') {
      return {
        status: 'MOCKED',
        recipient: originalRecipient,
        subject: params.subject,
        message: `[MOCK] Se enviaría correo a ${originalRecipient}: ${params.message}`,
      };
    }

    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();

    if (!smtpHost || !smtpUser || !smtpPass) {
      return {
        status: 'FAILED',
        recipient: originalRecipient,
        subject: params.subject,
        message: params.message,
        error: 'SMTP configuration incomplete (SMTP_HOST, SMTP_USER, SMTP_PASS required)',
      };
    }

    const testRecipient = this.getTestRecipient();
    const finalRecipient = testRecipient ?? originalRecipient;

    let body = params.message;
    if (testRecipient && testRecipient.toLowerCase() !== originalRecipient.toLowerCase()) {
      body = `${params.message}\n\nDestinatario original: ${originalRecipient}`;
    }

    const allowlist = this.getAllowlist();
    if (allowlist.length === 0) {
      return {
        status: 'MOCKED',
        recipient: finalRecipient,
        subject: params.subject,
        message: `[MOCK] SMTP allowlist not configured. Would send to ${finalRecipient}: ${body}`,
      };
    }

    if (!allowlist.includes(finalRecipient.toLowerCase())) {
      return {
        status: 'MOCKED',
        recipient: finalRecipient,
        subject: params.subject,
        message: `[MOCK] Recipient not in allowlist (${finalRecipient}): ${body}`,
      };
    }

    try {
      const port = Number(process.env.SMTP_PORT) || 587;
      const secure = process.env.SMTP_SECURE === 'true';

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: this.getFromAddress(),
        to: finalRecipient,
        subject: params.subject,
        text: body,
        html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
      });

      return {
        status: 'SENT',
        recipient: finalRecipient,
        subject: params.subject,
        message: `[SENT] Correo enviado a ${finalRecipient}: ${body}`,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown SMTP error';
      return {
        status: 'FAILED',
        recipient: finalRecipient,
        subject: params.subject,
        message: params.message,
        error: errorMessage,
      };
    }
  }

  async sendTestEmail(to: string): Promise<SendAlertEmailResult> {
    const subject = 'B-Funds: prueba de notificación';
    const message =
      'Este es un correo de prueba del módulo de alertas B-Funds. Si recibiste este mensaje, la configuración de notificaciones está funcionando.';

    return this.sendAlertEmail({
      to,
      subject,
      message,
      alertType: AlertType.EXPIRATION_AMBER,
    });
  }
}
