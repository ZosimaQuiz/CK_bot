'use strict';

var _dictionary = require('./dictionary.json');

var _dictionary2 = _interopRequireDefault(_dictionary);

var _google_spreadsheet = require('./google_spreadsheet');

var _google_spreadsheet2 = _interopRequireDefault(_google_spreadsheet);

var _gangs = require('../models/gangs');

var _gangs2 = _interopRequireDefault(_gangs);

var _telegram_bot = require('./../Telegram Bot/telegram_bot');

var _telegram_bot2 = _interopRequireDefault(_telegram_bot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  Chat ID of group Knight X

//  Require mongoose model
//  Import JSON dictionary
var KnightXChatID = process.env.KNIGHT_X_CHAT_ID,
    X_BANDChatID = process.env.X_BAND_CHAT_ID,

//  Google Sheets List URL
GoogleDocsURL = process.env.GOOGLE_SPREADSHEET_LINK,

//  Array with gang ID    
ArrayGangID = [KnightXChatID, X_BANDChatID];
//  Wait nickname room

//  Require Telegram Bot

//  Require google sheet
var waitNickname = {};
//  Callback bot on /usebot command
var callbackUsebot = function callbackUsebot(gangID, userID, username, language) {
    var gangIndex = ArrayGangID.indexOf('' + gangID),
        dictionaryMember = language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textAddToDatabase = dictionaryMember.textAddToDatabase,
        textNoticeGangCommand = dictionaryMember.textNoticeGangCommand,
        textAlreadyInDatabase = dictionaryMember.textAlreadyInDatabase;

    if (gangIndex < 0) {
        _telegram_bot2.default.sendMessage(gangID, textNoticeGangCommand);
        return;
    }
    var Members = _gangs2.default[gangIndex];
    Members.findOne({ userID: userID }, function (err, member) {
        if (err) {
            console.log(err);
            return;
        }
        switch (member === null) {
            case true:
                Members.create({
                    userID: userID,
                    gangID: gangID,
                    username: username,
                    nickname: username + ' [NEW]',
                    defend: '−',
                    free: '−',
                    heal: '−',
                    timer: 0,
                    isLeader: false,
                    isAdmin: false,
                    isMember: true,
                    language: language
                }, function (err, member) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    _telegram_bot2.default.sendMessage(gangID, '*' + username + '*, ' + textAddToDatabase, { parse_mode: 'Markdown' });
                    console.log('Object save:', member);
                });
                break;
            case false:
                _telegram_bot2.default.sendMessage(gangID, '*' + username + '*, ' + textAlreadyInDatabase, { parse_mode: 'Markdown' });
                break;
        }
    });
};
//  Callback bot on /defend and /free command
var callbackDefendFreeHeal = function callbackDefendFreeHeal(member, chatID, command) {
    var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textDefend = dictionaryMember.textDefend,
        textFree = dictionaryMember.textFree,
        textHeal = dictionaryMember.textHeal,
        textNoticeNotGangCommand = dictionaryMember.textNoticeNotGangCommand,
        keyboardDefendFree = [[{ text: '0', callback_data: '0' }, { text: '1', callback_data: '1' }, { text: '2', callback_data: '2' }, { text: '3', callback_data: '3' }]],
        keyboardHeal = [[{ text: '0', callback_data: '0' }, { text: '1', callback_data: '1' }, { text: '2', callback_data: '2' }, { text: '3', callback_data: '3' }, { text: '4', callback_data: '4' }, { text: '5', callback_data: '5' }], [{ text: '6', callback_data: '6' }, { text: '7', callback_data: '7' }, { text: '8', callback_data: '8' }, { text: '9', callback_data: '9' }, { text: '10', callback_data: '10' }]];

    var message = void 0,
        inline_keyboard = void 0;
    if (ArrayGangID.indexOf('' + chatID) > -1) {
        _telegram_bot2.default.sendMessage(chatID, textNoticeNotGangCommand);
        return;
    }
    if (command === '/defend') {
        message = textDefend;
        inline_keyboard = keyboardDefendFree;
    } else if (command === '/free') {
        message = textFree;
        inline_keyboard = keyboardDefendFree;
    } else if (command === '/heal') {
        message = textHeal;
        inline_keyboard = keyboardHeal;
    } else {
        return;
    }
    _telegram_bot2.default.sendMessage(chatID, message, {
        reply_markup: {
            inline_keyboard: inline_keyboard
        }
    });
};
//  Callback bot on /alarm command
var callbackAlarm = function callbackAlarm(member, chatID) {
    var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textAlarm = dictionaryMember.textAlarm,
        textAlarmButtonALL = dictionaryMember.textAlarmButtonALL,
        textAlarmButtonWITH = dictionaryMember.textAlarmButtonWITH,
        textNoticeGangCommand = dictionaryMember.textNoticeGangCommand;

    if (ArrayGangID.indexOf('' + chatID) < 0) {
        _telegram_bot2.default.sendMessage(chatID, textNoticeGangCommand);
        return;
    }
    _telegram_bot2.default.sendMessage(chatID, textAlarm, {
        reply_markup: {
            inline_keyboard: [[{ text: textAlarmButtonALL, callback_data: 'all' }, { text: textAlarmButtonWITH, callback_data: 'with cars' }]]
        }
    });
};
//  Callback bot on /list command
var callbackList = function callbackList(Members, member, chatID) {
    var totalDefend = 0,
        totalFree = 0,
        sleeping = 0,
        table = '*d | f | h |    tth    | NICKNAME *\n---------------------------------------------\n';
    Members.find({}, function (err, members) {
        var timer = void 0,
            now = void 0,
            timeToHeal = void 0;
        members.sort(alphabeticalSorting);
        if (err) {
            console.log(err);
            return;
        }
        for (var i = 0; i < members.length; i++) {
            timer = members[i].timer;
            now = new Date() / 60 / 1000;
            timeToHeal = msToTime(timer - now) ? msToTime(timer - now) : '  --:--  ';
            table += '*' + members[i].defend + ' | ' + members[i].free + ' | ' + members[i].heal + ' | ' + timeToHeal + ' | ' + members[i].nickname + '*\n';
            if (members[i].defend === '−') {
                sleeping++;
                continue;
            }
            totalDefend += +members[i].defend;
            totalFree += +members[i].free;
        }
        table += '---------------------------------------------\n*Def: ' + totalDefend + ' | Free: ' + totalFree + ' | Sleep: ' + sleeping + '*';
        _telegram_bot2.default.sendMessage(chatID, table, { parse_mode: 'Markdown' });
    });
};
//  Callback bot on /newbattle command
var callbackNewbattle = function callbackNewbattle(member, chatID) {
    var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textResetDatabase = dictionaryMember.textResetDatabase,
        textNoticeIsAdmin = dictionaryMember.textNoticeIsAdmin;

    if (!member.isAdmin) {
        _telegram_bot2.default.sendMessage(chatID, textNoticeIsAdmin);
        return;
    }
    _telegram_bot2.default.sendMessage(chatID, textResetDatabase, {
        reply_markup: {
            inline_keyboard: [[{ text: 'YES', callback_data: 'yes' }, { text: 'NO', callback_data: 'no' }]]
        }
    });
};
//  Callback bot on /spreadsheet command
var callbackSpreadsheet = function callbackSpreadsheet(Members, member, chatID) {
    if (member.gangID != KnightXChatID) {
        _telegram_bot2.default.sendMessage(chatID, 'Sorry! Unavailable for your gang.');
        return;
    }
    var data = [];
    Members.find({}, function (err, members) {
        if (err) {
            console.log(err);
            return;
        }
        members.sort(alphabeticalSorting);
        for (var i = 0; i < 25; i++) {
            if (i >= members.length) {
                data.push(['', '', '', '', '']);
            } else {
                var timer = members[i].timer,
                    now = new Date() / 60 / 1000,
                    timeToHeal = msToTime(timer - now);
                if (Number.isInteger(+members[i].defend)) {
                    data.push([members[i].nickname, +members[i].defend, +members[i].free, members[i].heal, timeToHeal]);
                } else {
                    data.push([members[i].nickname, members[i].defend, members[i].free, members[i].heal, timeToHeal]);
                }
            }
        }
        (0, _google_spreadsheet2.default)(data);
        _telegram_bot2.default.sendMessage(chatID, 'Go to the link!', {
            reply_markup: {
                inline_keyboard: [[{
                    text: 'Google Spreadsheet',
                    url: GoogleDocsURL
                }]]
            }
        });
    });
};

