import { Message, SenderAction } from '../../models';

export class TypingOffMessage implements Message {
  sender_action: SenderAction = 'typing_off';
}
