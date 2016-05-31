'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
 */

const AuthClient = require('./ricohapi-mqtt').AuthClient;
const MQTTClient = require('./ricohapi-mqtt').MQTTClient;
const EventEmitter = require('events').EventEmitter;
const msgpack = require('msgpack-lite');

class CameraCtl extends EventEmitter {

  /**
   * @param {AuthClient} client - AuthClient instance
   * @param {Object} [params] - extra parameters for MQTTClient
   */
  constructor(client, params) {
    if (client === undefined) throw new Error('parameter error');
    super();
    this._client = new MQTTClient(client, params);
  }

  /**
   * connect to server.
   *
   * @param {String} username - username
   * @param {String} deviceID - ID for this device
   * @returns {Promise} resolve when connected, reject otherwise
   */
  connect(username, deviceID) {
    if (deviceID === undefined) throw new Error('parameter error');
    if (!/^[%\.\w]+$/.test(deviceID)) throw new Error('parameter error');
    if (this._client === undefined) throw new Error('state error: no client');
    this._deviceID = deviceID;
    return this._client.connect(username);
  }

  /**
   * wait commands from sender-side.
   *
   * @returns {Promise} resolve when finished, reject on error
   */
  listen() {
    if (this._client === undefined) throw new Error('state error: need connect');

    this._client.on('msg', (topic, message) => {
      const devid = topic.slice(topic.indexOf('/')+1);
      const msg = msgpack.decode(message);
      this.emit(msg.c, devid, msg.p);
    });
    return this._client.subscribe(`camera/${this._deviceID}`);
  }

  /**
   * send shoot command to listener-side
   *
   * @param {String} deviceID - listener-side device id
   * @param {Object} [params] - shoot parameters
   * @returns {Promise} resolve when finished, reject on error
   */
  shoot(deviceID, params) {
    if (deviceID === undefined) throw new Error('parameter error');
    if (this._client === undefined) throw new Error('state error: need connect');

    const msg = { c: 'shoot' };
    msg.p = params || undefined;
    this._client.publish(`camera/${deviceID}`, msgpack.encode(msg));
  }

  /**
   * finish command waiting
   */
  unlisten() {
    this._client.unsubscribe();
  }

  /**
   * disconnect from server
   *
   * @returns {Promise} resolve when disconnected
   */
  disconnect() {
    this.unlisten();
    this._client.disconnect();
    this._client = undefined;
    return Promise.resolve();
  }
}

exports.CameraCtl = CameraCtl;
exports.AuthClient = AuthClient;
