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
const NotConfigured_1 = require("./NotConfigured");
const helpers_1 = require("../../helpers");
const ScheduleApi_1 = require("../ScheduleApi");
const NoLectures_1 = require("./NoLectures");
class FindSchedule {
    constructor() {
        this.scheduleApi = new ScheduleApi_1.ScheduleApi(new Date());
        this.id = 'FIND_SCHEDULE';
        this.triggeredBy = text => new RegExp(' plan', 'i').test(text);
        this.create = (payload) => __awaiter(this, void 0, void 0, function* () {
            const groupId = payload.sender.groups[0].id;
            if (!groupId) {
                return new NotConfigured_1.NotConfigured().create();
            }
            const nlp = payload.message.nlp;
            const nlpDatetime = (nlp && nlp.entities.datetime[0]) || null;
            const datetime = new Date((nlp && nlpDatetime.value) || ScheduleApi_1.ScheduleApi.serverDatetime);
            const activityDate = helpers_1.Helpers.onlyDate(new Date(datetime));
            const currentDate = helpers_1.Helpers.onlyDate(ScheduleApi_1.ScheduleApi.serverDatetime);
            const activities = yield this.scheduleApi.getActivites(groupId, datetime);
            const isActivityFromThePast = activityDate.getTime() - currentDate.getTime() < 0 ? true : false;
            if (activities.length === 0) {
                return new NoLectures_1.NoLectures().create();
            }
            let responseMessage = '';
            if (isActivityFromThePast) {
                responseMessage = 'Ten dzień już minął, ale przypomnę ci plan.';
            }
            else if (activities.length > 4) {
                responseMessage = `Ten dzień wygląda na ciężki... Powodzenia! :'(`;
            }
            else if (activities) {
                responseMessage = 'Tak wygląda plan twojej grupy na ten dzień. ;)';
            }
            console.log({ activities });
            if (activities) {
                responseMessage = activities
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .reduce((res, activity) => res +
                    `\n${activity.startTime} - ${activity.endTime} ${activity.name} w ${activity.place}`, responseMessage + '\n');
                return new messages_1.TextMessage(responseMessage);
            }
            else if (!activities) {
                return yield new NoLectures_1.NoLectures().create();
            }
            console.log({ groupId, nlp, datetime: new Date((nlp && nlpDatetime.value) || Date.now()) });
            return new messages_1.TextMessage(payload.sender.groups[0].name);
        });
    }
}
exports.FindSchedule = FindSchedule;
//# sourceMappingURL=FindSchedule.js.map