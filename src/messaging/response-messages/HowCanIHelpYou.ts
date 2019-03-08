import { ResponseMessage } from '../../models';
import { TextMessage, QuickReply } from '../messages';

export class HowCanIHelpYou implements ResponseMessage {
  readonly id: string = 'HOW_CAN_I_HELP_YOU';
  triggeredBy = ['halo'];
  create = () =>
    new TextMessage('Tu Gdzie Mamy. Jak mogę pomóc?', [
      new QuickReply('Gdzie mamy?'),
      new QuickReply('Skonfiguruj')
    ]);
}
