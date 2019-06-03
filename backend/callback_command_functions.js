//  Import JSON dictionary
import dictionary from './dictionary.json';
//  Require google sheet
import fillGoogleSpreadsheet from './google_spreadsheet';
//  Require mongoose model
import Gangs from '../models/gangs';
//  Require Telegram Bot
import bot from './../Telegram Bot/telegram_bot';
//  Chat ID of group Knight X
const KnightXChatID = process.env.KNIGHT_X_CHAT_ID,
      X_BANDChatID = process.env.X_BAND_CHAT_ID,
//  Google Sheets List URL
      GoogleDocsURL = process.env.GOOGLE_SPREADSHEET_LINK,
//  Array with gang ID    
      ArrayGangID   = [KnightXChatID, X_BANDChatID];
//  Wait nickname room
let waitNickname = {};
//  Callback bot on /usebot command
const callbackUsebot = (gangID, userID, username, language) => {
    const gangIndex              = ArrayGangID.indexOf(`${gangID}`),
          dictionaryMember       = language === 'en' ? dictionary.EN : dictionary.RU,
         {textAddToDatabase,
          textNoticeGangCommand,
          textAlreadyInDatabase} = dictionaryMember;
    if(gangIndex < 0) {
        bot.sendMessage(gangID, textNoticeGangCommand);
        return;
    }
    let Members = Gangs[gangIndex];
    Members.findOne({userID}, (err, member) => {
        if(err) {
            console.log(err);
            return;
        }
        switch(member === null) {
            case true:
                Members.create({
                userID,
                gangID,
                username,
                nickname: `${username} [NEW]`,
                defend: '−', 
                free: '−', 
                heal: '−', 
                timer: 0,
                isLeader: false,
                isAdmin: false, 
                isMember: true, 
                language
                }, (err, member) => {
                    if(err) {
                        console.log(err);
                        return;
                    }
                    bot.sendMessage(gangID, `*${username}*, ${textAddToDatabase}`, {parse_mode: 'Markdown'})
                    console.log('Object save:', member);
                });
                break;
            case false:
                bot.sendMessage(gangID, `*${username}*, ${textAlreadyInDatabase}`, {parse_mode: 'Markdown'});
                break;
        }
    });
};
//  Callback bot on /defend and /free command
const callbackDefendFreeHeal = (member, chatID, command) => {
    const dictionaryMember          = member.language === 'en' ? dictionary.EN : dictionary.RU,
         {textDefend,
          textFree,
          textHeal,
          textNoticeNotGangCommand} = dictionaryMember,
          keyboardDefendFree        = [
                                            [
                                                {text: '0',  callback_data: '0' }, 
                                                {text: '1',  callback_data: '1' }, 
                                                {text: '2',  callback_data: '2' }, 
                                                {text: '3',  callback_data: '3' }
                                            ]
                                      ],
          keyboardHeal              = [
                                            [
                                                {text: '0',  callback_data: '0' }, 
                                                {text: '1',  callback_data: '1' }, 
                                                {text: '2',  callback_data: '2' },
                                                {text: '3',  callback_data: '3' }, 
                                                {text: '4',  callback_data: '4' }, 
                                                {text: '5',  callback_data: '5' }
                                            ], 
                                            [
                                                {text: '6',  callback_data: '6' }, 
                                                {text: '7',  callback_data: '7' }, 
                                                {text: '8',  callback_data: '8' },
                                                {text: '9',  callback_data: '9' },
                                                {text: '10', callback_data: '10'}
                                            ]
                                      ];
    let message,
        inline_keyboard;
    if(ArrayGangID.indexOf(`${chatID}`) > -1) {
        bot.sendMessage(chatID, textNoticeNotGangCommand);
        return;
    }
    if(command === '/defend') {
        message         = textDefend;
        inline_keyboard = keyboardDefendFree;
    } 
    else if(command === '/free') {
        message         = textFree;
        inline_keyboard = keyboardDefendFree;
    }
    else if(command === '/heal') {
        message         = textHeal;
        inline_keyboard = keyboardHeal;
    }
    else {
        return;
    }
    bot.sendMessage(chatID, message, {
        reply_markup: {
            inline_keyboard
        }
    });
};
//  Callback bot on /alarm command
const callbackAlarm = (member, chatID) => {
    const dictionaryMember       = member.language === 'en' ? dictionary.EN : dictionary.RU,
         {textAlarm,
          textAlarmButtonALL,
          textAlarmButtonWITH,
          textNoticeGangCommand} = dictionaryMember;
    if(ArrayGangID.indexOf(`${chatID}`) < 0) {
        bot.sendMessage(chatID, textNoticeGangCommand);
        return;
    }
    bot.sendMessage(chatID, textAlarm, {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: textAlarmButtonALL,  callback_data: 'all'},
                    {text: textAlarmButtonWITH, callback_data: 'with cars'}
                ]
            ]
        }
    });
};
//  Callback bot on /list command
const callbackList = (Members, member, chatID) => {
    let totalDefend = 0,
        totalFree   = 0,
        sleeping    = 0,
        table       = `*d | f | h |    tth    | NICKNAME *\n---------------------------------------------\n`;
        Members.find({}, (err, members) => {
            let timer, 
                now, 
                timeToHeal;
            members.sort(alphabeticalSorting);
            if(err) {
                console.log(err);
                return;
            }
            for(let i = 0; i < members.length; i++) {
                timer = members[i].timer;
                now   = new Date() / 60 / 1000;
                timeToHeal = msToTime(timer - now) ? msToTime(timer - now) : '  --:--  ';
                table += `*${members[i].defend} | ${members[i].free} | ${members[i].heal} | ${timeToHeal} | ${members[i].nickname}*\n`;
                if(members[i].defend === '−') {
                    sleeping++;
                    continue;
                }
                totalDefend += +members[i].defend;
                totalFree += +members[i].free;
            }
            table += `---------------------------------------------\n*Def: ${totalDefend} | Free: ${totalFree} | Sleep: ${sleeping}*`;
            bot.sendMessage(chatID, table, {parse_mode: 'Markdown'});
        });
};
//  Callback bot on /newbattle command
const callbackNewbattle = (member, chatID) => {
    const dictionaryMember   = member.language === 'en' ? dictionary.EN : dictionary.RU,
         {textResetDatabase,
          textNoticeIsAdmin} = dictionaryMember;
    if(!member.isAdmin) {
        bot.sendMessage(chatID, textNoticeIsAdmin); 
        return;
    }
    bot.sendMessage(chatID, textResetDatabase, {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'YES', callback_data: 'yes'},
                    {text: 'NO',  callback_data: 'no' }
                ]
            ]
        }
    });
};
//  Callback bot on /spreadsheet command
const callbackSpreadsheet = (Members, member, chatID) => {
    if(member.gangID != KnightXChatID) {
        bot.sendMessage(chatID, 'Sorry! Unavailable for your gang.');
        return;
    }
    let data = [];
    Members.find({}, (err, members) => { 
        if(err) {
            console.log(err);
            return;
        }
        members.sort(alphabeticalSorting);
        for(let i = 0; i < 25; i++) {
            if(i >= members.length) {
                data.push(['', '', '', '', '']);
            } else {
                const timer = members[i].timer,
                      now   = new Date() / 60 / 1000,
                      timeToHeal = msToTime(timer - now);
                if(Number.isInteger(+members[i].defend)) {
                    data.push([members[i].nickname, +members[i].defend, +members[i].free, members[i].heal, timeToHeal]);
                }
                else {
                    data.push([members[i].nickname, members[i].defend, members[i].free, members[i].heal, timeToHeal]); 
                }
            }
        }
        fillGoogleSpreadsheet(data);
        bot.sendMessage(chatID, 'Go to the link!', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Google Spreadsheet',
                            url: GoogleDocsURL
                        }
                    ]
                ]
            }
        });
    });
};

