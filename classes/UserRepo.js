'use strict';

const fs = require('fs'),
  path = require('path'),
  { User } = require('./User');

const usersDataPath = path.join(__dirname, '../data/users.json');
class UserRepo {
  constructor() {
    this.users = {};
    this.load()
      .then(users => {
        users = Object.keys(users)
          .map(senderId => users[senderId])
          .map(user => new User(user.id, user.groups, user.botMessagingHistory));

        users.forEach(user => (this.users[user.id] = user));
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
    if (this.hasUser(senderPsid)) {
      return this.users[senderPsid];
    } else {
      return this.addUser(new User(senderPsid));
    }
  }

  updateUser(user) {
    this.users[user.id] = user;
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

module.exports = { UserRepo };
