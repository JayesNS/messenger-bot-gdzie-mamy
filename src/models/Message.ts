export type SenderAction = 'mark_seen' | 'typing_on' | 'typing_off';
export type Recipient = { id: number };

export interface Message {
  recipient: Recipient;
  sender_action?: SenderAction;
  message?: { text: string };
}
