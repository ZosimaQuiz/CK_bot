'use strict';

var _dictionary = require('./dictionary.json');

var _dictionary2 = _interopRequireDefault(_dictionary);

var _telegram_bot = require('./../Telegram Bot/telegram_bot');

var _telegram_bot2 = _interopRequireDefault(_telegram_bot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } //  Import JSON dictionary

//  Require Telegram Bot


//  Callback bot on keystrokes in /defend 
var callbackTextDefend = function callbackTextDefend(Members, free, data, username, chatID, userID, messageID, textSpecifyFreeHeal) {
    var quantityCars = +free + +data,
        changes = quantityCars > 3 || !Number.isInteger(quantityCars) ? { defend: data, free: '' + (3 - +data) } : { defend: data },
        message = quantityCars > 3 || !Number.isInteger(quantityCars) ? 'DEFEND: ' + data + '.\nFREE changed to: ' + (3 - +data) : 'DEFEND: ' + data + '.\n',
        log = quantityCars > 3 || !Number.isInteger(quantityCars) ? username + ' has changed his DEFEND cars on ' + data + ' and FREE cars on ' + (3 - +data) : username + ' has changed his DEFEND cars on ' + data;
    Members.findOneAndUpdate({ userID: userID }, changes, function (err) {
        if (err) {
            throw err;
        }
        botQueryCallback(chatID, messageID, message, true, textSpecifyFreeHeal);
        console.log(log);
    });
};
//  Callback bot on keystrokes in /free 
var callbackTextFree = function callbackTextFree(Members, defend, data, username, chatID, userID, messageID, textSpecifyDefendHeal) {
    var quantityCars = +defend + +data,
        changes = quantityCars > 3 || !Number.isInteger(quantityCars) ? { free: data, defend: '' + (3 - +data) } : { free: data },
        message = quantityCars > 3 || !Number.isInteger(quantityCars) ? 'FREE: ' + data + '.\nDEFEND changed to: ' + (3 - +data) : 'FREE: ' + data + '.\n',
        log = quantityCars > 3 || !Number.isInteger(quantityCars) ? username + ' has changed his FREE cars on ' + data + ' and DEFEND cars on ' + (3 - +data) : username + ' has changed his FREE cars on ' + data;
    Members.findOneAndUpdate({ userID: userID }, changes, function (err) {
        if (err) {
            throw err;
        }
        botQueryCallback(chatID, messageID, message, true, textSpecifyDefendHeal);
        console.log(log);
    });
};
//  Callback bot on keystrokes in /heal 
var callbackTextHeal = function callbackTextHeal(Members, data, username, chatID, userID, messageID, textSpecifyDefendFree) {
    Members.findOneAndUpdate({ userID: userID }, { heal: data }, function (err) {
        if (err) {
            throw err;
        }
        botQueryCallback(chatID, messageID, 'HEAL: ' + data + '.\n', true, textSpecifyDefendFree);
        console.log(username + ' has changed his HEAL on ' + data);
    });
};
//  Callback bot on keystrokes in /language 
var callbackTextChangeLanguage = function callbackTextChangeLanguage(Members, data, username, chatID, userID, messageID) {
    Members.findOneAndUpdate({ userID: userID }, { language: data }, function (err, member) {
        if (err) {
            throw err;
        }
        var dictionaryMember = data === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
            textSuccessLanguage = dictionaryMember.textSuccessLanguage;

        botQueryCallback(chatID, messageID, textSuccessLanguage + ' ' + data.toUpperCase() + '.');
        console.log(username + ' has changed language to ' + data);
    });
};
//  Callback bot on keystrokes in /newbattle 
var callbackTextResetDatabase = function callbackTextResetDatabase(Members, data, username, chatID, messageID, messagePressNO, messagePressYES) {
    if (data === 'yes') {
        Members.updateMany({ defend: '−', free: '−', heal: '2' }, function (err) {
            if (err) {
                throw err;
            }
            botQueryCallback(chatID, messageID, messagePressYES);
            console.log(username + ' has changed database for new battle');
        });
    } else {
        botQueryCallback(chatID, messageID, messagePressNO);
    }
};
//  Callback bot on keystrokes in /alarm 
var callbackTextAlarm = function callbackTextAlarm(Members, data, chatID, messageID) {
    if (data == 'all') {
        Members.find({}, function (err, members) {
            if (err) {
                throw err;
            }
            for (var i = members.length; i--;) {
                var dictionaryMember = members[i].language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
                    textNoticeAlarm = dictionaryMember.textNoticeAlarm;

                _telegram_bot2.default.sendMessage(members[i].userID, members[i].nickname + ', ' + textNoticeAlarm);
            }
            _telegram_bot2.default.deleteMessage(chatID, messageID);
        });
    } else {
        Members.find(_defineProperty({
            $or: [{ free: '−' }, { free: '1' }, { free: '2' }, { free: '3' }, { heal: '1' }, { heal: '2' }, { heal: '3' }, { heal: '4' }, { heal: '5' }, { heal: '6' }, { heal: '7' }, { heal: '8' }, { heal: '9' }, { heal: '10' }]
        }, '$or', [{ defend: '2' }, { defend: '1' }, { defend: '0' }, { defend: '−' }]), function (err, members) {
            if (err) {
                throw err;
            }
            for (var i = members.length; i--;) {
                var dictionaryMember = members[i].language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
                    textNoticeAlarm = dictionaryMember.textNoticeAlarm;

                _telegram_bot2.default.sendMessage(members[i].userID, members[i].nickname + ', ' + textNoticeAlarm);
            }
            _telegram_bot2.default.deleteMessage(chatID, messageID);
        });
    }
};
//  Callback bot on keystrokes in /timer 
var callbackTextTimer = async function callbackTextTimer(Members, data, chatID, userID, messageID, queryID) {
    try {
        _telegram_bot2.default.answerCallbackQuery(queryID);
        data = data.split(' ');
        if (data[0] == 'ok') {
            var now = new Date(),
                timer = (now.setMinutes(now.getMinutes() + +data[1]) / 1000 / 60).toFixed();
            Members.findOneAndUpdate({ userID: userID }, { timer: timer }, function (err, member) {
                if (err) {
                    throw err;
                }
                var dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
                    textNextTimer = dictionaryMember.textNextTimer,
                    message = data[1] == '-1' ? 'Timer OFF.' : textNextTimer + ' ' + data[1] + 'm.';

                botQueryCallback(chatID, messageID, message);
                console.log(member.username + ' set timer at ' + data[1] + 'm');
            });
        } else if (data[0] === 'disabled') {
            return;
        } else {
            var minutes = eval(data[1]),
                hours = eval(data[0]);
            hours = minutes > 59 ? hours + 1 : minutes < 0 ? hours - 1 : hours, minutes = minutes > 59 ? minutes - 60 : minutes < 0 ? minutes + 60 : minutes;
            hours = hours < 0 ? 0 : hours;
            var inline_keyboard = [[{ text: '🔼', callback_data: hours + '+1 ' + minutes }, { text: '+10 min', callback_data: hours + ' ' + minutes + '+10' }, { text: '🔼', callback_data: hours + ' ' + minutes + '+1' }], [{ text: '' + hours, callback_data: 'disabled' }, { text: ':', callback_data: 'disabled' }, { text: '' + minutes, callback_data: 'disabled' }], [{ text: '🔽', callback_data: hours + '-1 ' + minutes }, { text: '-10 min', callback_data: hours + ' ' + minutes + '-10' }, { text: '🔽', callback_data: hours + ' ' + minutes + '-1' }], [{ text: 'TURN OFF', callback_data: 'ok -1' }, { text: 'OK', callback_data: 'ok ' + (hours * 60 + minutes) }]];
            await _telegram_bot2.default.editMessageReplyMarkup({
                inline_keyboard: inline_keyboard
            }, { chat_id: chatID, message_id: messageID });
        }
    } catch (err) {}
};
//  Callback bot on keystrokes in /edit 
var callbackTextEdit = function callbackTextEdit(member, data, chatID, messageID, queryID) {
    var dataArray = data.split(' '),
        nickname = dataArray[1],
        userID = dataArray[0],
        dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textEditMode = dictionaryMember.textEditMode,
        textSelectedMember = dictionaryMember.textSelectedMember,
        textDefendParagraph = dictionaryMember.textDefendParagraph,
        textFreeParagraph = dictionaryMember.textFreeParagraph,
        textAdminParagraph = dictionaryMember.textAdminParagraph,
        textDeleteParagraph = dictionaryMember.textDeleteParagraph,
        textCancelParagraph = dictionaryMember.textCancelParagraph;

    _telegram_bot2.default.answerCallbackQuery(queryID, { text: textSelectedMember + ' ' + nickname + '.' });
    _telegram_bot2.default.sendMessage(chatID, textEditMode, {
        reply_markup: {
            inline_keyboard: [[{ text: textDefendParagraph, callback_data: 'defend ' + userID }], [{ text: textFreeParagraph, callback_data: 'free ' + userID }], [{ text: textAdminParagraph, callback_data: 'admin ' + userID }], [{ text: textDeleteParagraph, callback_data: 'delete ' + userID }], [{ text: textCancelParagraph, callback_data: 'cancel ' + userID }]]
        }
    });
    _telegram_bot2.default.deleteMessage(chatID, messageID);
};
//  ADD RUSSIAN LANGUAGE !!!
var callbackTextEditMode = function callbackTextEditMode(Members, member, data, username, chatID, messageID, queryID) {
    var dataArray = data.split(' '),
        action = dataArray[0],
        userID = dataArray[1],
        changes = dataArray[2],
        dictionaryMember = member.language === 'en' ? _dictionary2.default.EN : _dictionary2.default.RU,
        textDefendParagraph = dictionaryMember.textDefendParagraph,
        textFreeParagraph = dictionaryMember.textFreeParagraph,
        textAdminParagraph = dictionaryMember.textAdminParagraph,
        textDeleteParagraph = dictionaryMember.textDeleteParagraph,
        textCancelParagraph = dictionaryMember.textCancelParagraph,
        textGiveAdmin = dictionaryMember.textGiveAdmin,
        textRidAdmin = dictionaryMember.textRidAdmin,
        textButtonYES = dictionaryMember.textButtonYES,
        textButtonNO = dictionaryMember.textButtonNO,
        keyboardDefend = [{ text: '0', callback_data: 'defend ' + userID + ' 0' }, { text: '1', callback_data: 'defend ' + userID + ' 1' }, { text: '2', callback_data: 'defend ' + userID + ' 2' }, { text: '3', callback_data: 'defend ' + userID + ' 3' }],
        keyboardFree = [{ text: '0', callback_data: 'free ' + userID + ' 0' }, { text: '1', callback_data: 'free ' + userID + ' 1' }, { text: '2', callback_data: 'free ' + userID + ' 2' }, { text: '3', callback_data: 'free ' + userID + ' 3' }],
        keyboardAdmin = [{ text: textGiveAdmin, callback_data: 'give ' + userID + ' true' }, { text: textRidAdmin, callback_data: 'rid ' + userID + ' false' }],
        keyboardDelete = [{ text: textButtonYES, callback_data: 'yes ' + userID + ' true' }, { text: textButtonNO, callback_data: 'no ' + userID + ' false' }],
        menuKeyboard = [[{ text: textDefendParagraph, callback_data: 'defend ' + userID }], [{ text: textFreeParagraph, callback_data: 'free ' + userID }], [{ text: textAdminParagraph, callback_data: 'admin ' + userID }], [{ text: textDeleteParagraph, callback_data: 'delete ' + userID }], [{ text: textCancelParagraph, callback_data: 'cancel ' + userID }]],
        standartKeyboard = [].concat(menuKeyboard);
    // If dataArray contain 2 properties(information and userID), then admin select information for change;
    // If dataArray contain 3 properties(infromation, userID and data), then admin changes infromation;
    if (dataArray.length === 2) {
        selectInformation(action, chatID, messageID, keyboardDefend, keyboardFree, keyboardAdmin, keyboardDelete, menuKeyboard);
    } else if (dataArray.length === 3) {
        changeInformation(action, Members, username, chatID, +userID, messageID, queryID, +changes, menuKeyboard, standartKeyboard);
    }
};

