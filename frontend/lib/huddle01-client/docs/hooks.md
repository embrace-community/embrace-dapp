---
sidebar_position: 3
---

# Hooks

These hooks are similar to any other react hook like `useEffect` or `useState`, You can read about these hooks in the [React Docs](https://reactjs.org/docs/hooks-intro.html)

## `useHuddleStore`

`useHuddleStore` is huddle01 react hook which is a wrapper of the huddle01 app state. It gives you access all the states within the app.

If you've used `useSelector` hook in redux it is very similar to it.
You can read more about it in the [Redux Docs](https://react-redux.js.org/api/hooks#useselector)

```jsx
// JavaScript | TypeScript
import { useHuddleStore } from 'huddle01-client/hooks';

// Example
const isCamPaused = useHuddleStore(state => state.isCamPaused);
```

## `useHuddleClientContext`

`useHuddleClientContext` is a [Custom Huddle01 Hook](https://github.com/Huddle-01/huddle01-monorepo/tree/main/packages/huddle01-client/docs/hooks.md) which when called inside your react component returns a huddleClient instance.

```jsx
// JavaScript | TypeScript
import { useHuddleClientContext } from 'huddle01-client/hooks';

const huddleClient = useHuddleClientContext();
```

---

💡 For any help reach out to us on
[Discord](https://discord.com/invite/EYqfS32jYc)
