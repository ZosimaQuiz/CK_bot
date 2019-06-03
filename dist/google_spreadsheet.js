'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = fillGoogleSpreadsheet;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _googleapis = require('googleapis');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  If modifying these scopes, delete token.json.
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
//  The file token.json stores the user's access and refresh tokens, and is
//  created automatically when the authorization flow completes for the first
//  time.
var TOKEN_PATH = 'token.json';

function fillGoogleSpreadsheet(data) {
    _fs2.default.readFile('credentials.json', function (err, content) {
        if (err) {
            console.log('Error loading client secret file:', err);
            return;
        }
        //  Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), updateList, data);
    });
}

function authorize(credentials, callback, data) {
    var _credentials$installe = credentials.installed,
        client_secret = _credentials$installe.client_secret,
        client_id = _credentials$installe.client_id,
        redirect_uris = _credentials$installe.redirect_uris;

    var oAuth2Client = new _googleapis.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    //  Check if we have previously stored a token.
    _fs2.default.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            return getNewToken(oAuth2Client, callback);
        }
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, data);
    });
}

function getNewToken(oAuth2Client, callback) {
    var authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    var rl = _readline2.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oAuth2Client.getToken(code, function (err, token) {
            if (err) {
                console.error('Error while trying to retrieve access token', err);
                return;
            }
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            _fs2.default.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
                if (err) {
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
    var sheets = _googleapis.google.sheets({ version: 'v4', oAuth2Client: oAuth2Client });
    sheets.spreadsheets.values.update({
        //  The ID of the spreadsheet to update.
        spreadsheetId: process.env.GOOGLE_GANG_LIST_LINK,
        //   The A1 notation of the values to update.
        range: 'Gang List!A2:E26',
        //   How the input data should be interpreted.
        valueInputOption: 'RAW',
        resource: {
            "range": "Gang List!A2:E26",
            "majorDimension": "ROWS",
            "values": data
        },
        auth: oAuth2Client
    }, function (err, response) {
        if (err) {
            console.error(err);
            return;
        }
    });
}