//  Import JSON dictionary
import dictionary from './dictionary.json';
//  Require .env file
import dotenv from 'dotenv/config';
// Require FS module
import fs from'fs';
//  HTTP PORT
import http from 'http';
//  Connect Mongoose 
import mongoose from 'mongoose';
//  Require mongoose model
import Gangs from '../models/gangs';
//  Connect bot
import bot from './../Telegram Bot/telegram_bot';
//  Require callback query funcs
import callbackQueryFunctions from './callback_query_functions';
//  Require callback command funcs
import callbackCommandFunctions from './callback_command_functions';
//  Connect to KnightX database
//  MongoDB connect link
const MongoURL = process.env.MONGOOSE_CONNECT_LINK,
//  Port
      PORT     = process.env.PORT,
//  My user ID
      MyUserID = process.env.MY_USER_ID,
//  Bot tag  
      BotTag   = process.env.BOT_TAG;
mongoose.connect(MongoURL, { useNewUrlParser: true });
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
//  Run server
const port = PORT || 8080;
const requestHandler = (request, response) => {
  console.log(request.url);
  response.end('Hello Node.js Server!');
};
const server = http.createServer(requestHandler);
server.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});

bot.onText(/\/start.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/start')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackLanguage(member, chatID);
  });
  bot.sendMessage(chatID, 'Help: /help');
});

bot.onText(/\/usebot.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/usebot')) {
    return;
  }
  callbackCommandFunctions.callbackUsebot(chatID, userID, username, language);
});

bot.onText(/\/language.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/language')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackLanguage(member, chatID);
  });
});

bot.onText(/\/defend.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/defend')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackDefendFreeHeal(member, chatID, input);
  });
});

bot.onText(/\/free.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/free')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackDefendFreeHeal(member, chatID, match[0]);
  });
});

bot.onText(/\/heal.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/heal')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackDefendFreeHeal(member, chatID, match[0]);
  });
});

bot.onText(/\/alarm.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/alarm')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackAlarm(member, chatID);
  });
});

bot.onText(/\/list.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/list')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member, Members) => {
    callbackCommandFunctions.callbackList(Members, member, chatID);
  });
});

bot.onText(/\/newbattle.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/newbattle')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackNewbattle(member, chatID);
  });
});

bot.onText(/\/spreadsheet.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/spreadsheet')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member, Members) => {
    callbackCommandFunctions.callbackSpreadsheet(Members, member, chatID);
  });
});

bot.onText(/\/setname.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/setname')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackSetname(member, chatID);
  });
});


bot.onText(/\/timer.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/timer')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackTimer(member, chatID);
  });
});

bot.onText(/\/help.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/help')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member) => {
    callbackCommandFunctions.callbackHelp(member, chatID);
  });
});

bot.onText(/\/edit.*/, (msg, match) => {
  const input    = match[0].split(' ')[0],
        chatID   = msg.chat.id,
        userID   = msg.from.id,
        username = msg.from.username || msg.from.first_name,
        language = msg.from.language_code || 'en';
  if(isNotCommand(input, '/edit')) {
    return;
  }
  memberGang(userID, chatID, username, language, (member, Members) => {
    callbackCommandFunctions.callbackEdit(Members, member, chatID);
  })
});


bot.onText(/\/getid.*/, (msg, match) => {
  const chatID = msg.chat.id,
        userID = msg.from.id;
  if(userID != MyUserID) {
    bot.sendMessage('You are not an administrator!');
  }
  bot.sendMessage(chatID, `Success! Gang ID: ${chatID}`);
  console.log('Success! Gang ID:', chatID);
});

bot.on('message', (msg, match) => {
  const userID      = msg.from.id,
        chatID      = msg.chat.id,
        username    = msg.from.username,
        messageText = msg.text,
        language = msg.from.language_code || 'en';
  if(messageText === undefined || messageText.match(/\/.*/)) {
    callbackCommandFunctions.waitNickname.userID = false;
    return;
  }
  memberGang(userID, chatID, username, language, (member, Members) => {
    callbackCommandFunctions.callbackMessage(Members, member, userID, messageText);
  });
});

