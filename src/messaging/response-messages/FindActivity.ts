import { ResponseMessage, User, Activity } from '../../models';
import { ScheduleApi } from '../ScheduleApi';
import { NotConfigured } from './NotConfigured';
import { Helpers } from '../../helpers';
import { TextMessage, QuickReply } from '../messages';
import { NoLectures } from './NoLectures';
import { FindSchedule } from './FindSchedule';

function activityContent(activity: Activity) {
  const time = `${activity.startTime}-${activity.endTime}`;
  const activityType = ` ${activity.type}`;
  const activityName = `${activityType} z "${activity.name}"`;
  const room = ` w sali ${activity.place}`;
  const person = ` z ${activity.person}`;
  return `W godzinach ${time} masz${activity.name ? activityName : activityType}${
    activity.person ? person : ''
  }${activity.place ? room : ''}`;
}

export class FindActivity implements ResponseMessage {
  scheduleApi: ScheduleApi = new ScheduleApi();

  id = 'FIND_ACTIVITY';
  triggeredBy = [this.id];
  create = async (payload: { sender: User; message: any; offset: 'current' | 'next' }) => {
    const sender = payload.sender;
    const groupId = sender.groups[0].id;
    if (!groupId) {
      return new NotConfigured().create();
    }

    const nlp = payload.message.nlp;
    const nlpDatetime = (nlp && nlp.entities.datetime[0]) || null;
    const datetime = new Date((nlp && nlpDatetime.value) || ScheduleApi.serverDatetime);

    const activity: Activity = await this.scheduleApi.getActivity(
      groupId,
      payload.offset || 'current',
      datetime
    );

    if (!activity) {
      return new NoLectures().create();
    }

    const activityDatetime = new Date(activity.date + 'T' + activity.startTime);
    activity.minutesToStart =
      (activityDatetime.getTime() - ScheduleApi.serverDatetime.getTime()) / 1000 / 60;

    const isActivityToday = Helpers.compareOnlyDates(activityDatetime, ScheduleApi.serverDatetime);
    const isSenderLate = activity.minutesToStart < 0 && activity.minutesToStart > -45;
    const isTooLate = activity.minutesToStart < -45;
    const isActivityInOneHour = activity.minutesToStart < 60 && !isSenderLate;
    const lateness = isSenderLate ? Math.round(Math.abs(activity.minutesToStart)) : 0;

    if (isSenderLate) {
      const scaryEmote = lateness > 15 ? '😱' : '😨';
      return new TextMessage(
        `Jesteś spóźniony ${lateness} minut. ${scaryEmote} ${activityContent(activity)}`
      );
    } else if (isTooLate) {
      return new TextMessage(
        `Jesteś spóźniony więcej niż 45 minut. Możesz sprawdzić co masz później. ;)`,
        [new QuickReply('Co potem?')]
      );
    } else if (isActivityInOneHour) {
      const beforeLectureStart =
        activity.minutesToStart > 0
          ? `Masz jeszcze ${activity.minutesToStart} minut do następnych zajęć.`
          : '';
      const stillEnoughTime = activity.minutesToStart > 30 ? '☕' : '';
      return new TextMessage(
        `${beforeLectureStart} ${stillEnoughTime} ${activityContent(activity)}`
      );
    } else if (isActivityToday) {
      const whereLostRoomIsButton =
        activity.place === '30 koło kortów' ? [new QuickReply('30 koło kortów')] : undefined;
      return new TextMessage(activityContent(activity), whereLostRoomIsButton);
    } else {
      return new FindSchedule().create(payload);
    }
  };
}
