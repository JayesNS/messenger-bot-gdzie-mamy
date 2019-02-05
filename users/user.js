'user strict';

class User {
  constructor(senderPsid, groups, botMessagingHistory) {
    this.senderPsid = senderPsid;
    this.groups = groups || [];
    this.botMessagingHistory = botMessagingHistory || [];
  }

  addGroup(groupName) {
    this.groups[0] = groupName;
  }

  addMessagingHistoryRecord(responseName) {
    this.botMessagingHistory.unshift(responseName);
  }

  getLastMessagingHistoryRecord() {
    return this.botMessagingHistory[0];
  }
}

module.exports = User;
