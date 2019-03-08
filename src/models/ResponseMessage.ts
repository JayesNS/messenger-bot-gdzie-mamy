import { Message } from './Message';

export type Trigger = string[] | Function;

export interface ResponseMessage {
  id: string;
  triggeredBy: Trigger;
  create: (payload?: any) => Message;
}
