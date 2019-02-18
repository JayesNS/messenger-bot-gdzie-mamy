'use strict';

class User {
  constructor(senderId, groups, botMessagingHistory) {
    this.id = senderId;
    this.groups = groups || [];
    this.botMessagingHistory = botMessagingHistory || [];
  }

  addGroup(groupName) {
    this.groups[0] = groupName;
  }

  addMessagingHistoryRecord(responseName) {
    this.botMessagingHistory.unshift(responseName);
  }

  hasGroups() {
    return this.groups.length > 0;
  }

  getLastMessagingHistoryRecord() {
    return this.botMessagingHistory[0];
  }
}

module.exports = { User };
