import { ResponseMessage } from '../../models';
import { TextMessage, QuickReply } from '../messages';

export class NotConfigured implements ResponseMessage {
  readonly id = 'NOT_CONFIGURED';
  triggeredBy = ['NOT_CONFIGURED'];
  create = () =>
    new TextMessage(
      'Nie należysz jeszcze do żadnej grupy. Kliknij w poniższy przycisk, aby to dodać. ;)',
      [new QuickReply('Skonfiguruj')]
    );
}
