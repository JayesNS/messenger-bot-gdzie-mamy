`use strict`;

const request = require('request');
const { Helpers } = require('./Helpers');

class ScheduleApi {
  constructor(apiBaseUrl) {
    this.apiUrl = apiBaseUrl;
  }

  getGroup(groupName) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiUrl}/groups/${encodeURIComponent(groupName)}/5`;
      request(url, (err, res, data) => {
        if (!err) {
          resolve(JSON.parse(data));
        } else {
          reject(err);
        }
      });
    });
  }

  getSchedule(groupId, datetime = new Date()) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiUrl}/group/${groupId}/schedule/${datetime}`;
      request(encodeURI(url), (err, res, data) => {
        if (err) {
          reject(err);
        }

        resolve(Helpers.returnNullIfObjectEmpty(JSON.parse(data)));
      });
    });
  }

  getActivity(groupId, offset = 'nearest', datetime = new Date()) {
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
