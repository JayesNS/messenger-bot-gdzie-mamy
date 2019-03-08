import * as request from 'request';

import { Message } from '../models';
import { ACCESS_TOKEN } from '../../config';

export class SendApi {
  async sendMessage(message: Message): Promise<Message> {
    return await this.makeRequestToMessengerApi(message);
  }

  private makeRequestToMessengerApi(message: Message): Promise<Message> {
    return new Promise((resolve, reject) =>
      request(
        {
          uri: 'https://graph.facebook.com/v2.6/me/messages',
          qs: { access_token: ACCESS_TOKEN },
          method: 'POST',
          json: message
        },
        (error, res, body) => {
          if (error) {
            reject(error);
          }

          resolve(message);
        }
      )
    );
  }
}
