import { Message, SenderAction } from '../../models';

export class TypingOnMessage implements Message {
  sender_action: SenderAction = 'typing_on';
}
