import { TSMap } from 'typescript-map';
import { ResponseMessage } from '../models';
import { isArray } from 'util';
import { HowCanIHelpYou, NotConfigured, FindSchedule } from './response-messages';
import { Configure } from './response-messages/Configure';

export class ResponseMessageRepo {
  private responseMessages: TSMap<string, ResponseMessage>;

  constructor() {
    this.responseMessages = new TSMap();

    this.addMultipleResponses([
      new HowCanIHelpYou(),
      new NotConfigured(),
      new FindSchedule(),
      new Configure()
    ]);
  }

  getResponseKeys(): string[] {
    return this.responseMessages.keys();
  }

  addMultipleResponses(responses: ResponseMessage[]) {
    responses.forEach((response: ResponseMessage) => this.addResponse(response));
  }

  addResponse(response: ResponseMessage): void {
    this.responseMessages.set(response.id, response);
  }

  getResponseById(id: string): ResponseMessage {
    return this.responseMessages.get(id);
  }

  getResponseByTrigger(trigger: string): ResponseMessage {
    const testTriggerByArray = (triggeredBy: string[]) =>
      triggeredBy.map((trigger: string) => trigger.toLowerCase()).includes(trigger.toLowerCase());
    const testTriggerByFunction = (triggeredBy: Function) => triggeredBy(trigger.toLowerCase());
    const findMatchingTrigger = ({ triggeredBy }) =>
      isArray(triggeredBy) ? testTriggerByArray(triggeredBy) : testTriggerByFunction(triggeredBy);
    const response = this.responseMessages.values().find(findMatchingTrigger);
    return response;
  }
}
