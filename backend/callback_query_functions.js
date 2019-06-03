//  Import JSON dictionary
import dictionary from './dictionary.json';
//  Require Telegram Bot
import bot from './../Telegram Bot/telegram_bot';
//  Callback bot on keystrokes in /defend 
const callbackTextDefend = (Members, free, data, username, chatID,  userID, messageID, textSpecifyFreeHeal) => {
    let quantityCars = +free + +data,
        changes      = (quantityCars > 3) || (!Number.isInteger(quantityCars)) ? {defend: data, free: `${3 - +data}`} : {defend: data},
        message      = (quantityCars > 3) || (!Number.isInteger(quantityCars)) ? `DEFEND: ${data}.\nFREE changed to: ${3 - +data}` : `DEFEND: ${data}.\n`,
        log          = (quantityCars > 3) || (!Number.isInteger(quantityCars)) ? `${username} has changed his DEFEND cars on ${data} and FREE cars on ${3 - +data}` : `${username} has changed his DEFEND cars on ${data}`;
    Members.findOneAndUpdate({userID}, changes, (err)=> {
        if(err) {
            throw err;
        }
        botQueryCallback(chatID, messageID, message, true, textSpecifyFreeHeal);
        console.log(log);
    });
};
//  Callback bot on keystrokes in /free 
const callbackTextFree = (Members, defend, data, username, chatID, userID, messageID, textSpecifyDefendHeal) => {
    let quantityCars = +defend + +data,
        changes      = (quantityCars > 3) || (!Number.isInteger(quantityCars)) ? {free: data, defend: `${3 - +data}`} : {free: data},
        message      = (quantityCars > 3) || (!Number.isInteger(quantityCars)) ? `FREE: ${data}.\nDEFEND changed to: ${3 - +data}` : `FREE: ${data}.\n`,
        log          = (quantityCars > 3) || (!Number.isInteger(quantityCars)) ? `${username} has changed his FREE cars on ${data} and DEFEND cars on ${3 - +data}` : `${username} has changed his FREE cars on ${data}`;
    Members.findOneAndUpdate({userID}, changes, (err) => {
        if(err) {
            throw err;
        }
        botQueryCallback(chatID, messageID, message, true, textSpecifyDefendHeal);
        console.log(log);
    });
};
//  Callback bot on keystrokes in /heal 
const callbackTextHeal = (Members, data, username, chatID, userID, messageID, textSpecifyDefendFree) => {
    Members.findOneAndUpdate({userID}, {heal: data}, (err) => {
        if(err) {
          throw err;
        }
        botQueryCallback(chatID, messageID, `HEAL: ${data}.\n`, true, textSpecifyDefendFree);
        console.log(`${username} has changed his HEAL on ${data}`);
    });
};
//  Callback bot on keystrokes in /language 
const callbackTextChangeLanguage = (Members, data, username, chatID, userID, messageID) => {
    Members.findOneAndUpdate({userID}, {language: data}, (err, member) => {
        if(err) {
          throw err;
        }
        const dictionaryMember     = data === 'en' ? dictionary.EN : dictionary.RU,
             {textSuccessLanguage} = dictionaryMember;
        botQueryCallback(chatID, messageID, `${textSuccessLanguage} ${data.toUpperCase()}.`);
        console.log(`${username} has changed language to ${data}`);
    });
};
//  Callback bot on keystrokes in /newbattle 
const callbackTextResetDatabase = (Members, data, username, chatID, messageID, messagePressNO, messagePressYES) => {
    if(data === 'yes') {
        Members.updateMany({defend: '−', free: '−', heal: '2'}, (err) => {
            if(err) {
                throw err;
            }
            botQueryCallback(chatID, messageID, messagePressYES);
            console.log(`${username} has changed database for new battle`);
        });
    }
    else {
        botQueryCallback(chatID, messageID, messagePressNO);
    }
};
//  Callback bot on keystrokes in /alarm 
const callbackTextAlarm = (Members, data, chatID, messageID) => {
    if(data == 'all') {
        Members.find({}, (err, members) => {
            if(err) {
                throw err;
            }
            for(let i = members.length; i--;) {
                const dictionaryMember = members[i].language === 'en' ? dictionary.EN : dictionary.RU,
                     {textNoticeAlarm} = dictionaryMember;
                bot.sendMessage(members[i].userID, `${members[i].nickname}, ${textNoticeAlarm}`);
            }
            bot.deleteMessage(chatID, messageID);
        });
    }
    else {
        Members.find({
            $or: [
                {free: '−'},
                {free: '1'},
                {free: '2'},
                {free: '3'},
                {heal: '1'},
                {heal: '2'},
                {heal: '3'},
                {heal: '4'},
                {heal: '5'},
                {heal: '6'},
                {heal: '7'},
                {heal: '8'},
                {heal: '9'},
                {heal: '10'},
            ],
            $or: [	  
                {defend: '2'},
                {defend: '1'},
                {defend: '0'},
                {defend: '−'}
            ] 
        }, (err, members) => {
            if(err) {
                throw err;
            }
            for(let i = members.length; i--;) {
                const dictionaryMember = members[i].language === 'en' ? dictionary.EN : dictionary.RU,
                     {textNoticeAlarm} = dictionaryMember;
                bot.sendMessage(members[i].userID, `${members[i].nickname}, ${textNoticeAlarm}`);
            }
            bot.deleteMessage(chatID, messageID);
        });
    }
};
//  Callback bot on keystrokes in /timer 
const callbackTextTimer = async (Members, data, chatID, userID, messageID, queryID) => {
    try { 
        bot.answerCallbackQuery(queryID);
        data = data.split(' ');
        if(data[0] == 'ok') {
            const now   = new Date(),
                timer = (now.setMinutes(now.getMinutes() + +data[1]) / 1000 / 60).toFixed();
            Members.findOneAndUpdate({userID}, {timer}, (err, member) => {
                if(err) {
                    throw err;
                }
                const dictionaryMember = member.language === 'en' ? dictionary.EN : dictionary.RU,
                    {textNextTimer}   = dictionaryMember,
                    message = data[1] == '-1' ? 'Timer OFF.' : `${textNextTimer} ${data[1]}m.`; 
                botQueryCallback(chatID, messageID, message);
                console.log(`${member.username} set timer at ${data[1]}m`);
            });
        }
        else if(data[0] === 'disabled') {
            return;
        }
        else {
            let minutes = eval(data[1]),
                hours   = eval(data[0]);
                hours   = minutes > 59 ? 
                        hours + 1 : 
                        minutes < 0 ? 
                        hours - 1 : 
                        hours,
                minutes = minutes > 59 ?
                        minutes - 60 :
                        minutes < 0 ?
                        minutes + 60 :
                        minutes;
                hours   = hours < 0 ? 0 : hours;
            const inline_keyboard = [
                [
                    {text: '🔼', callback_data: `${hours}+1 ${minutes}`},
                    {text: '+10 min', callback_data: `${hours} ${minutes}+10`},
                    {text: '🔼', callback_data: `${hours} ${minutes}+1`},
                ],
                [
                    {text: `${hours}`, callback_data: 'disabled'},
                    {text: ':', callback_data: 'disabled'},
                    {text: `${minutes}`, callback_data: 'disabled'},
                ],
                [
                    {text: '🔽', callback_data: `${hours}-1 ${minutes}` },
                    {text: '-10 min', callback_data: `${hours} ${minutes}-10`},
                    {text: '🔽', callback_data: `${hours} ${minutes}-1`},
                ],
                [
                    {text: 'TURN OFF', callback_data: `ok -1` },
                    {text: 'OK', callback_data: `ok ${hours * 60 + minutes}` },
                ]
            ]
            await bot.editMessageReplyMarkup({
                inline_keyboard 
            }, {chat_id: chatID, message_id: messageID});
        }
    } 
    catch(err) {
        
    }
};
//  Callback bot on keystrokes in /edit 
const callbackTextEdit = (member, data, chatID, messageID, queryID) => {
    const dataArray = data.split(' '),
          nickname  = dataArray[1],
          userID    = dataArray[0],
          dictionaryMember     = member.language === 'en' ? dictionary.EN : dictionary.RU,
         {textEditMode,
          textSelectedMember,
          textDefendParagraph,
          textFreeParagraph,
          textAdminParagraph,
          textDeleteParagraph,
          textCancelParagraph} = dictionaryMember;
    bot.answerCallbackQuery(queryID, {text: `${textSelectedMember} ${nickname}.`});
    bot.sendMessage(chatID, textEditMode, {
        reply_markup: {
            inline_keyboard: [[{text: textDefendParagraph, callback_data: `defend ${userID}`}], 
                              [{text: textFreeParagraph,   callback_data:   `free ${userID}`}], 
                              [{text: textAdminParagraph,  callback_data:  `admin ${userID}`}],
                              [{text: textDeleteParagraph, callback_data: `delete ${userID}`}],
                              [{text: textCancelParagraph, callback_data: `cancel ${userID}`}]]
        }
    });
    bot.deleteMessage(chatID, messageID);
};
//  ADD RUSSIAN LANGUAGE !!!
const callbackTextEditMode = (Members, member, data, username, chatID, messageID, queryID) => {
    const dataArray        = data.split(' '),
          action           = dataArray[0],
          userID           = dataArray[1],
          changes          = dataArray[2],
          dictionaryMember     = member.language === 'en' ? dictionary.EN : dictionary.RU,
         {textDefendParagraph,
          textFreeParagraph,
          textAdminParagraph,
          textDeleteParagraph,
          textCancelParagraph,
          textGiveAdmin,  
          textRidAdmin,
          textButtonYES,
          textButtonNO}       = dictionaryMember,
          keyboardDefend    = [
                                {text: '0', callback_data: `defend ${userID} 0`},
                                {text: '1', callback_data: `defend ${userID} 1`},
                                {text: '2', callback_data: `defend ${userID} 2`}, 
                                {text: '3', callback_data: `defend ${userID} 3`}
                            ],
          keyboardFree     = [
                                {text: '0', callback_data: `free ${userID} 0`},
                                {text: '1', callback_data: `free ${userID} 1`},
                                {text: '2', callback_data: `free ${userID} 2`}, 
                                {text: '3', callback_data: `free ${userID} 3`}
                            ],
          keyboardAdmin    = [
                                {text: textGiveAdmin, callback_data: `give ${userID} true`},
                                {text: textRidAdmin,  callback_data: `rid ${userID} false`}
                            ],
          keyboardDelete   = [
                                {text: textButtonYES, callback_data: `yes ${userID} true`},
                                {text: textButtonNO,  callback_data: `no ${userID} false`}
                            ],
          menuKeyboard     = [
                                [{text: textDefendParagraph, callback_data: `defend ${userID}`}], 
                                [{text: textFreeParagraph,   callback_data:   `free ${userID}`}], 
                                [{text: textAdminParagraph,  callback_data:  `admin ${userID}`}],
                                [{text: textDeleteParagraph, callback_data: `delete ${userID}`}],
                                [{text: textCancelParagraph, callback_data: `cancel ${userID}`}]
                            ],
          standartKeyboard = [
                                ...menuKeyboard
                             ];
    // If dataArray contain 2 properties(information and userID), then admin select information for change;
    // If dataArray contain 3 properties(infromation, userID and data), then admin changes infromation;
    if(dataArray.length === 2) { 
        selectInformation(action, 
                          chatID,
                          messageID, 
                          keyboardDefend, 
                          keyboardFree, 
                          keyboardAdmin, 
                          keyboardDelete, 
                          menuKeyboard);
    }
    else if(dataArray.length === 3) {
        changeInformation(action, 
                          Members, 
                          username, 
                          chatID, 
                         +userID, 
                          messageID, 
                          queryID, 
                         +changes, 
                          menuKeyboard, 
                          standartKeyboard);
    }
};

