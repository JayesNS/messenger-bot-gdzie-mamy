import { Selector } from './Selector';
import { Activity } from '../../../models';

export const selectUnfinishedActivites: Selector<Activity[]> = (
  activites: Activity[],
  datetime: Date
) =>
  activites.filter(
    (activity: Activity) =>
      new Date(activity.date + 'T' + activity.endTime).getTime() > datetime.getTime()
  );
