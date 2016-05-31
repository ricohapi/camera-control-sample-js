# Ricoh Camera Control Sample for JavaScript

Send a shoot message from a remote machine (sender) to the host machine (listener) which is connected with a THETA S.

## Requirements

You need

* Ricoh API Client Credentials (client_id & client_secret)
* Ricoh ID (user_id & password)

If you don't have them, please register yourself and your client from [THETA Developers Website](http://contest.theta360.com/).

## Install

```sh
$ git clone https://github.com/ricohapi/camera-control-sample-js.git
$ npm install
```
## Setting

```sh
$ cp samples/config_template.js samples/config.js
```

and put your credentials into config.js.

## Listener Side

Connect the host and THETA S via Wi-Fi.
Connect the host to the Internet, too.

Execute the listener.js

```sh
$ node samples/listener.js
```

## Sender Side

Connect the host to the Internet.

Execute the sender.js, then the remote THETA S will take a shot.

```sh
$ node samples/sender.js
```

# Sample code

## Receive a camera control message

```JavaScript
const CameraCtl = require('ricohapi-cameractl').CameraCtl;
const AuthClient = require('ricohapi-cameractl').AuthClient;
const aclient = new AuthClient('<your_client_id>', '<your_client_secret>');
const aclient.setUserOwnerCreds('<your_user_id>', '<your_password>');

const ctl = new CameraCtl(aclient);
ctl.connect('<your_user_id>', '<your_password>', '<your_device_id>')
  .then(() => {
    // shoot message handler
    ctl.on('shoot', (devid, params) => {
        console.log('do shoot here');
        ctl.unlisten();
    });
    return ctl.listen();
  })
  .then(() => ctl.disconnect())
  .catch(e => console.log(e))
```

## Send a camera control message

```JavaScript
ctl.connect('<your_user_id>', '<your_password>', 'dev01')
  .then(() => ctl.shoot('dev02'))
  .then(() => ctl.disconnect())
  .catch(e => console.log(e));
```

## Using MQTT over TLS

The default communication protocol is MQTT over WSS.
To use MQTT over TLS, set the root certificate below, via `ca` option.

Root Certificate
https://support.comodo.com/index.php?/Knowledgebase/Article/GetAttachment/991/1070566

```JavaScript
const fs = require('fs');

const ctl = new CameraCtl(CLIENT_ID, CLIENT_SECRET, {
  ca: fs.readFileSync('ca-crt.pem')});
```

## CameraCtl class

### Constructor

```JavaScript
const ctl = new CameraCtl(authClient);
```

### Connect to the server

Device ID must be in a format `/[A-Za-z0-9_]{1,32}/`.

```JavaScript
ctl.connect('<your_user_id>', '<your_password>', '<your_device_id>')
```

A Promise is returned.

### Disconnect from the server

```JavaScript
ctl.disconnect();
```

A Promise is returned.

### Start listening to the message

Start listening to the messages to the device.
A Promise is returned.

```JavaScript
ctl.listen();
```

### Terminate listening to the message

```JavaScript
ctl.unlisten();
```

### Available control message types

Currently, only `shoot` message is available.
The receiver can get the device ID and parameters via the `on()` handler arguments.

#### Shoot message

Send a shoot message to the device specified the device ID.
You can specify `params` which will be packed by `msgpack-lite` in the SDK.
User parameters need to start with an underscore (`_`) to avoid future name conflicts.

```JavaScript
// send side
ctl.shoot('devid', {_test: 'test'});

// receive side
ctl.on('shoot', (devid, params) => {
});
```
