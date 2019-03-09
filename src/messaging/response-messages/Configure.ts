import { ResponseMessage } from '../../models';
import { ButtonMessage, Button } from '../messages';

export class Configure implements ResponseMessage {
  readonly id = 'CONFIGURE';
  triggeredBy = [this.id, 'skonfiguruj', 'konfiguruj'];
  create = async () =>
    new ButtonMessage(
      'Teraz wpisz nazwę swojej grupy. Najlepiej jeśli wkleisz ją tutaj z planu zajęć ;)',
      [new Button('Otwórz plan', 'http://planzajec.uek.krakow.pl?typ=G')]
    );
}
