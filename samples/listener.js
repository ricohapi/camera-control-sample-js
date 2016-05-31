'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
*/

const AuthClient = require('../src/ricohapi-cameractl').AuthClient;
const CameraCtl = require('../src/ricohapi-cameractl').CameraCtl;
const CONFIG = require('./config').CONFIG;
const USER = require('./config').USER;
const THETAV2 = require('./thetav2');

const aclient = new AuthClient(CONFIG.clientId, CONFIG.clientSecret);
const ctl = new CameraCtl(aclient, CONFIG.params);
aclient.setResourceOwnerCreds(USER.userId, USER.userPass);
const camera = new THETAV2();

ctl.connect(USER.userId, 'dev01')
  .then(() => {
    console.log('connected');
    ctl.on('shoot', (topic, msg) => {
      console.log('shooted to:', topic);
      camera.connect()
        .then(() => camera.shoot({}))
        .then(() => camera.disconnect())
        .catch(e => console.log(e));
      ctl.unlisten();
    });
    return ctl.listen();
  })
  .then(() => ctl.disconnect())
  .then(() => console.log('finished'))
  .catch(e => console.log(e))

