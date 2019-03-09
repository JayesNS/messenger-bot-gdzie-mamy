import { Activity } from '../../../models';
import { Selector } from './Selector';
import { Helpers } from '../../../helpers';

export const selectActivitiesFromDate: Selector<Activity[]> = (
  activites: Activity[],
  datetime: Date
) =>
  activites.filter((activity: Activity) =>
    Helpers.compareOnlyDates(new Date(activity.date), datetime)
  );
