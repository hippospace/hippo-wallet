function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('inpage.js');
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    console.error('Hippo wallet injection failed.', error);
  }
}

injectScript();

// inpage -> contentscript
window.addEventListener('hippo_injected_script_message', function (event) {
  console.log('content script window listen message', event);
  if (event.detail.method) {
    // contentscript -> background
    chrome.runtime.sendMessage(
      {
        channel: 'hippo_contentscript_background_channel',
        ...event.detail
      },
      function (response) {
        // Can return null response if window is killed
        if (!response) {
          return;
        }
        window.dispatchEvent(
          new CustomEvent('hippo_contentscript_message', {
            detail: {
              responseMethod: event.detail.method,
              id: event.detail.id,
              response
            }
          })
        );
      }
    );
  }
});
