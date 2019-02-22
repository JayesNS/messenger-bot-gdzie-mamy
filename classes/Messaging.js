`use strict`;

const { ScheduleApi, Button, Template, Helpers, SendApi, Message, UserRepo } = require('./');

const MessageName = {
  ASK_FOR_GROUP: 'ASK_FOR_GROUP',
  CONFIGURE: 'CONFIGURE',
  HOW_CAN_I_HELP_YOU: 'HOW_CAN_I_HELP_YOU',
  GROUP_FOUND: 'GROUP_FOUND',
  NO_MATCHING_GROUPS: 'NO_MATCHING_GROUPS',
  PLEASE_SPECIFY_GROUP: 'PLEASE_SPECIFY_GROUP',
  FIND_ACTIVITY: 'FIND_ACTIVITY',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  TRY_SHOW_SCHEDULE: 'TRY_SHOW_SCHEDULE',
  SHOW_ACTIVITY: 'SHOW_ACTIVITY',
  NO_LECTURES_TODAY: 'NO_LECTURES_TODAY',
  HANDLE_GROUP_SELECTION: 'HANDLE_GROUP_SELECTION',
  SHOW_LECTURE_FROM_NEXT_DAYS: 'SHOW_LECTURE_FROM_NEXT_DAYS'
};

const userRepo = new UserRepo();
const scheduleApi = new ScheduleApi('https://gdziemamy.jsthats.me/api');

class Messaging {
  static handleMessage(senderId, receivedMessage) {
    const sender = userRepo.getUser(senderId);
    const message = new Message(sender, receivedMessage);
    console.log({ message: JSON.stringify(message, null, 1) });

    const messageResponseName = findMessageResponseNameByTrigger(message.text);
    if (!messageResponseName) {
      this.handleUnpredictedMessage(message);
      return;
    }

    const messageResponse = Messages[messageResponseName];

    SendApi.sendMessageFromTemplate(messageResponse, { message });

    sender.addMessagingHistoryRecord(messageResponseName);
  }

  static handleUnpredictedMessage(message) {
    Message.assureType(message);

    const sender = message.sender;

    if (sender.getLastMessagingHistoryRecord() === MessageName.CONFIGURE) {
      SendApi.sendMessageFromTemplate(Messages['HANDLE_GROUP_SELECTION'], { message });
    } else {
      SendApi.sendMessageFromTemplate(Messages['HOW_CAN_I_HELP_YOU'], { message });
    }
  }
}

function findMessageResponseNameByTrigger(trigger) {
  if (typeof trigger !== 'string') {
    return;
  }
  trigger = trigger.toLowerCase();

  return Object.keys(Messages).find(name => {
    if (!Messages[name].trigger) return false;

    if (typeof Messages[name].trigger === 'function') {
      return Messages[name].trigger(trigger);
    }

    return Messages[name].trigger
      .map(value => (typeof value === 'string' ? value.toLowerCase() : null))
      .includes(trigger);
  });
}

function prepareActivityMessage(activity) {
  const time = `${activity.startTime}-${activity.endTime}`;
  const activityType = ` ${activity.type}`;
  const activityName = `${activityType} z "${activity.name}"`;
  const room = ` w sali ${activity.room}`;
  const person = ` z ${activity.person}`;
  return `W godzinach ${time} masz${activity.name ? activityName : activityType}${
    activity.person ? person : ''
  }${activity.room ? room : ''}`;
}

