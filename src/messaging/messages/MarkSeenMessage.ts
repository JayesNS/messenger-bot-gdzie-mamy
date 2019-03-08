import { Message, Recipient, SenderAction } from '../../models';

export class MarkSeenMessage implements Message {
  recipient: Recipient;
  sender_action: SenderAction = 'mark_seen';

  constructor(recipientId: number) {
    this.recipient = { id: recipientId };
  }
}
