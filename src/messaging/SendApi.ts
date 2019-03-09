import { Message, Recipient } from '../models';
import { ACCESS_TOKEN } from '../../config';
import { Helpers } from '../helpers';

export class SendApi {
  async sendMessage(recipient: Recipient, message: Message): Promise<Message> {
    return await this.makeRequestToMessengerApi(recipient, message);
  }

  private async makeRequestToMessengerApi(
    recipient: Recipient,
    message: Message
  ): Promise<Message> {
    return await Helpers.makeRequest({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: ACCESS_TOKEN },
      method: 'POST',
      json: { recipient, ...message }
    });
  }
}
