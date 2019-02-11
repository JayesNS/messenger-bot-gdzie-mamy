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
  SHOW_NEAREST_SCHEDULE: 'SHOW_NEAREST_SCHEDULE',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  TRY_SHOW_SCHEDULE: 'TRY_SHOW_SCHEDULE',
  NO_LECTURES_TODAY: 'NO_LECTURES_TODAY',
  HANDLE_GROUP_SELECTION: 'HANDLE_GROUP_SELECTION',
  DISPLAY_NEXT_LECTURE: 'DISPLAY_NEXT_LECTURE'
};

const Messages = {
  NOT_CONFIGURED: {
    triggers: [MessageName.NOT_CONFIGURED],
    content: () =>
      Template.quickRepliesMessage('Nie należysz do żadnej grupy.', [
        Template.createQuickReply('Skonfiguruj')
      ])
  },
  SHOW_NEAREST_SCHEDULE: {
    triggers: [MessageName.SHOW_NEAREST_SCHEDULE],
    content: data => {
      apiHandler
        .findTodaysLecture(data.user.groups[0].id, 'later')
        .then(lecture => {
          console.log(typeof Helpers.returnNullIfObjectEmpty);
          if (Helpers.returnNullIfObjectEmpty(lecture)) {
            Messaging.sendMessage(
              data.user.senderPsid,
              Messages['DISPLAY_SCHEDULE'].content(lecture)
            );
          } else {
            Messaging.sendMessage(data.user.senderPsid, Messages['NO_LECTURES_TODAY'].content());
          }
        })
        .catch(error => {
          console.trace('error', error);
        });
    }
  },
  NO_LECTURES_TODAY: {
    triggers: [MessageName.NO_LECTURES_TODAY],
    content: () => Template.textMessage('Nie masz dziś żadnych zajęć')
  },
  DISPLAY_SCHEDULE: {
    triggers: [MessageName.DISPLAY_SCHEDULE],
    content: lecture => {
      const isLectureToday = Helpers.compareOnlyDates(lecture.date, lecture.queryDateTime);
      if (isLectureToday) {
        const time = `${lecture.startTime}-${lecture.endTime}`;
        const lectureType = ` ${lecture.type}`;
        const lectureName = `${lectureType} z "${lecture.name}"`;
        const room = ` w sali ${lecture.room}`;
        const lecturer = ` z ${lecture.lecturer}`;
        return Template.textMessage(
          `W godzinach ${time} masz${lecture.name ? lectureName : lectureType}${
            lecture.lecturer ? lecturer : ''
          }${lecture.room ? room : ''}`
        );
      } else {
        return Messages['DISPLAY_NEXT_LECTURE'].content(lecture);
      }
    }
  },
  DISPLAY_NEXT_LECTURE: {
    triggers: [MessageName.DISPLAY_NEXT_LECTURE, 'następne', 'a następne'],
    content: lecture => {
      if (lecture) {
        console.log(lecture);
        return Template.textMessage(`Następne zajęcia masz ${lecture.date} o ${lecture.startTime}`);
      } else {
        return Messages['NO_LECTURES_TODAY'].content();
      }
    }
  },
  TRY_SHOW_SCHEDULE: {
    triggers: [MessageName.TRY_SHOW_SCHEDULE, 'gdzie mamy?', 'gdziemamy', 'gdzie mamy'],
    content: data => {
      if (data.user.groups.length === 0) {
        return Messages['NOT_CONFIGURED'].content();
      } else {
        return Messages['SHOW_NEAREST_SCHEDULE'].content(data);
      }
    }
  },
  GROUP_FOUND: {
    triggers: [MessageName.GROUP_FOUND],
    content: user => {
      userRepo.updateUser(user);
      return Template.quickRepliesMessage('Dodano pomyślnie grupę', [
        Template.createQuickReply('Gdzie mamy?', 'Gdzie mamy?')
      ]);
    }
  },
  PLEASE_SPECIFY_GROUP: {
    triggers: [MessageName.PLEASE_SPECIFY_GROUP],
    content: groups =>
      Template.quickRepliesMessage(
        'Znaleziono kilka pasujących grup. Czy należysz do którejś z nich?',
        groups.map(group => Template.createQuickReply(group.name, group.name))
      )
  },
  HANDLE_GROUP_SELECTION: {
    triggers: [MessageName.HANDLE_GROUP_SELECTION],
    content: ({ user, groupName }) => {
      apiHandler
        .findGroup(groupName)
        .then(groups => {
          if (groups.length === 0) {
            Messaging.sendMessage(user.senderPsid, Messages['NO_MATCHING_GROUPS'].content());
            user.addMessagingHistoryRecord(MessageName['CONFIGURE']);
          } else if (groups.length === 1) {
            user.addGroup(groups[0]);
            Messaging.sendMessage(user.senderPsid, Messages['GROUP_FOUND'].content(user));
          } else {
            Messaging.sendMessage(
              user.senderPsid,
              Messages['PLEASE_SPECIFY_GROUP'].content(groups)
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
    triggers: [MessageName.NO_MATCHING_GROUPS],
    content: () =>
      Template.buttonMessage('Nie znaleziono pasującej grupy, wpisz poprawną nazwę grupy.', [
        Button.openSchedule()
      ])
  },
  CONFIGURE: {
    triggers: [MessageName.CONFIGURE, 'skonfiguruj'],
    content: () =>
      Template.buttonMessage('Wpisz teraz swoją grupę (najlepiej skopiuj ją z planu zajęć)', [
        Button.openSchedule()
      ])
  },
  HOW_CAN_I_HELP_YOU: {
    triggers: [MessageName.HOW_CAN_I_HELP_YOU],
    content: () =>
      Template.quickRepliesMessage('W czym mogę pomóc?', [
        Template.createQuickReply('Gdzie mamy?'),
        Template.createQuickReply('Skonfiguruj')
      ])
  }
};
const userRepo = new UserRepo();
const currentTime = new Date('2019-02-20T08:15');
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
      if (!Messages[name].triggers) return false;

      return Messages[name].triggers
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
        console.log(body);

        if (!err) {
          console.log('message sent!');
        } else {
          console.error('Unable to send message:' + err);
        }
      }
    );
  }
}

module.exports = { MessageName, Messages, Messaging };
