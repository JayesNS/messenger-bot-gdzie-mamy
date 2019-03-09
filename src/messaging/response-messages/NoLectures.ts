import { ResponseMessage } from '../../models';
import { TextMessage } from '../messages';

export class NoLectures implements ResponseMessage {
  readonly id = 'NO_LECTURES_TODAY';
  triggeredBy = [this.id];
  create = async () => new TextMessage('Tego dnia nie masz żadnych zajęć. :D');
}
