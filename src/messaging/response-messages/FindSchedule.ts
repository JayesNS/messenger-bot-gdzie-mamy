import { ResponseMessage, Message, User } from '../../models';
import { TextMessage } from '../messages';
import { NotConfigured } from './NotConfigured';

export class FindSchedule implements ResponseMessage {
  readonly id = 'FIND_SCHEDULE';
  triggeredBy = text => new RegExp(' plan', 'i').test(text);
  create = (payload: { sender: User }) => {
    const groupId = payload.sender.groups[0];
    if (!groupId) {
      return new NotConfigured().create();
    }

    return new TextMessage(payload.sender.groups[0].name);
  };
}

/*
let groupId = message.sender.groups[0].id;
    
          datetime = new Date(datetime);
          if (message.hasNlpEntities('datetime')) {
            datetime = new Date(message.getFirstNlpEnitityOfType('datetime'));
          }
    
          const activityDate = Helpers.getOnlyDate(new Date(datetime));
          const currentDate = Helpers.getOnlyDate(new Date());
    
          const isActivityFromThePast = activityDate - currentDate < 0 ? true : false;
    
          scheduleApi.getSchedule(groupId, datetime).then(schedule => {
            if (isActivityFromThePast) {
              SendApi.sendMessage(Template.textMessage('Ten dzień już minął, ale przypomnę ci plan.'), {
                message
              });
            } else if (schedule.length > 4) {
              SendApi.sendMessage(
                Template.textMessage(`Ten dzień wygląda na ciężki... Powodzenia! :'(`),
                {
                  message
                }
              );
            } else {
              SendApi.sendMessage(
                Template.textMessage('Tak wygląda plan twojej grupy na ten dzień. ;)'),
                {
                  message
                }
              );
            }
    
            if (schedule) {
              const sortedScheduleString = schedule
                .sort((a, b) => a.startTime > b.startTime)
                .map(
                  activity =>
                    `${activity.startTime} - ${activity.endTime} ${activity.name} w ${activity.room}`
                );
              const timeout = setTimeout(() => {
                SendApi.sendMessage(Template.textMessage(sortedScheduleString.join('\n')), { message });
                clearTimeout(timeout);
              }, 500);
            } else {
              SendApi.sendMessageFromTemplate(Messages['NO_LECTURES_TODAY'], { message });
            }
          });
        }
      } */
