import ErrorBoundary from 'components/ErrorBoundary';
import { AptosWalletProvider } from 'contexts/AptosWalletProvider';
import { HippoClientProvider } from 'contexts/HippoClientProvider';
import { PageProvider } from 'contexts/PageProvider';

type TProps = {
  children: any;
};

const Providers: React.FC<TProps> = (props: TProps) => {
  return (
    <ErrorBoundary>
      <AptosWalletProvider>
        <HippoClientProvider>
          <PageProvider>{props.children}</PageProvider>
        </HippoClientProvider>
      </AptosWalletProvider>
    </ErrorBoundary>
  );
};

export default Providers;
