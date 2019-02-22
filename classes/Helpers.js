`use strict`;

class Helpers {
  static returnNullIfObjectEmpty(object) {
    return typeof object === 'object' && Object.keys(object).length === 0 ? null : object;
  }

  static timeDifferenceInMinutes(time1, time2) {
    return (new Date(time1).getTime() - new Date(time2).getTime()) / 1000 / 60;
  }

  static compareOnlyDates(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  static getOnlyDate(datetime) {
    return new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate());
  }

  static createTimestamp(date, time) {
    return new Date(`${date}T${time}`);
  }
}

module.exports = { Helpers };
