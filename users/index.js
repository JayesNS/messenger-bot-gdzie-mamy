'use strict';

class User {
  constructor(senderPsid) {
    this.senderPsid = senderPsid;
    this.groups = [];
    this.botMessagingHistory = [];
  }

  addGroup(groupName) {
    this.groups.push(groupName);
  }

  addMessagingHistoryRecord(responseName) {
    this.botMessagingHistory.unshift(responseName);
    console.log('history', responseName, this.botMessagingHistory);
  }

  getLastMessagingHistoryRecord() {
    // console.log('history', this.botMessagingHistory);
    return this.botMessagingHistory[0];
  }
}

class UserRepo {
  constructor() {
    this.users = [];

    console.log('repo', this.users);
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
}

module.exports = { User, UserRepo };
