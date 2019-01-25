'user strict';

class User {
  constructor(senderPsid) {
    this.senderPsid = senderPsid;
    this.groups = [];
    this.botMessagingHistory = [];
  }

  addGroup(groupName) {
    this.groups[0] = groupName;
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

module.exports = User;
