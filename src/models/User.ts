import { Group } from './Group';

export class User {
  groups: Group[];
  botMessagingHistory: string[];

  constructor(public id: number) {
    this.groups = [];
    this.botMessagingHistory = [];
  }

  addGroup(group: Group): void {
    this.groups[0] = group;
  }

  // TODO: add proper responseName type when message repo created
  addMessagingHistoryRecord(responseName: string): void {
    this.botMessagingHistory.unshift(responseName);
  }

  hasGroups(): boolean {
    return this.groups.length > 0;
  }

  // TODO: add proper responseName type when message repo created
  getLastMessagingHistoryRecord(): string {
    return this.botMessagingHistory[0];
  }
}
