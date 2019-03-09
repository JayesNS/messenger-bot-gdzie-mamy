import { ResponseMessage, User, Activity } from '../../models';
import { TextMessage } from '../messages';
import { NotConfigured } from './NotConfigured';
import { Helpers } from '../../helpers';
import { ScheduleApi } from '../ScheduleApi';
import { NoLectures } from './NoLectures';

export class FindSchedule implements ResponseMessage {
  scheduleApi: ScheduleApi = new ScheduleApi(new Date());

  readonly id = 'FIND_SCHEDULE';
  triggeredBy = text => new RegExp(' plan', 'i').test(text);
  create = async (payload: { sender: User; message: any }) => {
    const groupId = payload.sender.groups[0].id;
    if (!groupId) {
      return new NotConfigured().create();
    }

    const nlp = payload.message.nlp;
    const nlpDatetime = (nlp && nlp.entities.datetime[0]) || null;
    const datetime = new Date((nlp && nlpDatetime.value) || ScheduleApi.serverDatetime);

    const activityDate = Helpers.onlyDate(new Date(datetime));
    const currentDate = Helpers.onlyDate(ScheduleApi.serverDatetime);

    const activities: Activity[] = await this.scheduleApi.getActivites(groupId, datetime);
    const isActivityFromThePast = activityDate.getTime() - currentDate.getTime() < 0 ? true : false;

    if (activities.length === 0) {
      return new NoLectures().create();
    }

    let responseMessage: string = '';
    if (isActivityFromThePast) {
      responseMessage = 'Ten dzień już minął, ale przypomnę ci plan.';
    } else if (activities.length > 4) {
      responseMessage = `Ten dzień wygląda na ciężki... Powodzenia! :'(`;
    } else if (activities) {
      responseMessage = 'Tak wygląda plan twojej grupy na ten dzień. ;)';
    }

    console.log({ activities });
    if (activities) {
      responseMessage = activities
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .reduce(
          (res, activity) =>
            res +
            `\n${activity.startTime} - ${activity.endTime} ${activity.name} w ${activity.place}`,
          responseMessage + '\n'
        );
      return new TextMessage(responseMessage);
    } else if (!activities) {
      return await new NoLectures().create();
    }

    console.log({ groupId, nlp, datetime: new Date((nlp && nlpDatetime.value) || Date.now()) });

    return new TextMessage(payload.sender.groups[0].name);
  };
}
