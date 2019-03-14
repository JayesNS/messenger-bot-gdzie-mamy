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
const ScheduleApi_1 = require("../ScheduleApi");
const NotConfigured_1 = require("./NotConfigured");
const helpers_1 = require("../../helpers");
const messages_1 = require("../messages");
const NoLectures_1 = require("./NoLectures");
const FindSchedule_1 = require("./FindSchedule");
function activityContent(activity) {
    const time = `${activity.startTime}-${activity.endTime}`;
    const activityType = ` ${activity.type}`;
    const activityName = `${activityType} z "${activity.name}"`;
    const room = ` w sali ${activity.place}`;
    const person = ` z ${activity.person}`;
    return `W godzinach ${time} masz${activity.name ? activityName : activityType}${activity.person ? person : ''}${activity.place ? room : ''}`;
}
class FindActivity {
    constructor() {
        this.scheduleApi = new ScheduleApi_1.ScheduleApi();
        this.id = 'FIND_ACTIVITY';
        this.triggeredBy = [this.id];
        this.create = (payload) => __awaiter(this, void 0, void 0, function* () {
            const sender = payload.sender;
            const groupId = sender.groups[0].id;
            if (!groupId) {
                return new NotConfigured_1.NotConfigured().create();
            }
            const nlp = payload.message.nlp;
            const nlpDatetime = (nlp && nlp.entities.datetime[0]) || null;
            const datetime = new Date((nlp && nlpDatetime.value) || ScheduleApi_1.ScheduleApi.serverDatetime);
            const activity = yield this.scheduleApi.getActivity(groupId, payload.offset || 'current', datetime);
            if (!activity) {
                return new NoLectures_1.NoLectures().create();
            }
            const activityDatetime = new Date(activity.date + 'T' + activity.startTime);
            activity.minutesToStart =
                (activityDatetime.getTime() - ScheduleApi_1.ScheduleApi.serverDatetime.getTime()) / 1000 / 60;
            const isActivityToday = helpers_1.Helpers.compareOnlyDates(activityDatetime, ScheduleApi_1.ScheduleApi.serverDatetime);
            const isSenderLate = activity.minutesToStart < 0 && activity.minutesToStart > -45;
            const isTooLate = activity.minutesToStart < -45;
            const isActivityInOneHour = activity.minutesToStart < 60 && !isSenderLate;
            const lateness = isSenderLate ? Math.round(Math.abs(activity.minutesToStart)) : 0;
            if (isSenderLate) {
                const scaryEmote = lateness > 15 ? '😱' : '😨';
                return new messages_1.TextMessage(`Jesteś spóźniony ${lateness} minut. ${scaryEmote} ${activityContent(activity)}`);
            }
            else if (isTooLate) {
                return new messages_1.TextMessage(`Jesteś spóźniony więcej niż 45 minut. Możesz sprawdzić co masz później. ;)`, [new messages_1.QuickReply('Co potem?')]);
            }
            else if (isActivityInOneHour) {
                const beforeLectureStart = activity.minutesToStart > 0
                    ? `Masz jeszcze ${activity.minutesToStart} minut do następnych zajęć.`
                    : '';
                const stillEnoughTime = activity.minutesToStart > 30 ? '☕' : '';
                return new messages_1.TextMessage(`${beforeLectureStart} ${stillEnoughTime} ${activityContent(activity)}`);
            }
            else if (isActivityToday) {
                const whereLostRoomIsButton = activity.place === '30 koło kortów' ? [new messages_1.QuickReply('30 koło kortów')] : undefined;
                return new messages_1.TextMessage(activityContent(activity), whereLostRoomIsButton);
            }
            else {
                return new FindSchedule_1.FindSchedule().create(payload);
            }
        });
    }
}
exports.FindActivity = FindActivity;
//# sourceMappingURL=FindActivity.js.map