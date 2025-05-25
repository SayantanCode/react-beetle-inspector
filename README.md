# 🐞 React Beetle Inspector

A powerful debugging tool to help React developers quickly detect:
- 🔁 Unnecessary re-renders
- 🌐 Extra or duplicate API calls
- 🧠 Which props caused a component to re-render
- 🧩 Easy overlay for live debug info

## 📦 Installation

```bash
npm install react-beetle-inspector
```

## ⚙️ Setup
### 1. Patch fetch or axios globally (once in your root file)
```jsx
// main.jsx or App.jsx or index.js
import { patchGlobalFetch, patchAxiosInstance } from "react-beetle-inspector";

patchGlobalFetch(); // log all API calls from fetch
patchAxiosInstance(); // log all API calls from axios
```
### 2. Use useWhyRender to track unnecessary renders
```jsx
import { useWhyRender } from "react-beetle-inspector";

const MyComponent = (props) => {
  useWhyRender("MyComponent", props);

  return <div>{props.name}</div>;
};
```
- Logs which props changed between renders
- Tracks the render count for each component

### 3. Add the Developer Overlay UI
```jsx
import { DebugOverlay } from "react-beetle-inspector";

const App = () => {
  return (
    <>
      <YourApp />
      <DebugOverlay />
    </>
  );
};
```
🧩 This adds a draggable floating widget showing:

- 🔝 Most re-rendered components

- 📡 Most recent API calls

- 🕒 Method, URL, and performance timing

## 🔬 Additional APIs

`getRenderStats()`

Returns render counts of all tracked components.
```jsx
import { getRenderStats } from "react-beetle-inspector";

console.log(getRenderStats()); // [ ['ComponentA', 10], ['ComponentB', 8], ... ]
```
`subscribeToApiLogs(callback)`

Subscribe to the internal log of all API calls.
```jsx
import { subscribeToApiLogs } from "react-beetle-inspector";

const unsub = subscribeToApiLogs((logs) => {
  console.log("API logs:", logs);
});
```
> Unsubscribe using the returned function when no longer needed.


## ⚠️ Dev-Only Usage Recommended
Both `useWhyRender` and the `DebugOverlay` are intended for development only. Use them conditionally:
```jsx
if (import.meta.env.MODE === "development") {
  useWhyRender(...);
}
```

## 🎉 Features

- 🌐 Live API logging (supports fetch & axios)
- 🔁 Re-render tracking
- 🧠 Prop diffing
- 🧩 Easy Draggable Debug Overlay

## 📝 Changelog

- v1.0.0: Initial release

## 📌 Roadmap
 - ✔️ Track re-renders and prop diffs

 - ✔️ Log and visualize API calls

 - ✔️ Both fetch and axios support

 - ✔️ Developer overlay widget

 - 🗓️ Planned: Component tree visualization

 - 🗓️ Planned: React DevTools integration

 - 🗓️ Planned: Component heatmap

## 🧩 Built With
- ✅ React Hooks

- <code>performance.now()</code> for timing

- 🔍 Global fetch monkey-patching

- 🎯 Zero external dependencies

## 📝 License

MIT License

Copyright (c) 2025 [Sayantan Chakraborty](https://github.com/SayantanCode)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

> 🌟 Feel free to fork, contribute, and enhance this tool.

## 🙏 Thank You
Created with ❤️ to help developers debug React apps faster.