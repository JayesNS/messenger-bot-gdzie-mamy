`use strict`;

const request = require('request');

class ApiHandler {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  findGroup(groupName) {
    return new Promise((resolve, reject) => {
      request(`${this.apiUrl}/groups/${encodeURIComponent(groupName)}/5`, (err, res, data) => {
        console.log('[GdzieMamy? API]', err, data);
        if (!err) {
          resolve(JSON.parse(data));
        } else {
          reject(err);
        }
      });
    });
  }

  findSchedule(groupId) {
    return new Promise((resolve, reject) => {
      request(`${this.apiUrl}/plans/${groupId}/today/next`, (err, res, data) => {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(data));
      });
    });
  }
}

module.exports = { ApiHandler };
