# Sample

Send a shoot message from a remote machine (sender) to the host machine (listener) which is connected with a THETA S.

## Setting

Rename `config_template.js` to `config.js` and set your credentials.

Install dependencies.

```sh
$ npm install axios
```

## Listener Side

Connect the host and THETA S via Wi-Fi.
Connect the host to the Internet, too.

Execute the listener.js

```sh
$ node listener.js
```

## Sender Side

Connect the host to the Internet.

Execute the sender.js, then the remote THETA S will take a shot.

```sh
$ node sender.js
```
