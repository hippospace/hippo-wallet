/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MaybeHexString, RequestError, Types } from 'aptos';
import {
  ScriptFunctionPayload,
  TransactionPayload,
  UserTransactionRequest
} from 'aptos/dist/api/data-contracts';
import { Collapse } from 'components/Antd';
import Button from 'components/Button';
import LogoIcon from 'components/LogoIcon';
import { aptosClient } from 'config/aptosClient';
import useAptosWallet from 'hooks/useAptosWallet';
import useHippoClient from 'hooks/useHippoClient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { walletAddressEllipsis } from 'utils/utility';
import styles from './TransactionModal.module.scss';

interface RequestType {
  method: 'signTransaction' | 'signAndSubmit';
  payload: TransactionPayload;
}
interface TProps {
  opener: any;
  initialRequest?: RequestType;
}

const AUTHORIZED_METHODS = ['signTransaction', 'signAndSubmit'];

const getInitialRequest = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawRequest = urlParams.get('request');
  if (rawRequest) {
    const request = JSON.parse(rawRequest) as RequestType;
    if (!AUTHORIZED_METHODS.includes(request.method)) {
      postMessage({ error: 'Unsupported method', type: request.method });
    }
    return request.payload;
  }
  return undefined;
};

const PopupPage: React.FC<TProps> = ({ opener }) => {
  const { hippoWallet } = useHippoClient();
  const { activeWallet } = useAptosWallet();
  const origin = useMemo(() => {
    return window.location.origin;
  }, []);
  const [txRequest, setTxRequest] = useState<TransactionPayload | undefined>(() =>
    getInitialRequest()
  );
  const [txPayload, setTxPayload] = useState<UserTransactionRequest | undefined>();
  const [loading, setLoading] = useState(false);
  const postMessage = useCallback(
    (message: any) => {
      opener.postMessage({ jsonrpc: '2.0', ...message }, '*');
    },
    [opener]
  );

  const generateTxPayload = useCallback(async () => {
    if (txRequest) {
      const tx = await aptosClient.generateTransaction(activeWallet?.address || '', txRequest);
      setTxPayload(tx);
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
        setTxRequest(e.data.payload);
      }
    };
    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, [postMessage, origin]);

  const onCancel = () => {
    window.close();
    // unloadHandler();
  };

  const handleOnClick = async () => {
    setLoading(true);
    try {
      if (activeWallet?.aptosAccount && txPayload) {
        const signedTxn = await aptosClient.signTransaction(activeWallet?.aptosAccount, txPayload);
        const txnResult = await aptosClient.submitTransaction(signedTxn);
        await aptosClient.waitForTransaction(txnResult.hash);
        const txDetails = (await aptosClient.getTransaction(
          txnResult.hash
        )) as Types.UserTransaction;
        await hippoWallet?.refreshStores();
        postMessage({ method: 'success', detail: txDetails });
        // unloadHandler();
      } else {
        throw new Error('Please login first');
      }
    } catch (error) {
      let errorMsg = '';
      if (error instanceof RequestError) {
        errorMsg = error.response?.data.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      postMessage({ method: 'fail', error: errorMsg });
    } finally {
      window.close();
      setLoading(false);
    }
  };

  const renderTransactionDetail = useMemo(() => {
    if (!txPayload) return null;
    const {
      payload,
      sender,
      sequence_number,
      gas_unit_price,
      gas_currency_code,
      max_gas_amount,
      expiration_timestamp_secs
    } = txPayload;
    if (payload && (payload as ScriptFunctionPayload).function) {
      const [address, moduleName, functionName] = (
        payload as ScriptFunctionPayload
      ).function?.split('::');
      const transactionInfo: Record<string, string> = {
        'Sender:': walletAddressEllipsis(sender),
        'Sequence No.:': sequence_number,
        'Estimated Gas:': `${gas_unit_price} ${gas_currency_code}`,
        'Max Gas:': `${max_gas_amount} ${gas_currency_code}`,
        'Expire At:': new Date(parseInt(expiration_timestamp_secs) * 1000).toLocaleString()
      };
      return (
        <div className="bg-primary rounded-xl p-4 w-full">
          <div className="w-full flex justify-between">
            <div className="font-bold text-grey-900">Contract Address</div>
            <div className="font-bold text-grey-900">{walletAddressEllipsis(address)}</div>
          </div>
          <div className="w-full flex justify-between">
            <div className="font-bold text-grey-900">Contract Method</div>
            <div className="font-bold text-grey-900">
              {moduleName}::{functionName}
            </div>
          </div>
          <Collapse defaultActiveKey={['1']} ghost expandIconPosition="end">
            <Collapse.Panel
              className={styles.collapse}
              header={<div className="font-bold text-grey-900">Details</div>}
              key="1">
              {Object.keys(transactionInfo).map((key) => (
                <div key={key} className="w-full flex justify-between">
                  <p>{key}</p>
                  <p>{transactionInfo[key]}</p>
                </div>
              ))}
            </Collapse.Panel>
          </Collapse>
        </div>
      );
    }
  }, [txPayload]);

  return (
    <div className="p-8">
      <div className="flex flex-col items-center gap-10">
        {/* <h5 className="font-bold text-grey-900">
          {request?.payload.type} ({walletAddressEllipsis(privateKeyObject?.address || '')})
        </h5> */}
        <div className="w-full flex flex-col items-center">
          <LogoIcon className="mt-8 w-[120px] h-[120px]" />
          <h4 className="font-bold text-grey-900 my-8">Transaction Confirmation</h4>
          {renderTransactionDetail}
        </div>
        <div className="flex w-full justify-between gap-10">
          <Button variant="outlined" className="flex-grow font-bold" onClick={onCancel}>
            <h6 className="text-inherit">Cancel</h6>
          </Button>
          <Button
            type="submit"
            className="flex-grow font-bold"
            onClick={handleOnClick}
            isLoading={loading}>
            <h6 className="text-inherit">Confirm</h6>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PopupPage;
