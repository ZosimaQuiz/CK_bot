'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; //  Import JSON dictionary

//  Require .env file

// Require FS module

//  HTTP PORT

//  Connect Mongoose 

//  Require mongoose model

//  Connect bot

//  Require callback query funcs

//  Require callback command funcs


var _dictionary = require('./dictionary.json');

var _dictionary2 = _interopRequireDefault(_dictionary);

var _config = require('dotenv/config');

var _config2 = _interopRequireDefault(_config);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _gangs = require('../models/gangs');

var _gangs2 = _interopRequireDefault(_gangs);

var _telegram_bot = require('./../Telegram Bot/telegram_bot');

var _telegram_bot2 = _interopRequireDefault(_telegram_bot);

var _callback_query_functions = require('./callback_query_functions');

var _callback_query_functions2 = _interopRequireDefault(_callback_query_functions);

var _callback_command_functions = require('./callback_command_functions');

var _callback_command_functions2 = _interopRequireDefault(_callback_command_functions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  Connect to KnightX database
//  MongoDB connect link
var MongoURL = process.env.MONGOOSE_CONNECT_LINK,

//  Port
PORT = process.env.PORT,

//  My user ID
MyUserID = process.env.MY_USER_ID,

//  Bot tag  
BotTag = process.env.BOT_TAG;
_mongoose2.default.connect(MongoURL, { useNewUrlParser: true });
_mongoose2.default.set('useNewUrlParser', true);
_mongoose2.default.set('useFindAndModify', false);
_mongoose2.default.set('useCreateIndex', true);
//  Run server
var port = PORT || 8080;
var requestHandler = function requestHandler(request, response) {
  console.log(request.url);
  response.end('Hello Node.js Server!');
};
var server = _http2.default.createServer(requestHandler);
server.listen(port, function (err) {
  if (err) {
    return console.log('Something bad happened', err);
  }
  console.log('Server is listening on ' + port);
});

_telegram_bot2.default.onText(/\/start.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/start')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackLanguage(member, chatID);
  });
  _telegram_bot2.default.sendMessage(chatID, 'Help: /help');
});

_telegram_bot2.default.onText(/\/usebot.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/usebot')) {
    return;
  }
  _callback_command_functions2.default.callbackUsebot(chatID, userID, username, language);
});

_telegram_bot2.default.onText(/\/language.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/language')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackLanguage(member, chatID);
  });
});

_telegram_bot2.default.onText(/\/defend.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/defend')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackDefendFreeHeal(member, chatID, input);
  });
});

_telegram_bot2.default.onText(/\/free.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/free')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackDefendFreeHeal(member, chatID, match[0]);
  });
});

_telegram_bot2.default.onText(/\/heal.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/heal')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackDefendFreeHeal(member, chatID, match[0]);
  });
});

_telegram_bot2.default.onText(/\/alarm.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/alarm')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackAlarm(member, chatID);
  });
});

_telegram_bot2.default.onText(/\/list.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/list')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member, Members) {
    _callback_command_functions2.default.callbackList(Members, member, chatID);
  });
});

_telegram_bot2.default.onText(/\/newbattle.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/newbattle')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackNewbattle(member, chatID);
  });
});

_telegram_bot2.default.onText(/\/spreadsheet.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/spreadsheet')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member, Members) {
    _callback_command_functions2.default.callbackSpreadsheet(Members, member, chatID);
  });
});

_telegram_bot2.default.onText(/\/setname.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/setname')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackSetname(member, chatID);
  });
});

_telegram_bot2.default.onText(/\/timer.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/timer')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackTimer(member, chatID);
  });
});

_telegram_bot2.default.onText(/\/help.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/help')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member) {
    _callback_command_functions2.default.callbackHelp(member, chatID);
  });
});

_telegram_bot2.default.onText(/\/edit.*/, function (msg, match) {
  var input = match[0].split(' ')[0],
      chatID = msg.chat.id,
      userID = msg.from.id,
      username = msg.from.username || msg.from.first_name,
      language = msg.from.language_code || 'en';
  if (isNotCommand(input, '/edit')) {
    return;
  }
  memberGang(userID, chatID, username, language, function (member, Members) {
    _callback_command_functions2.default.callbackEdit(Members, member, chatID);
  });
});

_telegram_bot2.default.onText(/\/getid.*/, function (msg, match) {
  var chatID = msg.chat.id,
      userID = msg.from.id;
  if (userID != MyUserID) {
    _telegram_bot2.default.sendMessage('You are not an administrator!');
  }
  _telegram_bot2.default.sendMessage(chatID, 'Success! Gang ID: ' + chatID);
  console.log('Success! Gang ID:', chatID);
});

