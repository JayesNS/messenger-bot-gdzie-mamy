import { Attachment } from '../messaging/messages';

export type SenderAction = 'mark_seen' | 'typing_on' | 'typing_off';
export type Recipient = { id: number };

export interface Message {
  sender_action?: SenderAction;
  message?: { text?: string; attachment?: Attachment };
}
