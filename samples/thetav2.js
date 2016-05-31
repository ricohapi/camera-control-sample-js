'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
 */

const axios = require('axios');

class THETAV2 {

  _makeExecute(c, p) {
    return {
      method: 'post',
      url: '/osc/commands/execute',
      data: { name: c, parameters: p },
    };
  }

  _promiseExecute(cmd, params) {
    const options = params;
    options.sessionId = this._sid;
    return new Promise(resolve => {
      this._r.request(this._makeExecute(cmd, options))
          .then(r => resolve(r.data));
            });
  }

  constructor() {
    this._sid = '';
    this._r = axios.create({baseURL:'http://192.168.1.1'});
  }

  connect() {
    return new Promise(resolve => {
      this._r.request(this._makeExecute('camera.startSession', {}))
        .then(res => {
          if ((res.data.results === undefined) || (res.data.results.sessionId === undefined)) {
            reject('request err');
          } else {
            this._sid = res.data.results.sessionId;
            resolve();
          }
        })
    });
  }

  disconnect() {
    return this._promiseExecute('camera.closeSession', {});
  }

  shoot() {
    return this._promiseExecute('camera.takePicture', {});
  }

  stopWlan() {
    return this._promiseExecute('camera._finishWlan', {});
  }

  startCapture() {
    return this._promiseExecute('camera._startCapture', {});
  }

  stopCapture() {
    return this._promiseExecute('camera._stopCapture', {});
  }

  getOptions(params) {
    if (params.optionNames === undefined) return Promise.reject('params err');
    return this._promiseExecute('camera.getOptions', {
      optionNames: params.optionNames,
    });
  }

  setOptions(params) {
    if (params.options === undefined) return Promise.reject('params err');
    return this._promiseExecute('camera.setOptions', {
      options: params.options,
    });
  }

  deleteImage(params) {
    if (params.fileUri === undefined) return Promise.reject('params err');
    return this._promiseExecute('camera.delete', {
      fileUri: params.fileUri,
    });
  }

  getPhotoInfo(params) {
    if (params.fileUri === undefined) return Promise.reject('params err');
    return this._promiseExecute('camera.getMetadata', {
      fileUri: params.fileUri,
    });
  }

  getPhotoList(params) {
    if (params.num === undefined) return Promise.reject('params err');
    let reqParams = {
      entryCount: params.num,
      includeThumb: false,
    };
    if (params.token !== undefined) {
      reqParams.continuationToken = params.token;
    }
    return this._promiseExecute('camera.listImages', reqParams);
  }

  getState() {
    return this._r.request({
      method: 'post',
      uri: '/osc/state',
      body: '',
    });
  }
}
module.exports = THETAV2;
