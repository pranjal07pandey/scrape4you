import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor() {
  }

  async sendNotification(token: string, title: string, body: string): Promise<string> {
    try {
      const message = {
        token,
        notification: {
          title,
          body,
        },
      };

      const response = await admin.messaging().send(message);
      return `Notification sent: ${response}`;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error('Failed to send notification');
    }
  }
}