const Messages = {
  NOT_CONFIGURED: {
    trigger: [MessageName.NOT_CONFIGURED],
    content: () =>
      Template.quickRepliesMessage(
        'Nie należysz jeszcze do żadnej grupy. Kliknij w poniższy przycisk, aby to dodać. ;)',
        [Template.createQuickReply('Dodaj grupę', 'skonfiguruj')]
      )
  },
  FIND_SCHEDULE: {
    trigger: text => new RegExp('plan', 'i').test(text),
    content: ({ message, datetime }) => {
      const groupId = message.sender.groups[0].id;

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
  },
  FIND_ACTIVITY: {
    trigger: [MessageName.FIND_ACTIVITY],
    content: ({ message, offset }) => {
      const senderGroupId = message.sender.groups[0].id;

      let datetime = new Date();
      if (message.hasNlpEntities('datetime')) {
        datetime = new Date(message.getFirstNlpEnitityOfType('datetime'));
      }

      scheduleApi
        .getActivity(senderGroupId, offset, datetime)
        .then(activity => {
          if (!activity) {
            SendApi.sendMessageFromTemplate(Messages['NO_LECTURES_TODAY'], { message });
            return;
          }

          const activityDatetime = new Date(activity.date);

          const isActivityToday = Helpers.compareOnlyDates(activityDatetime, new Date());
          const isSenderLate = activity.minutesToStart < 0 && activity.minutesToStart > -45;
          const isTooLate = activity.minutesToStart < -45;
          const isActivityInOneHour = activity.minutesToStart < 60 && !isSenderLate;
          const lateness = Math.round(Math.abs(activity.minutesToStart));

          if (isSenderLate) {
            SendApi.sendMessage(
              Template.textMessage(
                `Jesteś spóźniony ${lateness} minut. ${
                  lateness > 15 ? '😱' : '😨'
                } ${prepareActivityMessage(activity)}`
              ),
              { message }
            );
          } else if (isTooLate) {
            SendApi.sendMessage(
              Template.quickRepliesMessage(
                `Jesteś spóźniony więcej niż 45 minut. Możesz sprawdzić co masz później. ;)`,
                [Template.createQuickReply('Co potem?')]
              ),
              { message }
            );
          } else if (isActivityInOneHour) {
            SendApi.sendMessage(
              Template.textMessage(
                `Masz jeszcze ${Math.round(activity.minutesToStart)} minut do następnych zajęć. ${
                  activity.minutesToStart > 30 ? '☕' : ''
                } ${prepareActivityMessage(activity)}`
              ),
              { message }
            );
          } else if (isActivityToday) {
            SendApi.sendMessage(Template.textMessage(prepareActivityMessage(activity)), {
              message
            });
          } else {
            SendApi.sendMessageFromTemplate(Messages['FIND_SCHEDULE'], { message, datetime });
          }
        })
        .catch(error => {
          console.trace('error', error);
        });
    }
  },
  NO_LECTURES_TODAY: {
    trigger: [MessageName.NO_LECTURES_TODAY],
    content: () => Template.textMessage('Tego dnia nie masz żadnych zajęć. :D')
  },
  FIND_LATER_LECTURE: {
    trigger: text => new RegExp('(następni?e)|(później)|(potem)|(zaraz)').test(text),
    content: ({ message }) =>
      SendApi.sendMessageFromTemplate(Messages['FIND_ACTIVITY'], { message, offset: 'later' })
  },
  TRY_SHOW_SCHEDULE: {
    trigger: text => new RegExp('((gdzie|co) ?mamy)|(gdziemamy)', '').test(text),
    content: ({ message }) => {
      const sender = message.sender;
      if (sender.hasGroups()) {
        SendApi.sendMessageFromTemplate(Messages['FIND_ACTIVITY'], { message, offset: 'nearest' });
      } else {
        SendApi.sendMessageFromTemplate(Messages['NOT_CONFIGURED'], { message });
      }
    }
  },
  GROUP_FOUND: {
    trigger: [MessageName.GROUP_FOUND],
    content: ({ message, group }) => {
      const sender = message.sender;
      userRepo.updateUser(sender);
      SendApi.sendMessage(
        Template.quickRepliesMessage(`Dodano pomyślnie grupę (${group.name})`, [
          Template.createQuickReply('Gdzie mamy?')
        ]),
        { message }
      );
    }
  },
  PLEASE_SPECIFY_GROUP: {
    trigger: [MessageName.PLEASE_SPECIFY_GROUP],
    content: ({ groups }) =>
      Template.quickRepliesMessage(
        'Należysz do którejś z tych grup? Jeśli nie to wpisz poprawną nazwę lub sprawdź ją w planie.',
        groups.map(group => Template.createQuickReply(group.name, group.name))
      )
  },
  HANDLE_GROUP_SELECTION: {
    trigger: [MessageName.HANDLE_GROUP_SELECTION],
    content: ({ message }) => {
      const sender = message.sender;
      const groupName = message.text;

      scheduleApi
        .getGroup(groupName)
        .then(groups => {
          if (groups.length === 0) {
            sender.addMessagingHistoryRecord(MessageName['CONFIGURE']);
            SendApi.sendMessageFromTemplate(Messages['NO_MATCHING_GROUPS'], { message });
          } else if (groups.length === 1) {
            sender.addGroup(groups[0]);
            SendApi.sendMessageFromTemplate(Messages['GROUP_FOUND'], { message, group: groups[0] });
          } else {
            sender.addMessagingHistoryRecord(MessageName['CONFIGURE']);
            SendApi.sendMessageFromTemplate(Messages['PLEASE_SPECIFY_GROUP'], { message, groups });
          }
        })
        .catch(error => {
          console.log('>>groups<<', error);
        });
    }
  },
  NO_MATCHING_GROUPS: {
    trigger: [MessageName.NO_MATCHING_GROUPS],
    content: () =>
      Template.buttonMessage(
        'Nie znaleziono podanej przez ciebie grupy. Spróbuj wpisać ją jeszcze raz albo ją doprecyzuj.',
        [Button.openSchedule()]
      )
  },
  CONFIGURE: {
    trigger: [MessageName.CONFIGURE, 'skonfiguruj', 'konfiguruj'],
    content: () =>
      Template.buttonMessage(
        'Teraz wpisz swoją grupę. Najlepiej jeśli wkleisz ją tutaj z planu zajęć ;)',
        [Button.openSchedule()]
      )
  },
  HOW_CAN_I_HELP_YOU: {
    trigger: [MessageName.HOW_CAN_I_HELP_YOU],
    content: () =>
      Template.quickRepliesMessage('Tu Gdzie Mamy. Jak mogę pomóc?', [
        Template.createQuickReply('Gdzie mamy?'),
        Template.createQuickReply('Skonfiguruj')
      ])
  }
};

module.exports = { MessageName, Messages, Messaging };
