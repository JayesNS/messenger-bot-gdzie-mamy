`use strict`;

const { User, UserRepo } = require('../users');
const { ApiHandler, Button, Template, Helpers } = require('./');
const request = require('request');

const PAGE_ACCESS_TOKEN = require('./../page-access-token').token;

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
const currentTime = new Date('2019-02-20T11:20');
const apiHandler = new ApiHandler('http://localhost:1337/api', currentTime);
// const apiHandler = new ApiHandler('https://gdziemamy.jsthats.me/api');

class Messaging {
  static handleMessage(senderPsid, receivedMessage) {
    const messageText = receivedMessage.text;
    const messageResponseName = Messaging.findMessageResponseNameByTrigger(messageText);

    let user;
    if (!userRepo.hasUser(senderPsid)) {
      user = userRepo.addUser(new User(senderPsid));
    } else {
      user = userRepo.getUser(senderPsid);
    }

    if (!messageResponseName) {
      this.handleUnpredictedMessage(user, messageText);
    } else {
      const payload = { user, message: messageText };

      const messageResponse = Messages[messageResponseName];

      if (messageResponse.content(payload)) {
        this.sendMessage(senderPsid, messageResponse.content(payload));
      }
    }
    user.addMessagingHistoryRecord(messageResponseName);
  }

  static handlePostback(senderPsid, receivedPostback) {
    const messageText = receivedPostback.payload || receivedPostback.text;
    const messageResponseName = this.findMessageResponseNameByTrigger(messageText);

    let user;
    if (!userRepo.hasUser(senderPsid)) {
      user = userRepo.addUser(new User(senderPsid));
    } else {
      user = userRepo.getUser(senderPsid);
    }

    if (!messageResponseName) {
      this.handleUnpredictedMessage(user, messageText);
    } else {
      const payload = { user, message: messageText };

      const messageResponse = Messages[messageResponseName];

      if (messageResponse.content(payload)) {
        this.sendMessage(senderPsid, messageResponse.content(payload));
      }
    }
    user.addMessagingHistoryRecord(messageResponseName);
  }

  static handleUnpredictedMessage(user, message) {
    if (user.getLastMessagingHistoryRecord() === MessageName.CONFIGURE) {
      this.sendMessage(
        user.senderPsid,
        Messages['HANDLE_GROUP_SELECTION'].content({ user, groupName: message })
      );
    } else {
      this.sendMessage(user.senderPsid, Messages['HOW_CAN_I_HELP_YOU'].content());
    }
  }

  static findMessageResponseNameByTrigger(trigger) {
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

  static sendSenderAction(senderPsid, type) {
    const responseBody = {
      recipient: {
        id: senderPsid
      },
      sender_action: type
    };

    this.makeRequest(responseBody);
  }

  static sendMessage(senderPsid, message) {
    const responseBody = {
      recipient: {
        id: senderPsid
      },
      message
    };

    this.makeRequest(responseBody);
  }

  static makeRequest(messageBody) {
    request(
      {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageBody
      },
      (err, res, body) => {
        if (!err) {
        } else {
          console.error('Unable to send message:' + err);
        }
      }
    );
  }
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
    content: ({ user, offset }) => {
      apiHandler
        .findTodaysLecture(user.groups[0].id, offset)
        .then(activity => {
          if (!activity) {
            Messaging.sendMessage(user.senderPsid, Messages['NO_LECTURES_TODAY'].content());
          }
          const isActivityToday = Helpers.compareOnlyDates(activity.date, activity.queryDateTime);

          console.log({ activity, isActivityToday });

          if (
            activity &&
            isActivityToday &&
            activity.lectureToday !== 1 &&
            activity.minutesToStart > 0
          ) {
            Messaging.sendMessage(
              user.senderPsid,
              Template.textMessage(
                `Masz jeszcze ${
                  activity.minutesToStart
                } minut do następnych zajęć. ${prepareActivityMessage(activity)}`
              )
            );
          } else if (activity && isActivityToday) {
            Messaging.sendMessage(
              user.senderPsid,
              Template.textMessage(prepareActivityMessage(activity))
            );
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
    content: ({ user }) => Messages['FIND_ACTIVITY'].content({ user, offset: 'later' })
  },
  SHOW_LECTURE_FROM_NEXT_DAYS: {
    trigger: [MessageName.SHOW_LECTURE_FROM_NEXT_DAYS, 'następne', 'a następne'],
    content: ({ lecture }) => {
      if (lecture) {
        return Template.textMessage(`Następne zajęcia masz ${lecture.date} o ${lecture.startTime}`);
      } else {
        return Messages['NO_LECTURES_TODAY'].content();
      }
    }
  },
  TRY_SHOW_SCHEDULE: {
    trigger: text => new RegExp('(gdzie ?mamy)|(teraz)').test(text),
    content: ({ user }) => {
      if (user.groups.length === 0) {
        return Messages['NOT_CONFIGURED'].content();
      } else {
        return Messages['FIND_ACTIVITY'].content({ user, offset: 'nearest' });
      }
    }
  },
  GROUP_FOUND: {
    trigger: [MessageName.GROUP_FOUND],
    content: ({ user }) => {
      userRepo.updateUser(user);
      return Template.quickRepliesMessage('Dodano pomyślnie grupę', [
        Template.createQuickReply('Gdzie mamy?', 'Gdzie mamy?')
      ]);
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
    content: ({ user, groupName }) => {
      apiHandler
        .findGroup(groupName)
        .then(groups => {
          if (groups.length === 0) {
            Messaging.sendMessage(user.senderPsid, Messages['NO_MATCHING_GROUPS'].content());
            user.addMessagingHistoryRecord(MessageName['CONFIGURE']);
          } else if (groups.length === 1) {
            user.addGroup(groups[0]);
            Messaging.sendMessage(user.senderPsid, Messages['GROUP_FOUND'].content({ user }));
          } else {
            Messaging.sendMessage(
              user.senderPsid,
              Messages['PLEASE_SPECIFY_GROUP'].content({ groups })
            );
            user.addMessagingHistoryRecord(MessageName['CONFIGURE']);
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
