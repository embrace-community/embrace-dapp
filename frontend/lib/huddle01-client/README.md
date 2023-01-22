# Huddle01 Client SDK

![https://huddle01-assets-frontend.s3.amazonaws.com/general/huddle01-logo-blue.svg](https://huddle01-assets-frontend.s3.amazonaws.com/general/huddle01-logo-blue.svg)

<p align="center">
  <strong>Web3-Native Zoom for Builders/DAOs/NFT Communities</strong>
</p>

<h3 align="center">
  <a href="https://discord.gg/EYqfS32jYc">Community</a>
  <span> · </span>
  <a href="https://beneficial-jackrabbit-442.notion.site/Huddle01-Sync-Documentation-d7283ea395f24b788c54bffdfc3cd082">Documentation</a>
</h3>

> **_NOTE:_** Request for access to the huddle01-client pkg on Huddle01's discord or reach out to the team.

# Quick Start

Install the `huddle01-client` pkg from **_npm_** or **_yarn_**

## Installation

```bash
# npm
npm i @huddle01/huddle01-client

# yarn
yarn add @huddle01/huddle01-client
```

## Import

`import` `HuddleClientProvider` and `getHuddleClient` from the **_npm_** pkg

```jsx
// HuddleIframe to be imported
import {
  HuddleClientProvider,
  getHuddleClient,
} from '@huddle01/huddle01-client';
```

## Configure

Configure `huddleClient` by passing your API key

> **_NOTE:_** If API key is not passed your app will be rate limited and might not work.

```jsx
const huddleClient = getHuddleClient(apiKey);
```

## Wrap providers

Wrap your application with `HuddleClientProvider`

Wrapping you provider inside the `HuddleClientProvider` gives you access to the huddleClient instance to control your huddle01 powered app.

It is similar to the Context Provider given by React.
Read more in [React Docs](https://reactjs.org/docs/context.html#contextprovider)

```jsx
// JavaScript | TypeScript
const App = () => {
  return (
    <HuddleClientProvider value={huddleClient}>
      <YourApp />
    </HuddleClientProvider>
  );
};
```

## Usage

These hooks are similar to any other react hook like `useEffect` or `useState`, You can read about these hooks in the [React Docs](https://reactjs.org/docs/hooks-intro.html)

```jsx
// JavaScript | TypeScript
import { useHuddleClientContext } from '@huddle01/huddle01-client/hooks';

const huddleClient = useHuddleClientContext();

// Example
huddleClient.muteMic();
```

---

💡 For any help reach out to us on
[Discord](https://discord.com/invite/EYqfS32jYc)
