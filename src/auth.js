// Copyright 2012 Google LLC
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const url = require('url');
const { google } = require('googleapis');

// https://github.com/googleapis/google-api-nodejs-client/blob/master/samples/oauth2.js

require('dotenv').config();

const scopes = ['https://www.googleapis.com/auth/gmail.modify'];

const keys = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
};

const host = (process.env.NODE_ENV = 'development'
  ? 'http://localhost:8080'
  : '');

let oauth2Client;

function _setAuthClient() {
  if (oauth2Client) return;

  oauth2Client = new google.auth.OAuth2(
    keys.client_id,
    keys.client_secret,
    `${host}`
  );
  // google.options({ auth: oauth2Client });
}

async function setTokens(urlStr) {
  _setAuthClient();
  const qs = new url.URL(`/?${urlStr}`, 'http://localhost:8080').searchParams;
  const code = qs.get('code');
  const { tokens } = await oauth2Client.getToken(code);
  return oauth2Client.setCredentials(tokens); // eslint-disable-line require-atomic-updates
}

function authenticate() {
  _setAuthClient();
  const url = oauth2Client.generateAuthUrl({
    // access_type: 'offline',
    scope: scopes.join(' '),
  });

  return { url };
  // opn(authorizeUrl, { wait: false }).then((cp) => cp.unref());
}

async function messages() {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  try {
    let messages = await gmail.users.messages.list({
      userId: 'me',
    });
    return messages;
  } catch (err) {
    return err;
  }
}

async function listLabels() {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  try {
    let labels = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'],
      q: 'is:unread',
    });
    return labels;
  } catch (err) {
    return err;
  }
}

module.exports = { authenticate, setTokens, listLabels, messages };