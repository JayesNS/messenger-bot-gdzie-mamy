import { User, ResponseMessage } from '../models';
import { ResponseMessageRepo } from './ResponseMessageRepo';
import { SendApi } from './SendApi';
import { TextMessage } from './messages';
import { LocalUserRepo } from '../users';
import { Configure } from './response-messages/Configure';

export class MessageHandler {
  private responseRepo: ResponseMessageRepo;
  private sendApi: SendApi;

  constructor() {
    this.responseRepo = new ResponseMessageRepo();
    this.sendApi = new SendApi();
  }

  handleMessageEvent(sender: User, message: any): void {
    const response: ResponseMessage = this.responseRepo.getResponseByTrigger(message.text);

    sender.addHistoryRecord(response ? response.id : null);

    if (!response) {
      this.handleUnusualMessage(sender, message);
      return;
    }

    this.sendApi.sendMessage({ id: sender.id }, response.create({ sender, message }));
  }

  handlePostbackEvent(sender: User, postback: any): void {
    console.log('postbackEvent', postback);
    this.handleMessageEvent(sender, postback);
  }

  handleAttachmentEvent(sender: User, attachments: any[]): void {
    console.log('attachmentEvent', attachments);
    this.handleMessageEvent(sender, { text: 'attachment' });
  }

  handleUnusualMessage(sender: User, content: any): void {
    if (content.text || sender.getLastHistoryRecord() === new Configure().id) {
      this.sendApi.sendMessage({ id: sender.id }, new TextMessage('Konfiguracja w toku'));
    } else {
      this.sendApi.sendMessage({ id: sender.id }, new TextMessage('Nie obsługiwane polecenie'));
    }
  }
}
