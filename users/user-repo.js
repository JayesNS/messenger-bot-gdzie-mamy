'use strict';

const fs = require('fs');

const repoFileLocation = './data/user-repo.json';
class UserRepo {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    return (this.users[user.senderPsid] = user);
  }

  getUser(senderPsid) {
    return this.users[senderPsid];
  }

  updateUser(user) {
    this.users[user.senderPsid] = user;
  }

  hasUser(senderPsid) {
    return !!this.users[senderPsid];
  }

  load() {
    console.log('load repo', this.users);
  }
  save() {
    console.log('save repo', this.users);
  }
}

module.exports = UserRepo;
