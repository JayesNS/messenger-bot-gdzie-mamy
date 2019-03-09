import { ResponseMessage } from '../../models';
import { FindActivity } from './FindActivity';

export class FindNextActivity implements ResponseMessage {
  id = 'FIND_LATER_LECTURE';
  triggeredBy = text => new RegExp('(następni?e)|(później)|(potem)|(zaraz)').test(text);
  create = async payload => new FindActivity().create({ ...payload, offset: 'next' });
}