var callbackSetname = function callbackSetname(member, chatID) {
    var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textSetname = dictionaryMember.textSetname,
        textNoticeNotGangCommand = dictionaryMember.textNoticeNotGangCommand;

    if (ArrayGangID.indexOf('' + chatID) > -1) {
        _telegram_bot2.default.sendMessage(chatID, textNoticeNotGangCommand);
        return;
    }
    if (!waitNickname.userID) {
        waitNickname.userID = true;
        _telegram_bot2.default.sendMessage(chatID, textSetname);
    }
};

var callbackTimer = function callbackTimer(member, chatID) {
    var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textTimer = dictionaryMember.textTimer,
        textNoticeNotGangCommand = dictionaryMember.textNoticeNotGangCommand;

    var hours = 0,
        minutes = 0;
    if (ArrayGangID.indexOf('' + chatID) > -1) {
        _telegram_bot2.default.sendMessage(chatID, textNoticeNotGangCommand);
        return;
    }
    _telegram_bot2.default.sendMessage(chatID, textTimer, {
        reply_markup: {
            inline_keyboard: [[{ text: '🔼', callback_data: hours + '+1 ' + minutes }, { text: '+10 min', callback_data: hours + ' ' + minutes + '+10' }, { text: '🔼', callback_data: hours + ' ' + minutes + '+1' }], [{ text: '' + hours, callback_data: 'disabled' }, { text: ':', callback_data: 'disabled' }, { text: '' + minutes, callback_data: 'disabled' }], [{ text: '🔽', callback_data: hours + '-1 ' + minutes }, { text: '-10 min', callback_data: hours + ' ' + minutes + '-10' }, { text: '🔽', callback_data: hours + ' ' + minutes + '-1' }], [{ text: 'TURN OFF', callback_data: 'ok -1' }, { text: 'OK', callback_data: 'ok ' + (hours * 60 + minutes) }]]
        }
    });
};