const callbackSetname = (member, chatID) => {
    const dictionaryMember          = member.language === 'en' ? dictionary.EN : dictionary.RU,
         {textSetname,
          textNoticeNotGangCommand} = dictionaryMember;
    if(ArrayGangID.indexOf(`${chatID}`) > -1) {
        bot.sendMessage(chatID, textNoticeNotGangCommand);
        return;
    }
    if(!waitNickname.userID) {
        waitNickname.userID = true;
        bot.sendMessage(chatID, textSetname);
    }
};

const callbackTimer = (member, chatID) => {
    const dictionaryMember          = member.language === 'en' ? dictionary.EN : dictionary.RU,
         {textTimer,
          textNoticeNotGangCommand} = dictionaryMember;
    let hours = 0,
        minutes = 0;
    if(ArrayGangID.indexOf(`${chatID}`) > -1) {
        bot.sendMessage(chatID, textNoticeNotGangCommand);
        return;
    }
    bot.sendMessage(chatID, textTimer, {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: '🔼', callback_data: `${hours}+1 ${minutes}`},
                    {text: '+10 min', callback_data: `${hours} ${minutes}+10`},
                    {text: '🔼', callback_data: `${hours} ${minutes}+1`},
                ],
                [
                    {text: `${hours}`, callback_data: `disabled`},
                    {text: ':', callback_data: 'disabled'},
                    {text: `${minutes}`, callback_data: `disabled`},
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
        }
    });
};

