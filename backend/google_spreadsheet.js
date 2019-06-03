import fs from'fs';
import readline from 'readline';
import {google} from'googleapis';

//  If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
//  The file token.json stores the user's access and refresh tokens, and is
//  created automatically when the authorization flow completes for the first
//  time.
const TOKEN_PATH = 'token.json';

export default function fillGoogleSpreadsheet(data) {
    fs.readFile('credentials.json', (err, content) => {
        if(err) { 
            console.log('Error loading client secret file:', err);
            return;
        }
        //  Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), updateList, data);
    });
}

function authorize(credentials, callback, data) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//  Check if we have previously stored a token.
fs.readFile(TOKEN_PATH, (err, token) => {
    if(err) { 
        return getNewToken(oAuth2Client, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, data);
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', code => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if(err) {
                console.error('Error while trying to retrieve access token', err);
                return;
            }
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if(err) {
                    console.error(err);
                    return;
                }
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function updateList(oAuth2Client, data) {
    const sheets = google.sheets({version: 'v4', oAuth2Client});
    sheets.spreadsheets.values.update({
    //  The ID of the spreadsheet to update.
    spreadsheetId: process.env.GOOGLE_GANG_LIST_LINK,  
    //   The A1 notation of the values to update.
    range: 'Gang List!A2:E26',
    //   How the input data should be interpreted.
    valueInputOption: 'RAW', 
    resource: {
        "range":"Gang List!A2:E26",
        "majorDimension": "ROWS",
        "values": data
    },
    auth: oAuth2Client,
    }, function(err, response) {
    if (err) {
      console.error(err);
      return;
    }
  });
}