var callbackMessage = function callbackMessage(Members, member, userID, nickname) {
    if (waitNickname.userID) {
        var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
            textErrorSetname = dictionaryMember.textErrorSetname,
            textSuccessSetname = dictionaryMember.textSuccessSetname;

        if (nickname.length < 3 || nickname.length > 15) {
            _telegram_bot2.default.sendMessage(userID, textErrorSetname);
            return;
        }
        waitNickname.userID = false;
        Members.findOneAndUpdate({ userID: userID }, { nickname: nickname }, function (err, member) {
            console.log(member.username + ' has changed nick to ' + nickname);
            _telegram_bot2.default.sendMessage(userID, textSuccessSetname + ' ' + nickname + '.');
        });
    }
};
//  Callback bot on /language command
var callbackLanguage = function callbackLanguage(member, chatID) {
    var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textChangeLanguage = dictionaryMember.textChangeLanguage,
        textNoticeNotGangCommand = dictionaryMember.textNoticeNotGangCommand;

    if (ArrayGangID.indexOf('' + chatID) > -1) {
        _telegram_bot2.default.sendMessage(chatID, textNoticeNotGangCommand);
        return;
    }
    _telegram_bot2.default.sendMessage(chatID, textChangeLanguage, {
        reply_markup: {
            inline_keyboard: [[{ text: 'EN', callback_data: 'en' }, { text: 'RU', callback_data: 'ru' }]]
        }
    });
};
//  Callback bot on /language command
var callbackEdit = function callbackEdit(Members, member, chatID) {
    var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textEdit = dictionaryMember.textEdit,
        textNoticeIsAdmin = dictionaryMember.textNoticeIsAdmin,
        textNoticeNotGangCommand = dictionaryMember.textNoticeNotGangCommand;

    var list = [];
    if (ArrayGangID.indexOf('' + chatID) > -1) {
        _telegram_bot2.default.sendMessage(KnightXChatID, textNoticeNotGangCommand);
        return;
    }
    if (!member.isAdmin) {
        _telegram_bot2.default.sendMessage(chatID, textNoticeIsAdmin);
        return;
    }
    Members.find({}, function (err, members) {
        members.sort(alphabeticalSorting);
        if (err) {
            console.log(err);
            return;
        }
        for (var i = 0; i < members.length; i += 2) {
            if (i + 1 !== members.length) {
                list.push([{ text: members[i].nickname, callback_data: members[i].userID + ' ' + members[i].nickname }, { text: members[i + 1].nickname, callback_data: members[i + 1].userID + ' ' + members[i + 1].nickname }]);
            } else {
                console.log(i);
                list.push([{ text: members[i].nickname, callback_data: members[i].userID + ' ' + members[i].nickname }]);
            }
        }
        _telegram_bot2.default.sendMessage(chatID, textEdit, {
            reply_markup: {
                inline_keyboard: list
            }
        });
    });
};

var callbackHelp = function callbackHelp(member, chatID) {
    var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textHelp = dictionaryMember.textHelp;

    _telegram_bot2.default.sendMessage(chatID, textHelp);
};
//  Alphabetical sorting
var alphabeticalSorting = function alphabeticalSorting(memberA, memberB) {
    if (memberA.nickname.toUpperCase() > memberB.nickname.toUpperCase()) {
        return 1;
    }
    if (memberA.nickname.toUpperCase() < memberB.nickname.toUpperCase()) {
        return -1;
    }
    return 0;
};

function msToTime(duration) {
    if (duration < 1) {
        return '';
    }
    var minutes = parseInt(duration % 60),
        hours = parseInt(duration / 60 % 24);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return hours + ":" + minutes;
}

module.exports.callbackDefendFreeHeal = callbackDefendFreeHeal;
module.exports.callbackUsebot = callbackUsebot;
module.exports.callbackLanguage = callbackLanguage;
module.exports.callbackAlarm = callbackAlarm;
module.exports.callbackList = callbackList;
module.exports.callbackNewbattle = callbackNewbattle;
module.exports.callbackSpreadsheet = callbackSpreadsheet;
module.exports.callbackSetname = callbackSetname;
module.exports.callbackMessage = callbackMessage;
module.exports.callbackTimer = callbackTimer;
module.exports.callbackHelp = callbackHelp;
module.exports.callbackEdit = callbackEdit;
module.exports.waitNickname = waitNickname;