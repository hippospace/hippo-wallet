/* eslint-disable @typescript-eslint/naming-convention */
import { getTypeTagFullname, parseTypeTagOrThrow, StructTag } from '@manahippo/aptos-tsgen';
import { aptos_framework } from '@manahippo/hippo-sdk';
import { Types } from 'aptos';
import {
  ScriptFunctionPayload,
  UserTransactionRequest,
  WriteResource
} from 'aptos/dist/api/data-contracts';
import { Collapse } from 'components/Antd';
import Button from 'components/Button';
import LogoIcon from 'components/LogoIcon';
import { aptosClient } from 'config/aptosClient';
import useAptosWallet from 'hooks/useAptosWallet';
import useHippoClient from 'hooks/useHippoClient';
import { useEffect } from 'react';
import { useMemo, useState } from 'react';
import { walletAddressEllipsis } from 'utils/utility';
import styles from '../TransactionModal.module.scss';

interface TProps {
  txPayload: UserTransactionRequest | undefined;
  onApprove: (detail: any) => void;
  onReject: (error: any) => void;
}

type CoinBalanceChange = {
  symbol: string;
  deltaUiAmt: string;
};

type SimulationResult = {
  success: boolean;
  gasUsed: number;
  balanceChanges: CoinBalanceChange[];
};

const ApproveSignatureForm: React.FC<TProps> = ({ txPayload, onApprove, onReject }) => {
  const { activeWallet } = useAptosWallet();
  const { hippoWallet } = useHippoClient();
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(() => null as null | SimulationResult);

  const handleOnCancel = () => {
    onReject(new Error('Connection is rejected by user'));
  };

  const expiration_secs = Math.ceil(
    txPayload ? parseInt(txPayload.expiration_timestamp_secs) - new Date().getTime() / 1000 : 10
  );

  const handleOnClick = async () => {
    setLoading(true);
    try {
      if (activeWallet?.aptosAccount && txPayload) {
        const signedTxn = await aptosClient.signTransaction(activeWallet?.aptosAccount, {
          ...txPayload,
          expiration_timestamp_secs: (
            Math.floor(new Date().getTime() / 1000) + expiration_secs
          ).toString()
        });
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

  useEffect(() => {
    const simulateBalanceChange = async () => {
      if (!(activeWallet?.aptosAccount && txPayload && hippoWallet && !loading)) {
        return null;
      }
      const output = await aptosClient.simulateTransaction(activeWallet.aptosAccount, {
        ...txPayload,
        expiration_timestamp_secs: (
          Math.floor(new Date().getTime() / 1000) + expiration_secs
        ).toString()
      });
      const balanceChanges: CoinBalanceChange[] = [];
      if (!output.success) {
        setSimulationResult({
          success: false,
          gasUsed: parseInt(output.gas_used),
          balanceChanges
        });
      } else {
        // walk through the changeset to figure out how wallet balance is affected:
        for (const change of output.changes) {
          if (
            change.type === 'write_resource' &&
            (change as WriteResource).data.type.startsWith('0x1::Coin::CoinStore')
          ) {
            // this is a change to coin-balance
            const resource = change as WriteResource;
            const tag = parseTypeTagOrThrow(resource.data.type);
            const coinTypeTag = (tag as unknown as StructTag).typeParams[0] as unknown as StructTag;
            const fullname = getTypeTagFullname(coinTypeTag);
            const repo = hippoWallet.repo;
            const coin = aptos_framework.coin$_.CoinStore.CoinStoreParser(
              resource.data.data,
              tag,
              repo
            );
            const newBalance = coin.coin.value.toJsNumber();
            let oldStore = hippoWallet.fullnameToCoinStore[fullname];
            let oldBalance = 0;
            if (oldStore) {
              oldBalance = oldStore.coin.value.toJsNumber();
            }
            const deltaBalance = newBalance - oldBalance;
            const tokenInfo = hippoWallet.fullnameToTokenInfo[fullname];
            let deltaUiAmt = deltaBalance;
            let coinSymbol = coinTypeTag.name;
            if (tokenInfo) {
              deltaUiAmt = deltaUiAmt / Math.pow(10, tokenInfo.decimals.toJsNumber());
              coinSymbol = tokenInfo.symbol.str();
            }
            balanceChanges.push({
              symbol: coinSymbol,
              deltaUiAmt: deltaUiAmt > 0 ? `+${deltaUiAmt}` : deltaUiAmt.toString()
            });
          }
        }
        setSimulationResult({
          success: true,
          gasUsed: parseInt(output.gas_used),
          balanceChanges
        });
      }
    };
    simulateBalanceChange();
  }, [txPayload, hippoWallet, activeWallet?.aptosAccount, expiration_secs]);

  const renderTransactionDetail = useMemo(() => {
    if (!txPayload) return null;
    const { payload } = txPayload;
    if (payload && (payload as ScriptFunctionPayload).function) {
      const [address, moduleName, functionName] = (
        payload as ScriptFunctionPayload
      ).function?.split('::');
      let transactionInfo: Record<string, string> = {
        'Result:': `${
          simulationResult === null ? '...' : simulationResult.success ? 'Success' : 'Failed.'
        }`,
        'Expiration: ': `${expiration_secs.toString()}s`
      };
      if (simulationResult) {
        for (const change of simulationResult.balanceChanges) {
          transactionInfo[change.symbol] = change.deltaUiAmt.toString();
        }
      }
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
  }, [txPayload, simulationResult]);

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