const selectInformation = (action, chatID, messageID, keyboardDefend, keyboardFree, keyboardAdmin, keyboardDelete, menuKeyboard) => {
    switch(action) {
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
            bot.deleteMessage(chatID, messageID);
            break; 
    } 
}

const changeInformation = (action, Members, username, chatID, userID, messageID, queryID, changes, menuKeyboard, standartKeyboard) => {
    try {
        let answer = ``,
            log    = ``,
            quantityCars;
        switch(action) {
            case 'defend':
                Members.findOneAndUpdate({userID}, {defend: changes},  (err, member) => {
                    if(err) {
                        throw err;
                    }
                    changeInlineKeyboard(0, standartKeyboard[0], menuKeyboard, chatID, messageID);
                    quantityCars = +member.free + changes;
                    answer += `DEFEND cars of ${member.nickname}: ${changes}.`;     
                    log    += `${username} changed DEFEND cars of ${member.nickname} to ${changes}.`;
                    if(quantityCars > 3 || !Number.isInteger(quantityCars)) {
                        answer += ` FREE cars: ${3 - changes}.`;
                        log    += ` FREE cars changed to ${3 - changes}`;
                        Members.findOneAndUpdate({userID}, {free: `${3 - changes}`}, (err) => {
                            if(err) {
                                throw err;
                            }
                        });
                    }
                    console.log(log);
                    bot.answerCallbackQuery(queryID, {text: answer});  
                });
                break;
            case 'free':
                Members.findOneAndUpdate({userID}, {free: changes}, (err, member) => {
                    if(err) {
                        throw err;
                    }
                    changeInlineKeyboard(1, standartKeyboard[1], menuKeyboard, chatID, messageID);
                    quantityCars = +member.defend + changes;
                    answer  += `FREE cars of ${member.nickname}: ${changes}.`
                    log     += `${username} changed FREE cars of ${member.nickname} to ${changes}.`
                    if(quantityCars > 3 || !Number.isInteger(quantityCars)) {
                        answer += ` DEFEND cars: ${3 - changes}`;
                        log    += ` DEFEND cars changed to ${3 - changes}`;
                        Members.findOneAndUpdate({userID}, {defend: `${3 - changes}`},  (err) => {
                            if(err) {
                                throw err;
                            }
                        });
                    }
                    bot.answerCallbackQuery(queryID, {text: answer});
                    console.log(log);
                });
                break;
            case 'give':
                Members.findOneAndUpdate({userID}, {isAdmin: true}, (err, member) => {
                    if(err) {
                        throw err;
                    }
                    changeInlineKeyboard(2, standartKeyboard[2], menuKeyboard, chatID, messageID);
                    bot.answerCallbackQuery(queryID, {text: `${member.nickname} got admin right.`});
                    console.log(`${username} gave admin right to ${member.nickname}`)
                });
                break;
            case 'rid':
                Members.findOneAndUpdate({userID, isLeader: false}, {isAdmin: false}, (err, member) => {
                    if(err) {
                        throw err;
                    }
                    if(changeInlineKeyboard(2, standartKeyboard[2], menuKeyboard, chatID, messageID) || member === null) {
                        bot.answerCallbackQuery(queryID, {text: `Нельзя удалить лидера.`});
                        return;
                    }
                    console.log(`${username} deprived admin right of ${member.nickname}`);
                });
                break;
            case 'yes':
                Members.findOneAndDelete({userID, isLeader: false}, (err, member) => {
                    if(err) {
                        throw err;
                    }
                    if(changeInlineKeyboard(2, standartKeyboard[2], menuKeyboard, chatID, messageID) || member === null) {
                        bot.answerCallbackQuery(queryID, {text: `Нельзя удалить лидера.`});
                        return;
                    }
                    bot.deleteMessage(chatID, messageID);
                    bot.answerCallbackQuery(queryID, {text: `You removed ${member.nickname}.`});
                    console.log(`${username} removed ${member.nickname} from gang`); 
                });
                break;
            case 'no':
                changeInlineKeyboard(3, standartKeyboard[3], menuKeyboard, chatID, messageID);
                bot.answerCallbackQuery(queryID, {text: `You press «NO».`});
                break;
        }
    }
    catch(err) {
        console.log(err);
    }
}
//  Func for change inline_keyboard
const changeInlineKeyboard = (indexMenu, changes, menuKeyboard, chatID, messageID) => {
    menuKeyboard[indexMenu] = changes;
    bot.editMessageReplyMarkup({
        inline_keyboard: menuKeyboard 
    }, {chat_id: chatID, message_id: messageID});
}
//  Bot callback function
const botQueryCallback = (chatID, messageID, message, promise, textSpecify) => {
    bot.sendMessage(chatID, message);
    bot.deleteMessage(chatID, messageID);
    if(promise) {
        bot.sendMessage(chatID, textSpecify).then(msg => {
            setTimeout(deleteMessage, 10000, chatID, msg.message_id);
        });
    }
}
//  Func for delete message with delay
const deleteMessage = (chatID, messageID) => {
    bot.deleteMessage(chatID, messageID);
};
module.exports.callbackTextChangeLanguage = callbackTextChangeLanguage;
module.exports.callbackTextResetDatabase  = callbackTextResetDatabase;
module.exports.callbackTextDefend         = callbackTextDefend;
module.exports.callbackTextFree           = callbackTextFree;
module.exports.callbackTextHeal           = callbackTextHeal;
module.exports.callbackTextAlarm          = callbackTextAlarm;
module.exports.callbackTextEdit           = callbackTextEdit;
module.exports.callbackTextEditMode       = callbackTextEditMode;
module.exports.callbackTextTimer          = callbackTextTimer;