"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../messages");
const ScheduleApi_1 = require("../ScheduleApi");
const Configure_1 = require("./Configure");
class HandleGroupSelection {
    constructor() {
        this.id = 'HANDLE_GROUP_SELECTION';
        this.triggeredBy = [];
        this.scheduleApi = new ScheduleApi_1.ScheduleApi();
        this.create = (payload) => __awaiter(this, void 0, void 0, function* () {
            const groupName = payload.message.text;
            const matchingGroups = yield this.scheduleApi.getMatchingGroups(groupName);
            const sender = payload.sender;
            if (matchingGroups.length === 0) {
                sender.addHistoryRecord(new Configure_1.Configure().id);
                return new messages_1.TextMessage('Nie znaleziono podanej przez ciebie grupy. Spróbuj wpisać ją jeszcze raz albo wklej jej nazwę z planu.');
            }
            else if (matchingGroups.length === 1) {
                const group = matchingGroups[0];
                sender.addGroup(group);
                sender.addHistoryRecord('GROUP_ADDED');
                return new messages_1.TextMessage('Dodano pomyślnie grupę ' + group.name, [
                    new messages_1.QuickReply('Gdzie mamy?')
                ]);
            }
            else if (matchingGroups.length > 1) {
                const quickReplies = matchingGroups.map((group) => new messages_1.QuickReply(group.name));
                sender.addHistoryRecord(new Configure_1.Configure().id);
                return new messages_1.TextMessage('Należysz do którejś z tych grup? Jeśli nie to wpisz poprawną nazwę lub sprawdź ją w planie.', quickReplies);
            }
        });
    }
}
exports.HandleGroupSelection = HandleGroupSelection;
//# sourceMappingURL=HandleGroupSelection.js.map