const callbackMessage = (Members, member, userID, nickname) => {
    if(waitNickname.userID) {  
        const dictionaryMember    = member.language === 'en' ? dictionary.EN : dictionary.RU,
             {textErrorSetname,
              textSuccessSetname} = dictionaryMember;     
        if(nickname.length < 3 || nickname.length > 15) {
            bot.sendMessage(userID, textErrorSetname);
            return;
        }
        waitNickname.userID = false;
        Members.findOneAndUpdate({userID}, {nickname}, (err, member) => {
            console.log(`${member.username} has changed nick to ${nickname}`);
            bot.sendMessage(userID, `${textSuccessSetname} ${nickname}.`);
        });
    }
};
//  Callback bot on /language command
const callbackLanguage = (member, chatID) => {
    const dictionaryMember          = member.language === 'en' ? dictionary.EN : dictionary.RU,
         {textChangeLanguage,
          textNoticeNotGangCommand} = dictionaryMember;
    if(ArrayGangID.indexOf(`${chatID}`) > -1) {
        bot.sendMessage(chatID, textNoticeNotGangCommand);
        return;
    }
    bot.sendMessage(chatID, textChangeLanguage, {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'EN', callback_data: 'en'},
                    {text: 'RU', callback_data: 'ru'}
                ]
            ]
        }
    });
};
//  Callback bot on /language command
const callbackEdit = (Members, member, chatID) => {
    const dictionaryMember          = member.language === 'en' ? dictionary.EN : dictionary.RU,
         {textEdit,
          textNoticeIsAdmin,
          textNoticeNotGangCommand} = dictionaryMember;
    let list = [];
    if(ArrayGangID.indexOf(`${chatID}`) > -1) {
        bot.sendMessage(KnightXChatID, textNoticeNotGangCommand);
        return;
    }
    if(!member.isAdmin) {
        bot.sendMessage(chatID, textNoticeIsAdmin);
        return;
    }
    Members.find({}, (err, members) => {
        members.sort(alphabeticalSorting);
        if(err) {
            console.log(err);
            return;
        }
        for(let i = 0; i < members.length; i += 2) {
            if(i + 1 !== members.length) {
                list.push([
                    {text: members[i].nickname, callback_data: `${members[i].userID} ${members[i].nickname}`},
                    {text: members[i + 1].nickname, callback_data: `${members[i + 1].userID} ${members[i + 1].nickname}`}
                ]);
            } 
            else {
                console.log(i);
                list.push([
                    {text: members[i].nickname, callback_data: `${members[i].userID} ${members[i].nickname}`}
                ]);
            }
        }
        bot.sendMessage(chatID, textEdit, {
            reply_markup: {
                inline_keyboard: list
            }
        })
    });
};

const callbackHelp = (member, chatID) => {
        const dictionaryMember = member.language === 'en' ? dictionary.EN : dictionary.RU,
             {textHelp}        = dictionaryMember;
        bot.sendMessage(chatID, textHelp); 
};
//  Alphabetical sorting
const alphabeticalSorting = (memberA, memberB) => {
    if (memberA.nickname.toUpperCase() > memberB.nickname.toUpperCase()) {
        return 1;
    }
    if (memberA.nickname.toUpperCase() < memberB.nickname.toUpperCase()) {
        return -1;
    }
    return 0;
};

function msToTime(duration) {
    if(duration < 1) {
        return '';
    }
    var minutes = parseInt(duration % 60),
        hours = parseInt((duration / 60) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
  
    return hours + ":" + minutes;
  }

module.exports.callbackDefendFreeHeal = callbackDefendFreeHeal;
module.exports.callbackUsebot         = callbackUsebot;
module.exports.callbackLanguage       = callbackLanguage;
module.exports.callbackAlarm          = callbackAlarm;
module.exports.callbackList           = callbackList;
module.exports.callbackNewbattle      = callbackNewbattle;
module.exports.callbackSpreadsheet    = callbackSpreadsheet;
module.exports.callbackSetname        = callbackSetname;
module.exports.callbackMessage        = callbackMessage;
module.exports.callbackTimer          = callbackTimer;
module.exports.callbackHelp           = callbackHelp;
module.exports.callbackEdit           = callbackEdit;
module.exports.waitNickname           = waitNickname;