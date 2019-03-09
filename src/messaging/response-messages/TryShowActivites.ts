import { ResponseMessage, User } from '../../models';
import { TextMessage } from '../messages/TextMessage';
import { NotConfigured } from '.';

export class TryShowActivities implements ResponseMessage {
  id = 'TRY_SHOW_ACTIVITES';
  triggeredBy = text => new RegExp('((gdzie|co) ?mamy)|(gdziemamy)', '').test(text);
  create = async (payload: { sender: User }) => {
    const sender: User = payload.sender;
    if (sender.hasGroups()) {
      return new TextMessage('hej');
      //   SendApi.sendMessageFromTemplate(Messages['FIND_ACTIVITY'], { message, offset: 'nearest' });
    } else {
      return await new NotConfigured().create();
    }
  };
}
