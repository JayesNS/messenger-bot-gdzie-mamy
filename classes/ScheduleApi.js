`use strict`;

const request = require('request');
const { Helpers } = require('./Helpers');

class ScheduleApi {
  constructor() {
    this.apiUrl = 'https://gdziemamy.jsthats.me/api';
  }

  findGroup(groupName) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiUrl}/groups/${groupName}/5`;
      request(encodeURI(url), (err, res, data) => {
        if (!err) {
          resolve(JSON.parse(data));
        } else {
          reject(err);
        }
      });
    });
  }

  findActivity(groupId, offset = 'nearest', datetime = new Date()) {
    if (offset !== 'nearest' && offset !== 'later') {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      const url = `${this.apiUrl}/group/${groupId}/lecture/${offset}/${datetime}`;
      request(encodeURI(url), (err, res, data) => {
        if (err) {
          reject(err);
        }

        resolve(Helpers.returnNullIfObjectEmpty(JSON.parse(data)));
      });
    });
  }
}

module.exports = { ScheduleApi };
