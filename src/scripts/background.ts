import { DEVNET_NODE_URL } from 'config/aptosConstants';
import { MessageMethod } from 'types/aptos';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const account = getAptosAccountState();
  if (account === undefined) {
    sendResponse({ error: 'No Accounts' });
    return;
  }

  const client = new AptosClient(DEVNET_NODE_URL);
  switch (request.method) {
    case MessageMethod.CONNECT:
      connect(account, sendResponse);
      break;
    case MessageMethod.DISCONNECT:
      disconnect();
      break;
    case MessageMethod.IS_CONNECTED:
      isConnected(sendResponse);
      break;
    case MessageMethod.GET_ACCOUNT_ADDRESS:
      getAccountAddress(account, sendResponse);
      break;
    case MessageMethod.SIGN_AND_SUBMIT_TRANSACTION:
      signAndSubmitTransaction(client, account, request.args.transaction, sendResponse);
      break;
    case MessageMethod.SIGN_TRANSACTION:
      signTransactionAndSendResponse(client, account, request.args.transaction, sendResponse);
      break;
    default:
      throw new Error(request.method + ' method is not supported');
  }
  return true;
});
