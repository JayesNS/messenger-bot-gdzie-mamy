import { Group, Activity } from '../models';

export interface Api {
  getAllGroups(): Promise<Group[]>;
  getScheduleFromDateByGroupId(groupId: number, datetime?: Date): Promise<Activity[]>;
  getGroupsByName(groupName: string, limitAmount?: number): Promise<Group[]>;
}
