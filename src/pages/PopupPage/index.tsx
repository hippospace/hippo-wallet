/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestError } from 'aptos';
import { TransactionPayload, UserTransactionRequest } from 'aptos/dist/api/data-contracts';
import { aptosClient } from 'config/aptosClient';
import useAptosWallet from 'hooks/useAptosWallet';
import useHippoClient from 'hooks/useHippoClient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isExtension } from 'utils/utility';
import ApproveSignatureForm from './components/ApproveSignatureForm';
import ConnectionForm from './components/ConnectionForm';

interface RequestType {
  method: 'signTransaction' | 'signAndSubmit' | 'connect' | 'disconnect';
  payload: TransactionPayload;
}
interface TProps {
  opener: any;
  initialRequest?: RequestType;
}

const AUTHORIZED_METHODS = ['signTransaction', 'signAndSubmit', 'connect', 'disconnect'];

const getInitialRequest = () => {
  // if (isExtension) {
  //   return undefined;
  // }
  const urlParams = new URLSearchParams(window.location.search);
  const rawRequest = urlParams.get('request');
  if (rawRequest) {
    const request = JSON.parse(rawRequest) as RequestType;
    if (!AUTHORIZED_METHODS.includes(request.method)) {
      postMessage({ error: 'Unsupported method', type: request.method });
    }
    return request;
  }
  return undefined;
};

const PopupPage: React.FC<TProps> = ({ opener }) => {
  const { hippoWallet } = useHippoClient();
  const { activeWallet } = useAptosWallet();
  const origin = useMemo(() => {
    let params = new URLSearchParams(window.location.search);
    return params.get('origin');
  }, []);
  const [txRequest, setTxRequest] = useState<RequestType | undefined>(() => getInitialRequest());
  const [txPayload, setTxPayload] = useState<UserTransactionRequest | undefined>();
  const [loading, setLoading] = useState(false);
  const postMessage = useCallback(
    (message: any) => {
      if (isExtension) {
        chrome.runtime.sendMessage({
          channel: 'hippo_extension_background_channel',
          data: message
        });
      } else {
        opener.postMessage({ jsonrpc: '2.0', ...message }, '*');
      }
    },
    [opener]
  );

  const generateTxPayload = useCallback(async () => {
    if (txRequest) {
      if (txRequest.method === 'signAndSubmit' || txRequest.method === 'signTransaction') {
        const tx = await aptosClient.generateTransaction(
          activeWallet?.address || '',
          txRequest.payload
        );
        setTxPayload(tx);
      }
    }
  }, [activeWallet?.address, txRequest]);

  useEffect(() => {
    generateTxPayload();
  }, [generateTxPayload]);

  const unloadHandler = useCallback(() => {
    postMessage({ method: 'disconnected' });
  }, [postMessage]);

  // // Send a disconnect event if this window is closed, this component is
  // // unmounted, or setConnectedAccount(null) is called.
  // useEffect(() => {
  //   if (activeWallet) {
  //     window.addEventListener('beforeunload', unloadHandler);
  //     return () => {
  //       unloadHandler();
  //       window.removeEventListener('beforeunload', unloadHandler);
  //     };
  //   }
  // }, [activeWallet, postMessage]);

  useEffect(() => {
    const messageHandler = async (e: MessageEvent<RequestType>) => {
      if (e.origin === origin && e.source === window.opener) {
        if (!AUTHORIZED_METHODS.includes(e.data.method)) {
          postMessage({ error: 'Unsupported method', type: e.data.method });
        }
        setTxRequest(e.data);
      }
    };
    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, [postMessage, origin]);

  const onCancel = () => {
    window.close();
    // unloadHandler();
  };

  const onApprove = async (txDetails: any) => {
    postMessage(txDetails);
    onCancel();
  };

  const onReject = (error: any) => {
    let errorMsg = '';
    if (error instanceof RequestError) {
      errorMsg = error.response?.data.message;
    } else if (error instanceof Error) {
      errorMsg = error.message;
    }
    postMessage({ method: 'fail', error: errorMsg, id: 1 });
    onCancel();
  };

  console.log('checkkkkk>>>', isExtension, txRequest?.method, origin);
  if (isExtension && txRequest?.method === 'connect' && origin) {
    return <ConnectionForm origin={origin} onApprove={onApprove} onReject={onReject} />;
  }

  return <ApproveSignatureForm txPayload={txPayload} onApprove={onApprove} onReject={onReject} />;
};

export default PopupPage;
