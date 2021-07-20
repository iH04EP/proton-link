# Anchor Link [![Package Version](https://img.shields.io/npm/v/proton-link.svg?style=flat-square)](https://www.npmjs.com/package/proton-link) ![License](https://img.shields.io/npm/l/proton-link.svg?style=flat-square)

Persistent, fast and secure signature provider for EOSIO chains built on top of [EOSIO Signing Requests (EEP-7)](https://github.com/protonprotocol/proton-signing-request)

Key features:
  - Persistent account sessions
  - End-to-end encryption (E2EE)
  - Account-based identity proofs
  - Cross-device signing
  - Network resource management
  - Open standard

Resources:
  - [API Documentation](https://greymass.github.io/proton-link)
  - [Protocol Specification](./protocol.md)
  - [Developer Chat (Telegram)](https://t.me/anchor_link)

Guides:
  - [Integrating an app with Anchor using proton-link](https://forums.greymass.com/t/integrating-an-app-with-anchor-using-proton-link/165)

Examples:
  - [Simple Examples](./examples)
  - [VueJS Demo Application](https://github.com/protonprotocol/proton-link-demo)
  - [ReactJS Demo Application](https://github.com/protonprotocol/proton-link-demo-multipass)

## Installation

The `proton-link` package is distributed both as a module on [npm](https://www.npmjs.com/package/proton-link) and a standalone bundle on [unpkg](http://unpkg.com/proton-link).

### Browser using a bundler (recommended)

Install Anchor Link and a [transport](#transports):

```
yarn add proton-link proton-link-browser-transport
# or
npm install --save proton-link proton-link-browser-transport
```

Import them into your project:

```js
import ProtonLink from 'proton-link'
import ProtonBrowserTransport from 'proton-browser-transport'
```

### Browser using a pre-built bundle

Include the scripts in your `<head>` tag.

```html
<script src="https://unpkg.com/proton-link@3"></script>
<script src="https://unpkg.com/proton-link-browser-transport@3"></script>
```

`ProtonLink` and `ProtonBrowserTransport` are now available in the global scope of your document.

### Using node.js

Using node.js

```
yarn add proton-link proton-link-console-transport
# or
npm install --save proton-link proton-link-console-transport
```

Import them into your project:

```js
const ProtonLink = require('proton-link')
const ProtonConsoleTransport = require('proton-console-transport')
```

## Usage

First you need to instantiate your transport and the link.

```ts
const transport = new ProtonBrowserTransport()
const link = new ProtonLink({
    transport,
    chains: [
        {
            chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
            nodeUrl: 'https://eos.greymass.com',
        }
    ],
})
```

Now you have a link instance that can be used in the browser to login and/or transact. See [options](https://greymass.github.io/proton-link/interfaces/linkoptions.html) for a full list of available options. Also refer to the [proton-link-browser-transport](https://github.com/protonprotocol/proton-link-browser-transport/tree/master#basic-usage) README for a list of available options within the transport.

### Create a user session

To create a persistent session where you can push multiple transaction to a users wallet you need to call the [login](https://greymass.github.io/proton-link/classes/link.html#login) method on your link instance and pass your application name.

```ts
// Perform the login, which returns the users identity
const identity = await link.login('mydapp')

// Save the session within your application for future use
const {session} = identity
console.log(`Logged in as ${session.auth}`)
```

### Perform a transaction with a user session

Using the session you have persisted within your applications state from the user login, you can now send transactions through the session to the users wallet using the [transact](https://greymass.github.io/proton-link/classes/link.html#transact) method.

```ts
const action = {
    account: 'eosio',
    name: 'voteproducer',
    authorization: [session.auth],
    data: {
        voter: session.auth.actor,
        proxy: 'greymassvote',
        producers: [],
    },
}

session.transact({action}).then(({transaction}) => {
    console.log(`Transaction broadcast! Id: ${transaction.id}`)
})
```

### Restoring a session

If a user has previously logged in to your application, you can restore that previous session by calling the [restoreSession](https://greymass.github.io/proton-link/classes/link.html#restoresession) method on your link instance.

```ts
link.restoreSession('mydapp').then(({session}) => {
    console.log(`Session for ${session.auth} restored`)
    const action = {
        account: 'eosio',
        name: 'voteproducer',
        authorization: [session.auth],
        data: {
            voter: session.auth.actor,
            proxy: 'greymassvote',
            producers: [],
        },
    }
    session.transact({action}).then(({transaction}) => {
        console.log(`Transaction broadcast! Id: ${transaction.id}`)
    })
})
```

### Additional Methods

A full list of all methods can be found in the [Link class documentation](https://greymass.github.io/proton-link/classes/link.html).

- List all available sessions: [listSessions](https://greymass.github.io/proton-link/classes/link.html#listsessions)
- Removing a session: [removeSession](https://greymass.github.io/proton-link/classes/link.html#removesession)

### One-shot transact

To sign action(s) or a transaction using the link without logging in you can call the [transact](https://greymass.github.io/proton-link/classes/link.html#transact) method on your link instance.

```ts
const action = {
    account: 'eosio',
    name: 'voteproducer',
    authorization: [
        {
            actor: '............1', // ............1 will be resolved to the signing accounts name
            permission: '............2', // ............2 will be resolved to the signing accounts authority (e.g. 'active')
        },
    ],
    data: {
        voter: '............1', // same as above, resolved to the signers account name
        proxy: 'greymassvote',
        producers: [],
    },
}
link.transact({action}).then(({signer, transaction}) => {
    console.log(
        `Success! Transaction signed by ${signer} and bradcast with transaction id: ${transaction.id}`
    )
})
```

You can find more examples in the [examples directory](./examples) at the root of this repository and don't forget to look at the [API documentation](https://greymass.github.io/proton-link/classes/link.html).

## Transports

Transports in Anchor Link are responsible for getting signature requests to the users wallet when establishing a session or when using anchor link without logging in.

Available transports:

 Package | Description
---------| ---------------
 [proton-browser-transport](https://github.com/protonprotocol/proton-browser-transport) | Browser overlay that generates QR codes or triggers local URI handler if available
 [proton-console-transport](https://github.com/protonprotocol/proton-console-transport) | Transport that prints ASCII QR codes and esr:// links to the JavaScript console

See the [`LinkTransport` documentation](https://greymass.github.io/proton-link/interfaces/linktransport.html) for details on how to implement custom transports.

## Protocol

The Anchor Link protocol uses EEP-7 identity requests to establish a channel to compatible wallets using an untrusted HTTP POST to WebSocket forwarder (see [buoy node.js](https://github.com/greymass/buoy-nodejs)).

A session key and unique channel URL is generated by the client which is attached to the identity request and sent to the wallet (see [transports](#transports)). The wallet signs the identity proof and sends it back along with its own channel URL and session key. Subsequent signature requests can now be encrypted to a shared secret derived from the two keys and pushed directly to the wallet channel.

[📘 Protocol specification](./protocol.md)

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

Clone the repository and run `make` to checkout all dependencies and build the project. See the [Makefile](./Makefile) for other useful targets. Before submitting a pull request make sure to run `make lint`.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
