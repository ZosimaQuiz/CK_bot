//  Connect Telegram Bot API
const TelegramBot = require('node-telegram-bot-api');
//  Telegram token
const token = process.env.TOKEN;
module.exports = new TelegramBot(token, {polling: true});