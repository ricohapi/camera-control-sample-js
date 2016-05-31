'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
*/

const AuthClient = require('../src/ricohapi-cameractl').AuthClient;
const CameraCtl = require('../src/ricohapi-cameractl').CameraCtl;
const CONFIG = require('./config').CONFIG;
const USER = require('./config').USER;

const aclient = new AuthClient(CONFIG.clientId, CONFIG.clientSecret);
aclient.setResourceOwnerCreds(USER.userId, USER.userPass);
const ctl = new CameraCtl(aclient, CONFIG.params);

ctl.connect(USER.userId, 'dev02')
  .then(() => ctl.shoot('dev01'))
  .then(() => ctl.disconnect())
  .catch(e => console.log(e));
