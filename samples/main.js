'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
 *
 * main.js for browser sample
 */

const AuthClient = require('../src/ricohapi-cameractl').AuthClient;
const CameraCtl = require('../src/ricohapi-cameractl').CameraCtl;

function log(str) {
  const p = document.createElement('p');
  const textnode = document.createTextNode(str);
  p.appendChild(textnode);
  document.body.appendChild(p);
}

document.addEventListener('DOMContentLoaded', () => {
  log('loaded');
  log('login started, please wait.');
  const client = new AuthClient(CONFIG.clientId, CONFIG.clientSecret);
  client.setResourceOwnerCreds(USER.userId, USER.userPass);
  const ctl = new CameraCtl(client);
  ctl.connect(USER.userId, 'dev01')
    .then(() => {
      ctl.on('shoot', (id, params) => {
        log('shooted');
        ctl.unlisten();
      });
      log('login completed');
      log('listen started');
      return ctl.listen();
    })
    .then(() => ctl.disconnect())
    .then(() => log('finished'))
    .catch(e => log(e))

  document.querySelector('#shoot').addEventListener('click', () => {
    log('shoot clicked')
    const ctl2 = new CameraCtl(client)
    ctl2.connect(USER.userId, 'dev02')
      .then(() => {
        log('shoot send start');
        return ctl2.shoot('dev01');
      })
      .then(() => ctl2.disconnect())
      .catch(e => log(e));
  });

});
