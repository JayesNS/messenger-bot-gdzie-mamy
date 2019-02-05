'use strict';

const fs = require('fs'),
  path = require('path'),
  User = require('./user');

const usersDataPath = path.join(__dirname, '../data/users.json');
class UserRepo {
  constructor() {
    this.users = {};
    this.load()
      .then(users => {
        users = Object.keys(users)
          .map(senderPsid => users[senderPsid])
          .map(user => new User(user.senderPsid, user.groups, user.botMessagingHistory));

        users.forEach(user => (this.users[user.senderPsid] = user));
      })
      .catch(error => {
        this.save(this.users);
      });
  }

  addUser(user) {
    this.updateUser(user);
    return user;
  }

  getUser(senderPsid) {
    return this.users[senderPsid];
  }

  updateUser(user) {
    this.users[user.senderPsid] = user;
    this.save(this.users)
      .then(data => {})
      .catch(error => {});
  }

  hasUser(senderPsid) {
    return !!this.users[senderPsid];
  }

  load() {
    return new Promise((resolve, reject) => {
      fs.exists(usersDataPath, exists => {
        if (!exists) {
          reject();
        } else {
          fs.readFile(usersDataPath, 'utf-8', (err, data) => {
            if (err || !data) {
              reject(err);
            }
            resolve(JSON.parse(data));
          });
        }
      });
    });
  }
  save(users) {
    return new Promise((resolve, reject) => {
      fs.writeFile(usersDataPath, JSON.stringify(users), 'utf-8', (err, saved, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    });
  }
}

module.exports = UserRepo;
