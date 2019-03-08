import * as request from 'request';

import { Message, Recipient } from '../models';
import { ACCESS_TOKEN } from '../../config';

export class SendApi {
  async sendMessage(recipient: Recipient, message: Message): Promise<Message> {
    return await this.makeRequestToMessengerApi(recipient, message);
  }

  private makeRequestToMessengerApi(recipient: Recipient, message: Message): Promise<Message> {
    return new Promise((resolve, reject) =>
      request(
        {
          uri: 'https://graph.facebook.com/v2.6/me/messages',
          qs: { access_token: ACCESS_TOKEN },
          method: 'POST',
          json: { recipient, ...message }
        },
        (error, res, body) => {
          if (error) {
            console.log({ error });
            reject(error);
          }

          resolve(message);
        }
      )
    );
  }
}
