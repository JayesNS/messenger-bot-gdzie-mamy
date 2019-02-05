`use strict`;

const { User, UserRepo } = require('../users');
const { ApiHandler } = require('./ApiHandler');
const { Templates } = require('./Templates');
const { Helpers } = require('./Helpers');
const { Button } = require('./Button');
const request = require('request');

const PAGE_ACCESS_TOKEN = require('./../page-access-token').token;

const MessageName = {
  ASK_FOR_GROUP: 'ASK_FOR_GROUP',
  CONFIGURE: 'CONFIGURE',
  HOW_CAN_I_HELP_YOU: 'HOW_CAN_I_HELP_YOU',
  GROUP_FOUND: 'GROUP_FOUND',
  NO_MATCHING_GROUPS: 'NO_MATCHING_GROUPS',
  PLEASE_SPECIFY_GROUP: 'PLEASE_SPECIFY_GROUP',
  SHOW_SCHEDULE: 'SHOW_SCHEDULE',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  TRY_SHOW_SCHEDULE: 'TRY_SHOW_SCHEDULE',
  NO_LECTURES_TODAY: 'NO_LECTURES_TODAY',
  HANDLE_GROUP_SELECTION: 'HANDLE_GROUP_SELECTION'
};

const Messages = {
  NOT_CONFIGURED: {
    triggers: [MessageName.NOT_CONFIGURED],
    content: () =>
      Templates.quickRepliesMessage('Nie należysz do żadnej grupy.', [
        Templates.createQuickReply('Skonfiguruj')
      ])
  },
  SHOW_SCHEDULE: {
    triggers: [MessageName.SHOW_SCHEDULE, 'SHOW_SCHEDULE'],
    content: data => {
      apiHandler
        .findSchedule(data.user.groups[0].id)
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
          console.error('error', error);
        });
    }
  },
  NO_LECTURES_TODAY: {
    triggers: [MessageName.NO_LECTURES_TODAY],
    content: () => Templates.textMessage('Nie masz dziś żadnych zajęć')
  },
  DISPLAY_SCHEDULE: {
    triggers: [MessageName.DISPLAY_SCHEDULE],
    content: lecture => {
      const time = `${lecture.startTime}-${lecture.endTime}`;
      const lectureType = ` ${lecture.type}`;
      const lectureName = `${lectureType} z "${lecture.name}"`;
      const room = ` w sali ${lecture.room}`;
      const lecturer = ` z ${lecture.lecturer}`;
      return Templates.textMessage(
        `W godzinach ${time} masz${lecture.name ? lectureName : lectureType}${
          lecture.lecturer ? lecturer : ''
        }${lecture.room ? room : ''}`
      );
    }
  },
  TRY_SHOW_SCHEDULE: {
    triggers: [MessageName.TRY_SHOW_SCHEDULE, 'gdzie mamy?', 'gdziemamy', 'gdzie mamy'],
    content: data => {
      if (data.user.groups.length === 0) {
        return Messages['NOT_CONFIGURED'].content();
      } else {
        return Messages['SHOW_SCHEDULE'].content(data);
      }
    }
  },
  GROUP_FOUND: {
    triggers: [MessageName.GROUP_FOUND],
    content: user => {
      userRepo.updateUser(user);
      return Templates.quickRepliesMessage('Dodano pomyślnie grupę', [
        Templates.createQuickReply('Gdzie mamy?', 'Gdzie mamy?')
      ]);
    }
  },
  PLEASE_SPECIFY_GROUP: {
    triggers: [MessageName.PLEASE_SPECIFY_GROUP],
    content: groups =>
      Templates.quickRepliesMessage(
        'Znaleziono kilka pasujących grup. Czy należysz do którejś z nich?',
        groups.map(group => Templates.createQuickReply(group.name, group.name))
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
      Templates.buttonMessage('Nie znaleziono pasującej grupy, wpisz poprawną nazwę grupy.', [
        Button.openSchedule()
      ])
  },
  CONFIGURE: {
    triggers: [MessageName.CONFIGURE, 'skonfiguruj'],
    content: () =>
      Templates.buttonMessage('Wpisz teraz swoją grupę (najlepiej skopiuj ją z planu zajęć)', [
        Button.openSchedule()
      ])
  },
  HOW_CAN_I_HELP_YOU: {
    triggers: [MessageName.HOW_CAN_I_HELP_YOU],
    content: () =>
      Templates.quickRepliesMessage('W czym mogę pomóc?', [
        Templates.createQuickReply('Gdzie mamy?'),
        Templates.createQuickReply('Skonfiguruj')
      ])
  }
};
const userRepo = new UserRepo();
const apiHandler = new ApiHandler('https://gdziemamy.jsthats.me/api');

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
      Messaging.handleUnpredictedMessage(user, messageText);
    } else {
      const payload = { user, message: messageText };

      const messageResponse = Messages[messageResponseName];

      if (messageResponse.content(payload)) {
        Messaging.sendMessage(senderPsid, messageResponse.content(payload));
      }
    }
    user.addMessagingHistoryRecord(messageResponseName);
  }

  static handlePostback(senderPsid, receivedPostback) {
    const messageText = receivedPostback.payload || receivedPostback.text;
    const messageResponseName = Messaging.findMessageResponseNameByTrigger(messageText);

    let user;
    if (!userRepo.hasUser(senderPsid)) {
      user = userRepo.addUser(new User(senderPsid));
    } else {
      user = userRepo.getUser(senderPsid);
    }

    if (!messageResponseName) {
      handleUnpredictedMessage(user, messageText);
    } else {
      const payload = { user, message: messageText };

      const messageResponse = Messages[messageResponseName];

      if (messageResponse.content(payload)) {
        Messaging.sendMessage(senderPsid, messageResponse.content(payload));
      }
    }
    user.addMessagingHistoryRecord(messageResponseName);
  }

  static handleUnpredictedMessage(user, message) {
    if (user.getLastMessagingHistoryRecord() === MessageName.CONFIGURE) {
      Messaging.sendMessage(
        user.senderPsid,
        Messages['HANDLE_GROUP_SELECTION'].content({ user, groupName: message })
      );
    } else {
      Messaging.sendMessage(user.senderPsid, Messages['HOW_CAN_I_HELP_YOU'].content());
    }
  }

  static findMessageResponseNameByTrigger(trigger) {
    if (typeof trigger !== 'string') {
      return;
    }
    return Object.keys(Messages).find(name =>
      Messages[name].triggers
        .map(value => (typeof value === 'string' ? value.toLowerCase() : null))
        .includes(trigger.toLowerCase())
    );
  }

  static sendMessage(senderPsid, message) {
    const responseBody = {
      recipient: {
        id: senderPsid
      },
      message
    };

    request(
      {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: responseBody
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