bot.on('callback_query', query => {
  try {
    const messageID = query.message.message_id,
          chatID    = query.message.chat.id,
          userID    = query.from.id,
          queryID   = query.id,
          username  = query.from.username || query.from.first_name,
          data      = query.data,
          language  = query.from.language_code || 'en';
      memberGang(userID, chatID, username, language, (member, Members) => {
        const dictionaryMember         = member.language === 'en' ? dictionary.EN : dictionary.RU,
             {textDefend, 
              textFree, 
              textHeal, 
              textPressNO,
              textPressYES,
              textAlarm,
              textTimer,
              textChangeLanguage, 
              textResetDatabase,
              textSpecifyFreeHeal,
              textSpecifyDefendHeal,
              textSpecifyDefendFree,
              textEdit,
              textEditMode}   = dictionaryMember;
        switch(query.message.text) {
          case textDefend:
              callbackQueryFunctions.callbackTextDefend(Members, 
                                                        member.free, 
                                                        data, 
                                                        username, 
                                                        chatID,
                                                        userID, 
                                                        messageID, 
                                                        textSpecifyFreeHeal);
            break;
          case textFree:
            callbackQueryFunctions.callbackTextFree(Members, 
                                                    member.defend, 
                                                    data, 
                                                    username, 
                                                    chatID,
                                                    userID, 
                                                    messageID, 
                                                    textSpecifyDefendHeal);
            break;
          case textHeal: 
            callbackQueryFunctions.callbackTextHeal(Members, 
                                                    data, 
                                                    username, 
                                                    chatID, 
                                                    userID,
                                                    messageID, 
                                                    textSpecifyDefendFree);
            break;
          case textChangeLanguage: 
            callbackQueryFunctions.callbackTextChangeLanguage(Members, 
                                                              data, 
                                                              username, 
                                                              chatID, 
                                                              userID,
                                                              messageID);
            break;
          case textResetDatabase:
            callbackQueryFunctions.callbackTextResetDatabase(Members, 
                                                             data,  
                                                             username, 
                                                             chatID,
                                                             messageID,
                                                             textPressNO,
                                                             textPressYES);
            break;
          case textAlarm:
            callbackQueryFunctions.callbackTextAlarm(Members, 
                                                    data, 
                                                    chatID,
                                                    messageID);
            break;
          case textTimer:
            callbackQueryFunctions.callbackTextTimer(Members, 
                                                     data, 
                                                     chatID, 
                                                     userID,
                                                     messageID,
                                                     queryID);
            break;
          case textEdit: 
           callbackQueryFunctions.callbackTextEdit(member,
                                                   data,
                                                   chatID,
                                                   messageID,
                                                   queryID);
            break;
          case textEditMode:
            callbackQueryFunctions.callbackTextEditMode(Members,
                                                        member,
                                                        data, 
                                                        username,
                                                        chatID,
                                                        messageID,
                                                        queryID);
            break;
        }
      });
  }
  catch(err) {
    console.log(err);
  }
});
//  Search gang of user
const memberGang = async (userID, chatID, username, language, callback) => {
    let isFound = false;
    for(let i = Gangs.length; i--;) {
      if(isFound) {
        return;
      }
      await Gangs[i].findOne({userID}, (err, member) => {
          if(err) {
            console.log(err);
          }
          if(member) {
              isFound = true;
              callback(member, Gangs[i]);
              return;
          }
          if(i === 0 && isFound === false) {
            const dictionaryMember   = language === 'en' ? dictionary.EN : dictionary.RU,
                {textNotInDatabase} = dictionaryMember;
            bot.sendMessage(chatID, `*${username}*, ${textNotInDatabase}`, {parse_mode: 'Markdown'});
          }
      });
    }
};
//  Timer
const timer = () => {
  let now   = new Date(),
      timer = (now.setMinutes(now.getMinutes()) / 1000 / 60).toFixed();
  return Gangs.map(gang => gang.find({timer}, (err, members) => {
    if(err) {
      console.log(err);
      return;
    }
    if(!members.length) {
      return;
    }
    for(let i = members.length; i--;) {
      const dictionaryMember = members[i].language === 'en' ? dictionary.EN : dictionary.RU,
           {textTimerRing}   = dictionaryMember;
      bot.sendMessage(members[i].userID, textTimerRing);
    }
  }));
};
//   
const isNotCommand = function(input, command) {
  if(input !== command && input !== command + BotTag) {
    return true;
  }
  else {
    return false;
  }
}
setInterval(timer, 60000);
