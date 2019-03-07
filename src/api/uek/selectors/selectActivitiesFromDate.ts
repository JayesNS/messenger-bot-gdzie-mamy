import { Activity } from '../../../models';
import { Selector } from './Selector';

function onlyDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function compareOnlyDates(date1: Date, date2: Date) {
  return onlyDate(date1).getTime() === onlyDate(date2).getTime();
}

export const selectActivitiesFromDate: Selector<Activity[]> = (
  activites: Activity[],
  datetime: Date
) => activites.filter((activity: Activity) => compareOnlyDates(new Date(activity.date), datetime));
