---
sidebar_position: 2
---

# Client Methods

## `join()`

### Params

| Param      | Type                               | Required                            |
| ---------- | ---------------------------------- | ----------------------------------- |
| roomId     | string                             | <font color="red">`required`</font> |
| walletData | [`TWalletData`](types#twalletdata) | <font color="red">`required`</font> |

### Code Snippet

```jsx
huddleClient.join('rDVjHUcf4X', {
  address: '0x15900c698ee356E6976e5645394F027F0704c8Eb',
  ens: 'axit.eth',
});
```

## `enableWebcam()`

### Code Snippet

```jsx
huddleClient.enableWebcam();
```

## `disableWebcam()`

### Code Snippet

```jsx
huddleClient.disableWebcam();
```

## `changeWebcam()`

### Params

| Param       | Type            | Required |
| ----------- | --------------- | -------- |
| mediaDevice | MediaDeviceInfo | optional |

### Code Snippet

```jsx
huddleClient.changeWebcam(device);
```

## `enableMic()`

### Code Snippet

```jsx
huddleClient.enableMic();
```

## `changeMic()`

### Params

| Param       | Type            | Required |
| ----------- | --------------- | -------- |
| mediaDevice | MediaDeviceInfo | optional |

### Code Snippet

```jsx
huddleClient.changeMic(device);
```

## `changeAvatarUrl()`

### Params

| Param     | Type   | Required                            |
| --------- | ------ | ----------------------------------- |
| avatarUrl | string | <font color="red">`required`</font> |

### Code Snippet

```jsx
huddleClient.changeAvatarUrl(
  'https://openseauserdata.com/files/688ce238dd835db6fd8744b4a0f13eb8.svg'
);
```

## `sendDM()`

### Params

| Param   | Type   | Required                            |
| ------- | ------ | ----------------------------------- |
| message | string | <font color="red">`required`</font> |
| toId    | string | <font color="red">`required`</font> |
| fromId  | string | <font color="red">`required`</font> |

### Code Snippet

```jsx
huddleClient.sendDM('Hi! Welcome to Huddle01!', 'rDVjHUcf4X', 'zlQpt69c69');
```

## `toggleRaiseHand()`

### Params

| Param        | Type    | Required                            |
| ------------ | ------- | ----------------------------------- |
| isHandRaised | boolean | <font color="red">`required`</font> |

### Code Snippet

```jsx
huddleClient.changeAvatarUrl(
  'https://openseauserdata.com/files/688ce238dd835db6fd8744b4a0f13eb8.svg'
);
```

## `sendReaction()`

### Params

| Param    | Type                                                                                         | Required                            |
| -------- | -------------------------------------------------------------------------------------------- | ----------------------------------- |
| reaction | '', '😂', '😢', '😦', '😍', '🤔', '👀', '🙌', '👍', '👎', '🔥', '🍻', '🚀', '🎉', '❤️', '💯' | <font color="red">`required`</font> |

### Code Snippet

```jsx
huddleClient.sendReaction('🚀');
```

## `allowLobbyPeerToJoinRoom()`

### Params

| Param         | Type   | Required                            |
| ------------- | ------ | ----------------------------------- |
| peerIdToAdmit | string | <font color="red">`required`</font> |

### Code Snippet

```jsx
huddleClient.allowLobbyPeerToJoinRoom('rDVjHUcf4X');
```

## `allowAllLobbyPeersToJoinRoom()`

### Code Snippet

```jsx
huddleClient.allowAllLobbyPeersToJoinRoom();
```

## `disallowLobbyPeerFromJoiningRoom()`

### Params

| Param            | Type   | Required                            |
| ---------------- | ------ | ----------------------------------- |
| peerIdToDisallow | string | <font color="red">`required`</font> |

### Code Snippet

```jsx
huddleClient.disallowLobbyPeerFromJoiningRoom('rDVjHUcf4X');
```

## `disallowAllLobbyPeerFromJoiningRoom()`

### Code Snippet

```jsx
huddleClient.disallowAllLobbyPeerFromJoiningRoom();
```

---

💡 For any help reach out to us on
[Discord](https://discord.com/invite/EYqfS32jYc)
