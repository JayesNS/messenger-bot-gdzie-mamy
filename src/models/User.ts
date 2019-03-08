import { Group } from './Group';
import { LocalUserRepo } from '../users';

export class User {
  groups: Group[];
  botMessagingHistory: string[];

  constructor(public id: number) {
    this.groups = [];
    this.botMessagingHistory = [];
    LocalUserRepo.Instance.save();
  }

  addGroup(group: Group): void {
    this.groups[0] = group;
    LocalUserRepo.Instance.save();
  }

  hasGroups(): boolean {
    return this.groups.length > 0;
  }

  addHistoryRecord(responseName: string): void {
    this.botMessagingHistory.unshift(responseName);
    LocalUserRepo.Instance.save();
  }
  getLastHistoryRecord(): string {
    return this.botMessagingHistory[0];
  }
}
