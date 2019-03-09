import { Group, Activity } from '../models';
import { Helpers } from '../helpers';

export class ScheduleApi {
  private url: string;
  public static serverDatetime: Date;

  constructor(serverDatetime?: Date) {
    ScheduleApi.serverDatetime = serverDatetime ? serverDatetime : new Date();
    this.url = 'http://localhost:1337/api';
  }

  async getMatchingGroups(groupName: string): Promise<Group[]> {
    const url = `${this.url}/groups/${encodeURIComponent(groupName)}/5`;
    const data: any = await Helpers.makeRequest({ uri: url });
    return Helpers.parse<Group[]>(data);
  }

  async getActivites(groupId: number, datetime: Date = new Date()): Promise<Activity[]> {
    const url = `${this.url}/groups/${groupId}/schedule/${encodeURIComponent(
      datetime.toUTCString()
    )}`;
    const data: any = await Helpers.makeRequest({ uri: url });
    return Helpers.parse<Activity[]>(data);
  }

  async getActivity(
    groupId: number,
    offset: 'current' | 'next' = 'current',
    datetime: Date = new Date()
  ) {
    const url = `${this.url}/groups/${groupId}/activity/${offset}/${encodeURIComponent(
      datetime.toUTCString()
    )}`;
    const data: any = await Helpers.makeRequest({ uri: url });
    console.log({ url, data });
    return data ? Helpers.parse<Activity>(data) : null;
  }
}
