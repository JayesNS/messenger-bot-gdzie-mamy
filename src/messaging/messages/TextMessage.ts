import { Message, SenderAction } from '../../models';

export class QuickReply {
  content_type: string = 'text';

  constructor(public title: string, public payload?: string) {
    this.payload = this.payload || this.title;
  }
}

export class TextMessage implements Message {
  sender_action?: SenderAction;
  message?: { text: string; quick_replies: QuickReply[] };

  constructor(messageBody: string, quickReplies?: QuickReply[]) {
    this.message = { text: messageBody, quick_replies: quickReplies || undefined };
  }
}
