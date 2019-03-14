"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = require("../users");
class User {
    constructor(id) {
        this.id = id;
        this.groups = [];
        this.botMessagingHistory = [];
        users_1.LocalUserRepo.Instance.save();
    }
    addGroup(group) {
        this.groups[0] = group;
        users_1.LocalUserRepo.Instance.save();
    }
    hasGroups() {
        return this.groups.length > 0;
    }
    addHistoryRecord(responseName) {
        this.botMessagingHistory.unshift(responseName);
        users_1.LocalUserRepo.Instance.save();
    }
    getLastHistoryRecord() {
        return this.botMessagingHistory[0];
    }
    deserialize(object) {
        Object.assign(this, object);
        return this;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map