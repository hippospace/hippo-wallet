import { HippoSwapClient, HippoWalletClient } from '@manahippo/hippo-sdk';
import { getProjectRepo } from '@manahippo/hippo-sdk/';
import { AptosAccountState } from 'types/aptos';
import { readConfig } from 'utils/hippoWalletUtil';
import { aptosClient } from './aptosClient';

export const hippoWalletClient = async (account: AptosAccountState) => {
  if (!account) return undefined;
  const { netConf } = readConfig();
  const repo = getProjectRepo();
  const walletClient = await HippoWalletClient.createInTwoCalls(
    netConf,
    aptosClient,
    repo,
    account.address()
  );

  return walletClient;
};

export const hippoSwapClient = async () => {
  const { netConf } = readConfig();
  const repo = getProjectRepo();
  const swapClient = await HippoSwapClient.createInOneCall(netConf, aptosClient, repo);

  return swapClient;
};
