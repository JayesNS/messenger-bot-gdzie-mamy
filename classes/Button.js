`use strict`;

class Button {
  static openSchedule() {
    return {
      type: 'web_url',
      url: 'http://planzajec.uek.krakow.pl?typ=G',
      title: 'Otwórz plan'
    };
  }
}

module.exports = { Button };
