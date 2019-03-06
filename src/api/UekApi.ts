import * as request from 'request';
import * as xml2json from 'xml2json';

import { Api } from './Api';
import { Schedule, Group } from '../models';
import { groupMapper, Mapper } from './mappers';
import { selectOnlyGroups, Selector } from './selectors';
import { selectMatchingGroups } from './selectors/selectMatchingGroups';

export class UekApi implements Api {
  private apiUrl: string;

  constructor() {
    this.apiUrl = 'http://planzajec.uek.krakow.pl';
  }

  async getAllGroups(): Promise<Group[]> {
    const url = `${this.apiUrl}?typ=G&xml`;
    const data = await this.getJSONFromUrl(url);
    const rawGroups: any = selectOnlyGroups(data);
    const groups: Group[] = rawGroups.map(groupMapper);

    return groups;
  }
  async getGroupsByName(groupName: string, limitAmount: number = 3): Promise<Group[]> {
    const url = `${this.apiUrl}?typ=G&xml`;
    const groups: Group[] = await this.getAllGroups();
    const matchingGroups: Group[] = selectMatchingGroups(groups, groupName);
    return matchingGroups.slice(0, limitAmount);
  }
  getScheduleByGroupId(groupId: number): Promise<Schedule> {
    return Promise.reject();
  }

  private getJSONFromUrl(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          reject(error);
        }

        const data = this.convertXMLToJSON(body);
        resolve(data);
      });
    });
  }

  private convertXMLToJSON(rawXML) {
    return JSON.parse(xml2json.toJson(rawXML));
  }
}