var selectInformation = function selectInformation(action, chatID, messageID, keyboardDefend, keyboardFree, keyboardAdmin, keyboardDelete, menuKeyboard) {
    switch (action) {
        case 'defend':
            changeInlineKeyboard(0, keyboardDefend, menuKeyboard, chatID, messageID);
            break;
        case 'free':
            changeInlineKeyboard(1, keyboardFree, menuKeyboard, chatID, messageID);
            break;
        case 'admin':
            changeInlineKeyboard(2, keyboardAdmin, menuKeyboard, chatID, messageID);
            break;
        case 'delete':
            changeInlineKeyboard(3, keyboardDelete, menuKeyboard, chatID, messageID);
            break;
        case 'cancel':
            _telegram_bot2.default.deleteMessage(chatID, messageID);
            break;
    }
};

var changeInformation = function changeInformation(action, Members, username, chatID, userID, messageID, queryID, changes, menuKeyboard, standartKeyboard) {
    try {
        var answer = '',
            log = '',
            quantityCars = void 0;
        switch (action) {
            case 'defend':
                Members.findOneAndUpdate({ userID: userID }, { defend: changes }, function (err, member) {
                    if (err) {
                        throw err;
                    }
                    changeInlineKeyboard(0, standartKeyboard[0], menuKeyboard, chatID, messageID);
                    quantityCars = +member.free + changes;
                    answer += 'DEFEND cars of ' + member.nickname + ': ' + changes + '.';
                    log += username + ' changed DEFEND cars of ' + member.nickname + ' to ' + changes + '.';
                    if (quantityCars > 3 || !Number.isInteger(quantityCars)) {
                        answer += ' FREE cars: ' + (3 - changes) + '.';
                        log += ' FREE cars changed to ' + (3 - changes);
                        Members.findOneAndUpdate({ userID: userID }, { free: '' + (3 - changes) }, function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                    console.log(log);
                    _telegram_bot2.default.answerCallbackQuery(queryID, { text: answer });
                });
                break;
            case 'free':
                Members.findOneAndUpdate({ userID: userID }, { free: changes }, function (err, member) {
                    if (err) {
                        throw err;
                    }
                    changeInlineKeyboard(1, standartKeyboard[1], menuKeyboard, chatID, messageID);
                    quantityCars = +member.defend + changes;
                    answer += 'FREE cars of ' + member.nickname + ': ' + changes + '.';
                    log += username + ' changed FREE cars of ' + member.nickname + ' to ' + changes + '.';
                    if (quantityCars > 3 || !Number.isInteger(quantityCars)) {
                        answer += ' DEFEND cars: ' + (3 - changes);
                        log += ' DEFEND cars changed to ' + (3 - changes);
                        Members.findOneAndUpdate({ userID: userID }, { defend: '' + (3 - changes) }, function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                    _telegram_bot2.default.answerCallbackQuery(queryID, { text: answer });
                    console.log(log);
                });
                break;
            case 'give':
                Members.findOneAndUpdate({ userID: userID }, { isAdmin: true }, function (err, member) {
                    if (err) {
                        throw err;
                    }
                    changeInlineKeyboard(2, standartKeyboard[2], menuKeyboard, chatID, messageID);
                    _telegram_bot2.default.answerCallbackQuery(queryID, { text: member.nickname + ' got admin right.' });
                    console.log(username + ' gave admin right to ' + member.nickname);
                });
                break;
            case 'rid':
                Members.findOneAndUpdate({ userID: userID, isLeader: false }, { isAdmin: false }, function (err, member) {
                    if (err) {
                        throw err;
                    }
                    if (changeInlineKeyboard(2, standartKeyboard[2], menuKeyboard, chatID, messageID) || member === null) {
                        _telegram_bot2.default.answerCallbackQuery(queryID, { text: '\u041D\u0435\u043B\u044C\u0437\u044F \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u043B\u0438\u0434\u0435\u0440\u0430.' });
                        return;
                    }
                    console.log(username + ' deprived admin right of ' + member.nickname);
                });
                break;
            case 'yes':
                Members.findOneAndDelete({ userID: userID, isLeader: false }, function (err, member) {
                    if (err) {
                        throw err;
                    }
                    if (changeInlineKeyboard(2, standartKeyboard[2], menuKeyboard, chatID, messageID) || member === null) {
                        _telegram_bot2.default.answerCallbackQuery(queryID, { text: '\u041D\u0435\u043B\u044C\u0437\u044F \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u043B\u0438\u0434\u0435\u0440\u0430.' });
                        return;
                    }
                    _telegram_bot2.default.deleteMessage(chatID, messageID);
                    _telegram_bot2.default.answerCallbackQuery(queryID, { text: 'You removed ' + member.nickname + '.' });
                    console.log(username + ' removed ' + member.nickname + ' from gang');
                });
                break;
            case 'no':
                changeInlineKeyboard(3, standartKeyboard[3], menuKeyboard, chatID, messageID);
                _telegram_bot2.default.answerCallbackQuery(queryID, { text: 'You press \xABNO\xBB.' });
                break;
        }
    } catch (err) {
        console.log(err);
    }
};
//  Func for change inline_keyboard
var changeInlineKeyboard = function changeInlineKeyboard(indexMenu, changes, menuKeyboard, chatID, messageID) {
    menuKeyboard[indexMenu] = changes;
    _telegram_bot2.default.editMessageReplyMarkup({
        inline_keyboard: menuKeyboard
    }, { chat_id: chatID, message_id: messageID });
};
//  Bot callback function
var botQueryCallback = function botQueryCallback(chatID, messageID, message, promise, textSpecify) {
    _telegram_bot2.default.sendMessage(chatID, message);
    _telegram_bot2.default.deleteMessage(chatID, messageID);
    if (promise) {
        _telegram_bot2.default.sendMessage(chatID, textSpecify).then(function (msg) {
            setTimeout(deleteMessage, 10000, chatID, msg.message_id);
        });
    }
};
//  Func for delete message with delay
var deleteMessage = function deleteMessage(chatID, messageID) {
    _telegram_bot2.default.deleteMessage(chatID, messageID);
};
module.exports.callbackTextChangeLanguage = callbackTextChangeLanguage;
module.exports.callbackTextResetDatabase = callbackTextResetDatabase;
module.exports.callbackTextDefend = callbackTextDefend;
module.exports.callbackTextFree = callbackTextFree;
module.exports.callbackTextHeal = callbackTextHeal;
module.exports.callbackTextAlarm = callbackTextAlarm;
module.exports.callbackTextEdit = callbackTextEdit;
module.exports.callbackTextEditMode = callbackTextEditMode;
module.exports.callbackTextTimer = callbackTextTimer;