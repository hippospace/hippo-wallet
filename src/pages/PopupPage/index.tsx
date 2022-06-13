import { ScriptFunctionPayload } from 'aptos/dist/api/data-contracts';
import { Collapse } from 'components/Antd';
import Button from 'components/Button';
import LogoIcon from 'components/LogoIcon';
import useAptosWallet from 'hooks/useAptosWallet';
// import useHippoClient from 'hooks/useHippoClient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TTransaction } from 'types/hippo';
import { walletAddressEllipsis } from 'utils/utility';
import styles from './TransactionModal.module.scss';

interface TProps {
  opener: any;
}

const AUTHORIZED_METHODS = ['swap', 'deposit', 'withdraw'];

const PopupPage: React.FC<TProps> = ({ opener }) => {
  const origin = useMemo(() => {
    let params = new URLSearchParams(window.location.hash.slice(1));
    return params.get('origin');
  }, []);
  const [transaction, setTransaction] = useState<TTransaction>();
  const [loading, setLoading] = useState(false);
  const { activeWallet } = useAptosWallet();
  const hasConnectedAccount = !!activeWallet;
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();
  const postMessage = useCallback(
    (message: any) => {
      opener.postMessage({ jsonrpc: '2.0', ...message }, origin);
    },
    [opener, origin]
  );

  useEffect(() => {
    function messageHandler(e: MessageEvent<TTransaction>) {
      if (e.origin === origin && e.source === window.opener) {
        if (!AUTHORIZED_METHODS.includes(e.data.type)) {
          postMessage({ error: 'Unsupported method', type: e.data.type });
        }

        setTransaction(e.data);
      }
    }
    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, [origin, postMessage]);

  useEffect(() => {
    if (hasConnectedAccount) {
      const unloadHandler = () => {
        postMessage({ method: 'disconnected' });
      };
      window.addEventListener('beforeunload', unloadHandler);
      return () => {
        unloadHandler();
        window.removeEventListener('beforeunload', unloadHandler);
      };
    }
  }, [hasConnectedAccount, postMessage, origin]);

  const onCancel = () => {};

  const handleOnClick = async () => {
    setLoading(true);
    if (transaction?.callback && activeWallet?.aptosAccount)
      await transaction?.callback(activeWallet?.aptosAccount, transaction);
    setLoading(false);
  };

  const renderTransactionDetail = useMemo(() => {
    if (!transaction) return null;
    const { payload, transactionInfo } = transaction;
    if (payload && (payload as ScriptFunctionPayload).function) {
      const [address, moduleName, functionName] = (
        payload as ScriptFunctionPayload
      ).function?.split('::');
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
          <Collapse defaultActiveKey={['1']} ghost expandIconPosition="right">
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
  }, [transaction]);

  return (
    <div className="">
      <div className="flex flex-col items-center gap-10">
        <h5 className="font-bold text-grey-900">
          {transaction?.type} ({walletAddressEllipsis(privateKeyObject?.address || '')})
        </h5>
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
