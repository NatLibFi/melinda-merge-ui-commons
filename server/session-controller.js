/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Common modules for Melinda UI applications
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-ui-commons
*
* melinda-ui-commons program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-ui-commons is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/
import express from 'express';
import cors from 'cors';
import { authProvider } from './melinda-auth-provider';
import { createSessionToken, readSessionToken } from './session-crypt';
import bodyParser from 'body-parser';
import { logger } from './logger';
import _ from 'lodash';
import { corsOptions, requireBodyParams } from './utils';
import HttpStatus from 'http-status-codes';

export const sessionController = express();

sessionController.use(bodyParser.json());

sessionController.options('/start', cors(corsOptions)); // enable pre-flight
sessionController.options('/validate', cors(corsOptions)); // enable pre-flight

sessionController.post('/start', cors(corsOptions), requireBodyParams('username', 'password'), (req, res) => {
  const {username, password} = req.body;

  logger.log('info', `Checking credentials for user ${username}`);

  authProvider.validateCredentials(username, password).then(authResponse => {
    if (authResponse.credentialsValid) {
      const sessionToken = createSessionToken(username, password);
      res.send({...authResponse, sessionToken});
      logger.log('info', `Succesful signin from ${username}`);
    } else {
      logger.log('info', `Credentials not valid for user ${username}`);
      res.status(401).send('Authentication failed');
    }

  }).catch(error => {

    logger.log('error', 'Error validating credentials', Object.assign(error, {
      message: error.message.replace(/staff_user=.+$/, '')
    }));

    res.status(500).send('Internal server error');

  });
});

sessionController.post('/validate', cors(corsOptions), requireBodyParams('sessionToken'), (req, res) => {
  const {sessionToken} = req.body;
  try {
    const {username, password} = readSessionToken(sessionToken);

    authProvider.validateCredentials(username, password).then(authResponse => {
      if (authResponse.credentialsValid) {
        logger.log('info', `Succesful session validation for ${username}`);
        res.send(authResponse);
      } else {
        logger.log('info', `Credentials not valid for user ${username}`);
        res.status(401).send('Authentication failed');
      }

    }).catch(error => {

      logger.log('error', 'Error validating credentials', error);

      res.status(500).send('Internal server error');

    });

  } catch (error) {
    logger.log('error', 'Error validating credentials', error);
    res.status(401).send('Authentication failed');
  }

});

export function readSessionMiddleware(req, res, next) {

  try {
    const {username, password} = readSessionToken(req.cookies.sessionToken);

    req.session = _.assign({}, req.session, { username, password });

  } catch(e) {
    // invalid token
    logger.log('debug', 'Invalid session from token', req.cookies.sessionToken, e.message);
    req.session = {};
  }

  next();
}

export function requireSession(req, res, next) {

  const username = _.get(req, 'session.username');
  const password = _.get(req, 'session.password');

  if (username && password) {
    return next();
  } else {
    res.sendStatus(HttpStatus.UNAUTHORIZED);
  }

}
