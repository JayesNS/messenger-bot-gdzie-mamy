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
    if (!(message instanceof Message)) {
      console.error(`'message' must be an instance of 'Message'`);
      return;
    }

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
  return Object.keys(Messages).find(name => {
    if (!Messages[name].trigger) return false;

    if (typeof Messages[name].trigger === 'function') {
      return Messages[name].trigger(trigger);
    }

    return Messages[name].trigger
      .map(value => (typeof value === 'string' ? value.toLowerCase() : null))
      .includes(trigger.toLowerCase());
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
      Template.quickRepliesMessage('Nie należysz do żadnej grupy.', [
        Template.createQuickReply('Skonfiguruj')
      ])
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
        .findActivity(senderGroupId, offset, datetime)
        .then(activity => {
          if (!activity) {
            SendApi.sendMessageFromTemplate(Messages['NO_LECTURES_TODAY'], { message });
            return;
          }

          const isActivityToday = Helpers.compareOnlyDates(activity.date, activity.queryDateTime);
          const isFirstActivityAhead =
            activity &&
            isActivityToday &&
            activity.activityIndexToday !== 1 &&
            activity.minutesToStart > 0;

          if (isFirstActivityAhead) {
            SendApi.sendMessage(
              Template.textMessage(
                `Masz jeszcze ${
                  activity.minutesToStart
                } minut do następnych zajęć. ${prepareActivityMessage(activity)}`
              ),
              { message }
            );
          } else {
            SendApi.sendMessage(Template.textMessage(prepareActivityMessage(activity)), {
              message
            });
          }
        })
        .catch(error => {
          console.trace('error', error);
        });
    }
  },
  NO_LECTURES_TODAY: {
    trigger: [MessageName.NO_LECTURES_TODAY],
    content: () => Template.textMessage('Nie masz dziś żadnych zajęć')
  },
  SHOW_LATER_LECTURE: {
    trigger: text => new RegExp('(następni?e)|(później)|(potem)').test(text),
    content: ({ message }) =>
      SendApi.sendMessageFromTemplate(Messages['FIND_ACTIVITY'], { message, offset: 'later' })
  },
  TRY_SHOW_SCHEDULE: {
    trigger: text => new RegExp('((gdzie|co) ?mamy)|(teraz)').test(text),
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
    content: ({ message }) => {
      const sender = message.sender;
      userRepo.updateUser(sender);
      SendApi.sendMessage(
        Template.quickRepliesMessage('Dodano pomyślnie grupę', [
          Template.createQuickReply('Gdzie mamy?', 'Gdzie mamy?')
        ]),
        { message }
      );
    }
  },
  PLEASE_SPECIFY_GROUP: {
    trigger: [MessageName.PLEASE_SPECIFY_GROUP],
    content: ({ groups }) =>
      Template.quickRepliesMessage(
        'Znaleziono kilka pasujących grup. Czy należysz do którejś z nich?',
        groups.map(group => Template.createQuickReply(group.name, group.name))
      )
  },
  HANDLE_GROUP_SELECTION: {
    trigger: [MessageName.HANDLE_GROUP_SELECTION],
    content: ({ message }) => {
      const sender = message.sender;
      const groupName = message.text;

      console.log({ groupName });

      scheduleApi
        .findGroup(groupName)
        .then(groups => {
          console.log({ groups });
          if (groups.length === 0) {
            sender.addMessagingHistoryRecord(MessageName['CONFIGURE']);
            SendApi.sendMessageFromTemplate(Messages['NO_MATCHING_GROUPS'], { message });
          } else if (groups.length === 1) {
            sender.addGroup(groups[0]);
            SendApi.sendMessageFromTemplate(Messages['GROUP_FOUND'], { message });
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
      Template.buttonMessage('Nie znaleziono pasującej grupy, wpisz poprawną nazwę grupy.', [
        Button.openSchedule()
      ])
  },
  CONFIGURE: {
    trigger: [MessageName.CONFIGURE, 'skonfiguruj'],
    content: () =>
      Template.buttonMessage('Wpisz teraz swoją grupę (najlepiej skopiuj ją z planu zajęć)', [
        Button.openSchedule()
      ])
  },
  HOW_CAN_I_HELP_YOU: {
    trigger: [MessageName.HOW_CAN_I_HELP_YOU],
    content: () =>
      Template.quickRepliesMessage('W czym mogę pomóc?', [
        Template.createQuickReply('Gdzie mamy?'),
        Template.createQuickReply('Skonfiguruj')
      ])
  }
};

module.exports = { MessageName, Messages, Messaging };