_telegram_bot2.default.on('message', function (msg, match) {
  var userID = msg.from.id,
      chatID = msg.chat.id,
      username = msg.from.username,
      messageText = msg.text,
      language = msg.from.language_code || 'en';
  if (messageText === undefined || messageText.match(/\/.*/)) {
    _callback_command_functions2.default.waitNickname.userID = false;
    return;
  }
  memberGang(userID, chatID, username, language, function (member, Members) {
    _callback_command_functions2.default.callbackMessage(Members, member, userID, messageText);
  });
});

_telegram_bot2.default.on('callback_query', function (query) {
  try {
    var messageID = query.message.message_id,
        chatID = query.message.chat.id,
        userID = query.from.id,
        queryID = query.id,
        username = query.from.username || query.from.first_name,
        data = query.data,
        language = query.from.language_code || 'en';
    memberGang(userID, chatID, username, language, function (member, Members) {
      var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
          textDefend = dictionaryMember.textDefend,
          textFree = dictionaryMember.textFree,
          textHeal = dictionaryMember.textHeal,
          textPressNO = dictionaryMember.textPressNO,
          textPressYES = dictionaryMember.textPressYES,
          textAlarm = dictionaryMember.textAlarm,
          textTimer = dictionaryMember.textTimer,
          textChangeLanguage = dictionaryMember.textChangeLanguage,
          textResetDatabase = dictionaryMember.textResetDatabase,
          textSpecifyFreeHeal = dictionaryMember.textSpecifyFreeHeal,
          textSpecifyDefendHeal = dictionaryMember.textSpecifyDefendHeal,
          textSpecifyDefendFree = dictionaryMember.textSpecifyDefendFree,
          textEdit = dictionaryMember.textEdit,
          textEditMode = dictionaryMember.textEditMode;

      switch (query.message.text) {
        case textDefend:
          _callback_query_functions2.default.callbackTextDefend(Members, member.free, data, username, chatID, userID, messageID, textSpecifyFreeHeal);
          break;
        case textFree:
          _callback_query_functions2.default.callbackTextFree(Members, member.defend, data, username, chatID, userID, messageID, textSpecifyDefendHeal);
          break;
        case textHeal:
          _callback_query_functions2.default.callbackTextHeal(Members, data, username, chatID, userID, messageID, textSpecifyDefendFree);
          break;
        case textChangeLanguage:
          _callback_query_functions2.default.callbackTextChangeLanguage(Members, data, username, chatID, userID, messageID);
          break;
        case textResetDatabase:
          _callback_query_functions2.default.callbackTextResetDatabase(Members, data, username, chatID, messageID, textPressNO, textPressYES);
          break;
        case textAlarm:
          _callback_query_functions2.default.callbackTextAlarm(Members, data, chatID, messageID);
          break;
        case textTimer:
          _callback_query_functions2.default.callbackTextTimer(Members, data, chatID, userID, messageID, queryID);
          break;
        case textEdit:
          _callback_query_functions2.default.callbackTextEdit(member, data, chatID, messageID, queryID);
          break;
        case textEditMode:
          _callback_query_functions2.default.callbackTextEditMode(Members, member, data, username, chatID, messageID, queryID);
          break;
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//  Search gang of user
var memberGang = async function memberGang(userID, chatID, username, language, callback) {
  var isFound = false;

  var _loop = async function _loop(i) {
    if (isFound) {
      return {
        v: void 0
      };
    }
    await _gangs2.default[i].findOne({ userID: userID }, function (err, member) {
      if (err) {
        console.log(err);
      }
      if (member) {
        isFound = true;
        callback(member, _gangs2.default[i]);
        return;
      }
      if (i === 0 && isFound === false) {
        var dictionaryMember = language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
            textNotInDatabase = dictionaryMember.textNotInDatabase;

        _telegram_bot2.default.sendMessage(chatID, '*' + username + '*, ' + textNotInDatabase, { parse_mode: 'Markdown' });
      }
    });
  };

  for (var i = _gangs2.default.length; i--;) {
    var _ret = await _loop(i);

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }
};
//  Timer
var timer = function timer() {
  var now = new Date(),
      timer = (now.setMinutes(now.getMinutes()) / 1000 / 60).toFixed();
  return _gangs2.default.map(function (gang) {
    return gang.find({ timer: timer }, function (err, members) {
      if (err) {
        console.log(err);
        return;
      }
      if (!members.length) {
        return;
      }
      for (var i = members.length; i--;) {
        var dictionaryMember = members[i].language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
            textTimerRing = dictionaryMember.textTimerRing;

        _telegram_bot2.default.sendMessage(members[i].userID, textTimerRing);
      }
    });
  });
};
//   
var isNotCommand = function isNotCommand(input, command) {
  if (input !== command && input !== command + BotTag) {
    return true;
  } else {
    return false;
  }
};
setInterval(timer, 60000);