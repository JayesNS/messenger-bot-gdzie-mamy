`use strict`;

const request = require('request');
const { Helpers } = require('./Helpers');

class ApiHandler {
  constructor(apiUrl, currentTime) {
    this.apiUrl = apiUrl;
    this.currentTime = currentTime;
  }

  findGroup(groupName) {
    return new Promise((resolve, reject) => {
      request(`${this.apiUrl}/groups/${encodeURIComponent(groupName)}/5`, (err, res, data) => {
        if (!err) {
          resolve(JSON.parse(data));
        } else {
          reject(err);
        }
      });
    });
  }

  findTodaysLecture(groupId, offset) {
    if (offset !== 'nearest' && offset !== 'later') {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      const url = `${this.apiUrl}/group/${groupId}/lecture/${offset}/${this.currentTime || ''}`;
      request(url, (err, res, data) => {
        if (err) {
          reject(err);
        }

        resolve(Helpers.returnNullIfObjectEmpty(JSON.parse(data)));
      });
    });
  }
}

module.exports = { ApiHandler };
