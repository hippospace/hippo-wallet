import { createContext, FC, ReactNode, useState } from 'react';

type PageContextType = [page: string, setPage: React.Dispatch<React.SetStateAction<string>>];

export const PageContext = createContext<PageContextType>(['wallet', () => {}]);

interface TProviderProps {
  children: ReactNode;
}

export const PageProvider: FC<TProviderProps> = ({ children }) => {
  const [page, setPage] = useState('wallet');

  return <PageContext.Provider value={[page, setPage]}>{children}</PageContext.Provider>;
};
