import * as request from 'request';
import * as xml2json from 'xml2json';

import { Api, TimeOffset } from '../Api';
import { Activity, Group } from '../../models';
import { groupMapper } from './mappers';
import {
  selectOnlyGroups,
  selectMatchingGroups,
  selectOnlyLectures,
  selectActivitiesFromDate,
  selectUnfinishedActivites
} from './selectors';
import { activityMapper } from './mappers/activityMapper';
import { Helpers } from '../../helpers';

export class UekApi implements Api {
  private apiUrl: string;

  constructor() {
    this.apiUrl = 'http://planzajec.uek.krakow.pl';
  }

  async getAllGroups(): Promise<Group[]> {
    const url: string = `${this.apiUrl}?typ=G&xml`;
    const data: any = await this.getJSONFromUrl(url);
    const rawGroups: any = selectOnlyGroups(data);
    const groups: Group[] = rawGroups.map(groupMapper);
    return groups;
  }

  /**
   * @param threshold Defines how narrow group amount should be.
   * If groups length is greater than treshold,
   * function will return empty array which means that too many groups have been found
   */
  async getGroupsByName(groupName: string, threshold: number = 3): Promise<Group[]> {
    const groups: Group[] = await this.getAllGroups();
    const matchingGroups: Group[] = selectMatchingGroups(groups, groupName);
    return matchingGroups.length < threshold ? matchingGroups : [];
  }

  async getFullScheduleByGroupName(groupName: string) {}

  async getFullScheduleByGroupId(groupId: number): Promise<Activity[]> {
    const url: string = `${this.apiUrl}?typ=G&id=${groupId}&okres=3&xml`;
    const data: any = await this.getJSONFromUrl(url);
    const rawLectures: any = selectOnlyLectures(data);
    const lectures: Activity[] = rawLectures.map(activityMapper);
    return lectures;
  }

  async getScheduleByGroupId(groupId: number, datetime: Date = new Date()): Promise<Activity[]> {
    const fullSchedule: Activity[] = await this.getFullScheduleByGroupId(groupId);
    const activitiesFromDate: Activity[] = selectActivitiesFromDate(fullSchedule, datetime);
    return activitiesFromDate;
  }

  async getActivityByGroupId(groupId: number, timeOffset: TimeOffset): Promise<Activity> {
    const schedule: Activity[] = await this.getScheduleByGroupId(groupId);
    const activities: Activity[] = selectUnfinishedActivites(schedule, new Date());
    return activities[timeOffset];
  }

  private async getJSONFromUrl(url: string): Promise<any> {
    const data = await Helpers.makeRequest({ uri: url });
    return JSON.parse(Helpers.convertXmlToJsonString(data));
  }
}
