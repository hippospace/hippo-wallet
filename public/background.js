const responseHandlers = new Map();
let unlockedMnemonic = null;
let currentWallet = '';

function launchPopup(message, sender, sendResponse) {
  const request = JSON.stringify({
    method: message.method,
    payload: message.data
  });
  const searchParams = new URLSearchParams();
  searchParams.set('request', request);
  searchParams.set('origin', sender.origin);

  chrome.windows.getLastFocused((focusedWindow) => {
    chrome.windows.create({
      url: 'index.html?' + searchParams.toString(),
      type: 'popup',
      width: 375,
      height: 600,
      top: focusedWindow.top,
      left: focusedWindow.left + (focusedWindow.width - 375),
      setSelfAsOpener: true,
      focused: true
    });
  });

  responseHandlers.set(message.id, sendResponse);
}

const handleConnect = (message, sender, sendResponse) => {
  chrome.storage.local.get('connectedAddress', (result) => {
    const connectedAddress = (result.connectedAddress || {})[sender.origin];
    if (!connectedAddress) {
      launchPopup(message, sender, sendResponse);
    } else {
      sendResponse({
        address: connectedAddress.address,
        publicKey: connectedAddress.publicKey,
        authKey: connectedAddress.authKey,
        id: message.id
      });
    }
  });
};

function handleDisconnect(message, sender, sendResponse) {
  chrome.storage.local.get('connectedAddress', (result) => {
    delete result.connectedAddress[sender.origin];
    chrome.storage.local.set({ connectedAddress: result.connectedAddress }, () =>
      sendResponse({ method: 'disconnected', id: message.id })
    );
  });
}

const getAccountAddress = (sender) => {
  chrome.storage.local.get('connectedAddress', (result) => {
    if (result && result.connectedAddress) {
      sendResponse({ address: (result.connectedAddress || {})[sender.origin] });
    } else {
      sendResponse({ error: 'No accounts signed in' });
    }
  });
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log('runtime on message>>', message);
  if (message.channel === 'hippo_extension_mnemonic_channel') {
    // Get mnemonic from extension storage for unlock account
    if (message.method === 'set') {
      unlockedMnemonic = message.data;
    } else if (message.method === 'get') {
      sendResponse(unlockedMnemonic);
    }
  } else if (message.channel === 'hippo_extension_current_wallet_channel') {
    // Get the selected wallet address from extension storage
    if (message.method === 'set') {
      currentWallet = message.data;
    } else if (message.method === 'get') {
      sendResponse(currentWallet);
    }
  } else if (message.channel === 'hippo_extension_background_channel') {
    // Handle Popup response and send back to wallet adapters
    const responseHandler = responseHandlers.get(message.data.id);
    responseHandlers.delete(message.data.id);
    responseHandler(message.data);
  } else if (message.channel === 'hippo_contentscript_background_channel') {
    if (message.method === 'connect') {
      handleConnect(message, sender, sendResponse);
    } else if (message.method === 'disconnect') {
      handleDisconnect(message, sender, sendResponse);
    } else if (message.method === 'getAccountAddress') {
      getAccountAddress(sender);
    } else if (message.method === 'is_connected') {
      sendResponse(true);
    } else if (message.method === 'signAndSubmit' || message.method === 'signTransaction') {
      launchPopup(message, sender, sendResponse);
    }
    // keeps response channel open
    return true;
  }
});
