import { Message, SenderAction } from '../../models';

export class MarkSeenMessage implements Message {
  sender_action: SenderAction = 'mark_seen';
}
