import { Group, Activity } from '../models';

export enum TimeOffset {
  CURRENT,
  NEXT
}

export interface Api {
  getAllGroups(): Promise<Group[]>;
  getScheduleByGroupId(groupId: number, datetime?: Date): Promise<Activity[]>;
  getGroupsByName(groupName: string, limitAmount?: number): Promise<Group[]>;
  getActivityByGroupId(groupId: number, timeOffset: TimeOffset, datetime?: Date): Promise<Activity>;
}
