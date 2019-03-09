import { Message, SenderAction } from '../../models';

export class QuickReply {
  content_type: string;
  title: string;
  payload: any;

  constructor(title: string, payload?: string) {
    this.content_type = 'text';
    this.payload = payload || title;
    this.title = title;
  }
}

export class TextMessage implements Message {
  sender_action?: SenderAction;
  message?: { text: string; quick_replies: QuickReply[] };

  constructor(messageBody: string, quickReplies?: QuickReply[]) {
    this.message = { text: messageBody, quick_replies: quickReplies || undefined };
  }
}
