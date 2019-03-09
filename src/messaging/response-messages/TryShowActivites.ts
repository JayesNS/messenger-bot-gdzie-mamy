import { ResponseMessage, User } from '../../models';
import { NotConfigured } from '.';
import { FindSchedule } from './FindSchedule';

export class TryShowActivities implements ResponseMessage {
  id = 'TRY_SHOW_ACTIVITES';
  triggeredBy = text => new RegExp('((gdzie|co) ?mamy)|(gdziemamy)', '').test(text);
  create = async (payload: { sender: User; message: any }) => {
    const sender: User = payload.sender;
    if (sender.hasGroups()) {
      return await new FindSchedule().create({ sender, message: payload.message });
    } else {
      return await new NotConfigured().create();
    }
  };
}
