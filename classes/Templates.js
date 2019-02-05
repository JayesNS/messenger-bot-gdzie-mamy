`user strict`;

class Templates {
  static createQuickReply(text, payload) {
    return {
      content_type: 'text',
      title: text,
      payload: payload || text
    };
  }

  static textMessage(messageText, messageOptions) {
    return {
      text: messageText,
      ...messageOptions
    };
  }

  static buttonMessage(buttonText, buttons, messageOptions) {
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

  static quickRepliesMessage(messageText, quickReplies) {
    return {
      text: messageText,
      quick_replies: quickReplies
    };
  }

  static imageMessage(imageUrl) {
    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'media',
          elements: [
            {
              media_type: 'image',
              url: imageUrl
            }
          ]
        }
      }
    };
  }
}

module.exports = { Templates };
