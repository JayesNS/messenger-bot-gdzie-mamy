import { Selector } from './Selector';

export const selectOnlyLectures: Selector<any> = (data: any) =>
  new Array()
    .concat(data['plan-zajec']['zajecia'])
    .filter(activity => activity['typ'] !== 'Przeniesienie zajęć');
