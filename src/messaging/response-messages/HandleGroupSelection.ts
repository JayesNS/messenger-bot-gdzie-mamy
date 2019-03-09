import { ResponseMessage, User, Group } from '../../models';
import { TextMessage, QuickReply } from '../messages';
import { ScheduleApi } from '../ScheduleApi';
import { Configure } from './Configure';

export class HandleGroupSelection implements ResponseMessage {
  id = 'HANDLE_GROUP_SELECTION';
  triggeredBy = [];
  scheduleApi = new ScheduleApi();
  create = async (payload: { sender: User; message: { text: string } }) => {
    const groupName: string = payload.message.text;
    const matchingGroups: Group[] = await this.scheduleApi.getMatchingGroups(groupName);
    const sender: User = payload.sender;

    if (matchingGroups.length === 0) {
      sender.addHistoryRecord(new Configure().id);
      return new TextMessage(
        'Nie znaleziono podanej przez ciebie grupy. Spróbuj wpisać ją jeszcze raz albo wklej jej nazwę z planu.'
      );
    } else if (matchingGroups.length === 1) {
      const group: Group = matchingGroups[0];
      sender.addGroup(group);
      sender.addHistoryRecord('GROUP_ADDED');
      return new TextMessage('Dodano pomyślnie grupę ' + group.name, [
        new QuickReply('Gdzie mamy?')
      ]);
    } else if (matchingGroups.length > 1) {
      const quickReplies: QuickReply[] = matchingGroups.map(
        (group: Group) => new QuickReply(group.name)
      );
      sender.addHistoryRecord(new Configure().id);
      return new TextMessage(
        'Należysz do którejś z tych grup? Jeśli nie to wpisz poprawną nazwę lub sprawdź ją w planie.',
        quickReplies
      );
    }
  };
}
