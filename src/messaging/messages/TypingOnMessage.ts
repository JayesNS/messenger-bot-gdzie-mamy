import { Message, SenderAction, Recipient } from '../../models';

export class TypingOnMessage implements Message {
  recipient: Recipient;
  sender_action: SenderAction = 'typing_on';

  constructor(recipientId: number) {
    this.recipient = { id: recipientId };
  }
}
