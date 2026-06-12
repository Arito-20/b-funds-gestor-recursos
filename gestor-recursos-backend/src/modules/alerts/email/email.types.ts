import { AlertType } from '../../../domain/enums';

export type EmailDeliveryStatus = 'SENT' | 'FAILED' | 'MOCKED';

export interface SendAlertEmailParams {
  to: string;
  subject: string;
  message: string;
  alertType: AlertType;
  managerName?: string;
  consultantName?: string;
}

export interface SendAlertEmailResult {
  status: EmailDeliveryStatus;
  recipient: string;
  subject: string;
  message: string;
  error?: string;
}

export interface AlertEmailRecord {
  managerName: string;
  managerEmail: string;
  recipient: string;
  subject: string;
  message: string;
  status: EmailDeliveryStatus;
}
