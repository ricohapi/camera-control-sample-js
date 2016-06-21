'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
 */

const AuthClient = require('ricohapi-auth').AuthClient;
const mqtt = require('mqtt');
const url = require('url');
const EventEmitter = require('events').EventEmitter;

class MQTTClient extends EventEmitter {
  /**
   * @param {AuthClient} authClient - AuthClient instance
   * @param {Object} [params] - extra parameters injection if needed
   */
  constructor(authClient, params) {
    if (authClient === undefined) throw new Error('parameter error');
    super();
    this._authClient = authClient;

    if (!params) return;
    this._ca = params.ca || undefined;
    this._agent = params.agent || undefined;
  }

  /**
   * connect to broker.
   *
   * @param {String} username - username
   * @returns {Promise} resolve when connected, reject otherwise
   */
  connect(username) {
    if (this._authClient === undefined) throw new Error('state error: no client');
    this._userID = username;

    return new Promise((resolve, reject) => {
      this._authClient.session(AuthClient.SCOPES.CameraCtl)
        .then(result => {
          const ep = this._ca ? result.endpoints.mqtts : result.endpoints.wss;
          const parsedUrl = url.parse(ep);
          parsedUrl.auth = `${username}:${result.access_token}`;
          const udc2Url = url.format(parsedUrl);
          const opt = this._ca ? { ca: this._ca } : { port: 443 };
          opt.agent = this._agent || undefined;
          this._mqttClient = mqtt.connect(udc2Url, opt);
          this._mqttClient.on('close', reject);
          this._mqttClient.on('connect', resolve);
        })
        .catch(reject);
    });
  }

  /**
   * start subscribe
   *
   * @param {String} topic - topic
   * @returns {Promise} resolve when finished, reject on error
   */
  subscribe(topic) {
    if (this._mqttClient === undefined) throw new Error('state error: need connect');

    return new Promise(resolve => {
      this._subscribeResolve = resolve;
      this._mqttClient.on('message',
        (toTopic, message) => {
          const retTopic = toTopic.slice(toTopic.indexOf('/') + 1);
          return this.emit('msg', retTopic, message);
        });
      this._subtopic = `${this._userID}/${topic}`;
      this._mqttClient.subscribe(this._subtopic);
    });
  }

  /**
   * finish subscribe
   */
  unsubscribe() {
    if (!this._subscribeResolve) return;
    if (this._subtopic) {
      this._mqttClient.unsubscribe(this._subtopic, () => {
        this._subscribeResolve();
        this._subscribeResolve = undefined;
      });
      this._subtopic = undefined;
    } else {
      this._subscribeResolve();
      this._subscribeResolve = undefined;
    }
  }

  /**
   * publish data
   *
   * @param {String} topic - topic
   * @param {Buffer} data - data
   */
  publish(topic, data) {
    if (this._mqttClient === undefined) throw new Error('state error: need connect');
    this._mqttClient.publish(`${this._userID}/${topic}`, data);
  }

  /**
   * disconnect from broker.
   *
   * @returns {Promise} resolve when connected, reject otherwise
   */
  disconnect() {
    this.unsubscribe();
    this._mqttClient.end(true);
    this._mqttClient = undefined;
    return Promise.resolve();
  }

}

exports.MQTTClient = MQTTClient;
exports.AuthClient = AuthClient;
