'use strict';

const { UserRepo, User } = require('./users');

const request = require('request'),
  PAGE_ACCESS_TOKEN = require('./page-access-token').token;

const MessageResponseName = {
  ASK_FOR_GROUP: 'ASK_FOR_GROUP',
  CONFIGURE: 'CONFIGURE',
  SHOW_SENDER_ID: 'SHOW_SENDER_ID',
  HOW_CAN_I_HELP_YOU: 'HOW_CAN_I_HELP_YOU',
  GROUP_FOUND: 'GROUP_FOUND',
  NO_MATCHING_GROUPS: 'NO_MATCHING_GROUPS',
  PLEASE_SPECIFY_GROUP: 'PLEASE_SPECIFY_GROUP',
  SHOW_SCHEDULE: 'SHOW_SCHEDULE'
};

const messageResponses = {
  SHOW_SCHEDULE: {
    triggers: ['gdzie mamy?', 'gdziemamy', 'gdzie mamy'],
    content: data => {
      if (data.user.groups.length === 0) {
        return prepareQuickRepliesMessage('Nie należysz do żadnej grupy.', [
          quickReply('Dodaj', 'skonfiguruj')
        ]);
      } else {
        apiFindSchedule(data.user.groups[0].id, lecture => {
          if (lecture) {
            sendMessage(
              data.user.senderPsid,
              prepareTextMessage(
                `Masz w sali ${lecture['sala']} o ${lecture['od-godz']}-${
                  lecture['do-godz']
                }`
              )
            );
          } else {
            sendMessage(
              data.user.senderPsid,
              prepareTextMessage('Nie masz dziś żadnych zajęć')
            );
          }
        });
      }
    }
  },
  GROUP_FOUND: {
    triggers: [],
    content: () =>
      prepareQuickRepliesMessage('Dodano pomyślnie grupę', [
        quickReply('Gdzie mamy?', 'Gdzie mamy?')
      ])
  },
  PLEASE_SPECIFY_GROUP: {
    triggers: [],
    content: groups =>
      prepareQuickRepliesMessage(
        'Znaleziono kilka pasujących grup. Czy należysz do którejś z nich?',
        groups.map(group => quickReply(group.name, group.name))
      )
  },
  NO_MATCHING_GROUPS: {
    triggers: [],
    content: () =>
      prepareButtonMessage(
        'Nie znaleziono pasującej grupy, wpisz poprawną nazwę grupy.',
        [buttonOpenSchedule]
      )
  },
  CONFIGURE: {
    triggers: ['skonfiguruj'],
    content: data => {
      return prepareButtonMessage(
        'Wpisz teraz swoją grupę (najlepiej skopiuj ją z planu zajęć)',
        [buttonOpenSchedule]
      );
    }
  },
  SHOW_SENDER_ID: {
    triggers: ['!$'],
    content: data => prepareTextMessage(data.user.senderPsid)
  },
  HOW_CAN_I_HELP_YOU: {
    triggers: [],
    content: () =>
      prepareTextMessage('W czym mogę pomóc?', {
        quick_replies: [
          {
            content_type: 'text',
            title: 'Gdzie mamy?',
            payload: 'Gdzie mamy?'
          },
          {
            content_type: 'text',
            title: 'Skonfiguruj',
            payload: 'Skonfiguruj'
          }
        ]
      })
  }
};

const userRepo = new UserRepo();

function handleMessage(senderPsid, receivedMessage) {
  const messageText = receivedMessage.text;

  const messageResponseName = findMessageResponseNameByTrigger(messageText);

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

    const messageResponse =
      messageResponses[messageResponseName] ||
      messageResponses['HOW_CAN_I_HELP_YOU'];

    if (messageResponse.content(payload)) {
      sendMessage(senderPsid, messageResponse.content(payload));
    }
  }
  user.addMessagingHistoryRecord(messageResponseName);
}

function handlePostback(senderPsid, receivedPostback) {
  console.log(receivedPostback);
}

function handleUnpredictedMessage(user, message) {
  if (user.getLastMessagingHistoryRecord() === MessageResponseName.CONFIGURE) {
    // userRepo.
    apiFindGroup(message, groups => {
      console.log('groups', groups);
      if (groups.length === 1) {
        user.addGroup(groups[0]);
        sendMessage(user.senderPsid, messageResponses['GROUP_FOUND'].content());
      } else if (groups.length > 1 && groups.length <= 3) {
        sendMessage(
          user.senderPsid,
          messageResponses['PLEASE_SPECIFY_GROUP'].content(groups)
        );
        user.addMessagingHistoryRecord(MessageResponseName.CONFIGURE);
      } else {
        sendMessage(
          user.senderPsid,
          messageResponses['NO_MATCHING_GROUPS'].content()
        );
        user.addMessagingHistoryRecord(MessageResponseName.CONFIGURE);
      }
    });
  } else {
    sendMessage(
      user.senderPsid,
      messageResponses['HOW_CAN_I_HELP_YOU'].content()
    );
  }
}

const apiUrl = 'http://localhost:1337/api';
// const apiUrl = 'https://gdziemamy.jsthats.me/api';
// API requests
function apiFindGroup(groupName, callback) {
  request(`${apiUrl}/groups/${groupName}`, (err, res, data) => {
    console.log('[GdzieMamy? API]', err, data);
    if (!err) {
      callback(JSON.parse(data));
    } else {
      callback(null, err);
    }
  });
}
function apiFindSchedule(groupId, callback) {
  request(`${apiUrl}/plans/${groupId}/next`, (err, res, data) => {
    if (!err) {
      callback(JSON.parse(data));
    } else {
      callback(null, err);
    }
  });
}

function sendMessage(senderPsid, message) {
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
      if (!err) {
        console.log('message sent!');
      } else {
        console.error('Unable to send message:' + err);
      }
    }
  );
}

// Messages templates
function prepareTextMessage(messageText, messageOptions) {
  return {
    text: messageText,
    ...messageOptions
  };
}

function prepareButtonMessage(buttonText, buttons, messageOptions) {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: buttonText,
        buttons
      }
    },
    ...messageOptions
  };
}

function prepareQuickRepliesMessage(messageText, quickReplies) {
  return {
    text: messageText,
    quick_replies: quickReplies
  };
}

// Helpers
function findMessageResponseNameByTrigger(trigger) {
  return Object.keys(messageResponses).find(name =>
    messageResponses[name].triggers.includes(trigger.toLowerCase())
  );
}

function findResponseByTrigger(trigger) {
  const messageResponseName = findMessageResponseNameByTrigger(trigger);

  return (
    messageResponses[messageResponseName] ||
    messageResponses['HOW_CAN_I_HELP_YOU']
  );
}

// Button templates
const buttonOpenSchedule = {
  type: 'web_url',
  url: 'http://planzajec.uek.krakow.pl?typ=G',
  title: 'Otwórz plan'
};

// Quick reply template
const quickReply = (text, payload) => ({
  content_type: 'text',
  title: text,
  payload
});

module.exports = { handleMessage, handlePostback };
