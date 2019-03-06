import { Group, Schedule } from '../models';

export interface Api {
  getAllGroups(): Promise<Group[]>;
  getScheduleByGroupId(groupId: number): Promise<Schedule>;
  getGroupsByName(groupName: string, limitAmount?: number): Promise<Group[]>;
}
