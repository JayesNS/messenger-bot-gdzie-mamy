import * as request from 'request';
import * as xml2json from 'xml2json';

import { Api } from '../Api';
import { Activity, Group } from '../../models';
import { groupMapper } from './mappers';
import {
  selectOnlyGroups,
  selectMatchingGroups,
  selectOnlyLectures,
  selectActivitiesFromDate
} from './selectors';
import { activityMapper } from './mappers/activityMapper';

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

  async getScheduleFromDateByGroupId(
    groupId: number,
    datetime: Date = new Date()
  ): Promise<Activity[]> {
    const fullSchedule = await this.getFullScheduleByGroupId(groupId);
    const activitiesFromDate = selectActivitiesFromDate(fullSchedule, datetime);
    return activitiesFromDate;
  }

  private getJSONFromUrl(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          reject(error);
        }

        const data = JSON.parse(this.convertXmlToJsonString(body));
        resolve(data);
      });
    });
  }

  private convertXmlToJsonString(rawXML) {
    return xml2json.toJson(rawXML);
  }
}
