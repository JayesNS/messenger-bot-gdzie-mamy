import { Selector } from './Selector';
import { Group } from '../../../models';

export const selectMatchingGroups: Selector<Group[]> = (data: Group[], payload: string) =>
  data.filter((group: Group) => group.name.toLowerCase().includes(payload.toLowerCase()));
