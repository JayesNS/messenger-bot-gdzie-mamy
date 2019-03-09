import { User, ResponseMessage } from '../models';
import { ResponseMessageRepo } from './ResponseMessageRepo';
import { SendApi } from './SendApi';
import { TextMessage, TypingOffMessage } from './messages';
import { HandleGroupSelection } from './response-messages/HandleGroupSelection';
import { Configure } from './response-messages';

export class MessageHandler {
  private responseRepo: ResponseMessageRepo;
  private sendApi: SendApi;

  constructor() {
    this.responseRepo = new ResponseMessageRepo();
    this.sendApi = new SendApi();
  }

  async handleMessageEvent(sender: User, message: any): Promise<void> {
    const response: ResponseMessage = this.responseRepo.getResponseByTrigger(message.text);

    if (!response) {
      this.handleUnusualMessage(sender, message);
      return;
    }

    this.sendApi.sendMessage({ id: sender.id }, await response.create({ sender, message }));
    sender.addHistoryRecord(response.id);
    this.sendApi.sendMessage({ id: sender.id }, new TypingOffMessage());
  }

  handlePostbackEvent(sender: User, postback: any): void {
    console.log('postbackEvent', postback);
    this.handleMessageEvent(sender, postback);
  }

  handleAttachmentEvent(sender: User, attachments: any[]): void {
    console.log('attachmentEvent', attachments);
    this.handleMessageEvent(sender, { text: 'attachment' });
  }

  async handleUnusualMessage(sender: User, content: any): Promise<void> {
    if (content.text && sender.getLastHistoryRecord() === new Configure().id) {
      this.sendApi.sendMessage(
        { id: sender.id },
        await new HandleGroupSelection().create({ sender, message: content })
      );
    } else {
      this.sendApi.sendMessage({ id: sender.id }, new TextMessage('Nie obsługiwane polecenie'));
    }
  }
}
