# Hippo web wallet in Chrome Extension

How to implement a react app into Chrome Extension?

## Steps

1. Using `yarn build` to build the app for production to the `build` folder.
    > If `craco: command not found`, run `yarn add @craco/craco` or `npm install @craco/craco --save` before `yarn build`
2. Open **Extension** from More Tools section or paste [chrome://extensions/](chrome://extensions/) in the Chrome browser.
3. Switch on **Developer Mode** that place on the top of right.
4. Select **Load Unpacked** to upload the **build** folder that created in the first step.
5. Congradulation!! You upload our Hippo web wallet successfully for development. 

## Learn More 

You can learn more in the [Chrome Developer for Extension](https://developer.chrome.com/docs/extensions/).

To learn Manifest V3 for Chrome Extension, check out the [Mainvfest V3 for Chrome Extension](https://developer.chrome.com/docs/extensions/mv3/intro/).
