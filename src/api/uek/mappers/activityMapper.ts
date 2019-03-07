import { Mapper } from '.';
import { Activity } from '../../../models';

export const activityMapper: Mapper<Activity> = (activity: any) =>
  new Activity().deserialize({
    date: activity['termin'],
    startTime: activity['od-godz'],
    endTime: activity['do-godz'],
    name: activity['przedmiot'],
    type: activity['typ'],
    person: activity['nauczyciel'] ? activity['nauczyciel']['$t'] : null,
    place: activity['sala']
  });
