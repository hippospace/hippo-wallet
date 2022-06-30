/* eslint-disable @typescript-eslint/naming-convention */
import { Types } from 'aptos';
import { ScriptFunctionPayload, UserTransactionRequest } from 'aptos/dist/api/data-contracts';
import { Collapse } from 'components/Antd';
import Button from 'components/Button';
import LogoIcon from 'components/LogoIcon';
import { aptosClient } from 'config/aptosClient';
import useAptosWallet from 'hooks/useAptosWallet';
import useHippoClient from 'hooks/useHippoClient';
import { useMemo, useState } from 'react';
import { walletAddressEllipsis } from 'utils/utility';
import styles from '../TransactionModal.module.scss';

interface TProps {
  txPayload: UserTransactionRequest | undefined;
  onApprove: (detail: any) => void;
  onReject: (error: any) => void;
}

const ApproveSignatureForm: React.FC<TProps> = ({ txPayload, onApprove, onReject }) => {
  const { activeWallet } = useAptosWallet();
  const { hippoWallet } = useHippoClient();
  const [loading, setLoading] = useState(false);

  const handleOnCancel = () => {
    onReject(new Error('Connection is rejected by user'));
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
        onApprove({ method: 'success', detail: txDetails, id: 1 });
        // unloadHandler();
      } else {
        throw new Error('Please login first');
      }
    } catch (error) {
      onReject(error);
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
          <Button variant="outlined" className="flex-grow font-bold" onClick={handleOnCancel}>
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

export default ApproveSignatureForm;
