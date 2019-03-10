# Gdzie mamy? bot

## Check it out

[Gdzie mamy? on Facebook](https://www.facebook.com/gdzie.mamy)

## About

Gdzie mamy? is a messenger bot which provides information about lectures for students of CUE. Because of its presence at Facebook, the bot is a platform-independent way of communication with students. There is no need to install it anywhere. To start using bot, find **Gdzie mamy?** on Facebook and initiate talk with it. Then you must go through simple configuration process of providing bot with information about your group name. At last you can ask _Gdzie mamy?_ by clicking button at the bottom or simply typing it in. The bot will reply almost immediately with information about your next lecture.

## Technology used

- TypeScript
- [Node.js 11](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/)
- [MessengerPlatform](https://developers.facebook.com/docs/messenger-platform)

The bot was rewritten in TypeScript ([typescipt](https://github.com/JayesNS/messenger-bot-gdzie-mamy/tree/typescript) branch) for better maintenance. So that more features can be added in the future easier. Dependency Injection mechanism opened way to implement more sources of data from other universities.

## Limitations

- working only for CUE (UEK) students
- only in Polish
- only one group at the same time
