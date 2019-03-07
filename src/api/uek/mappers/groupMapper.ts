import { Mapper } from '.';
import { Group } from '../../../models';

export const groupMapper: Mapper<Group> = group => ({
  id: group['id'],
  name: group['nazwa']
});
