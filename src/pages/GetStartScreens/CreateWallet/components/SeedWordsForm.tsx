import Button from 'components/Button';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { generateMnemonicAndSeed } from 'utils/wallet-seed';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import CheckboxInput from 'components/CheckboxInput';
import { useFormikContext } from 'formik';
import { FormValues } from '../types';

interface TProps {
  goForward: () => void;
}

const SeedWordsForm: React.FC<TProps> = ({ goForward }) => {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const [copied, setCopied] = useState(false);

  const createMnemoicAndSeed = useCallback(async () => {
    const mnemonicAndSeed = await generateMnemonicAndSeed();
    setFieldValue('mnemonicAndSeed', mnemonicAndSeed);
  }, []);

  useEffect(() => {
    createMnemoicAndSeed();
  }, []);

  const handleOnClickCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => {
      setCopied(() => false);
    }, 2000);
  }, []);

  const { mnemonicAndSeed } = values;

  const renderMnemonicList = useMemo(() => {
    const list = mnemonicAndSeed?.mnemonic.split(' ');
    return list?.map((word, index) => (
      <div
        key={word}
        className="flex-grow w-1/3 px-1 [&:nth-child(3n)]:pr-0 [&:nth-child(3n+1)]:pl-0">
        <div className="flex border-2 border-grey-100 bg-grey-100 rounded-xl" key={word}>
          <div className="py-2 pl-2 pr-1 text-[15px]">{index + 1}.</div>
          <div className="py-2 break-all">{word}</div>
        </div>
      </div>
    ));
  }, [mnemonicAndSeed?.mnemonic]);
  return (
    <div className="flex flex-col h-full">
      <h5 className="font-bold text-grey-100 mb-2">Back Up Your Secret Phrase</h5>
      <div className="text-grey-100">
        Save these 12 words to a password manager, or write it down and store in a secure place. Do
        not share with anyone.
      </div>
      <div className="flex flex-wrap gap-y-2 py-4 justify-center">{renderMnemonicList}</div>
      <div className="flex flex-col gap-2">
        <CopyToClipboard
          text={mnemonicAndSeed?.mnemonic || ''}
          onCopy={() => {
            handleOnClickCopy();
            setFieldValue('copied', true);
          }}>
          <Button className="font-bold py-2">
            <div className="text-sm">
              {copied ? 'Succesfully Copied' : 'Copy to clipboard (Required)'}
            </div>
          </Button>
        </CopyToClipboard>
        <CheckboxInput
          checked={values.understood}
          onChange={(e) => setFieldValue('understood', e.target.checked)}>
          <div className="helpText text-grey-100">
            I understand that if I lose my secret phrase, I’ll lose all of the crypto in my wallet.
          </div>
        </CheckboxInput>
      </div>
      <div className="py-4 mt-auto">
        <Button
          className="w-full"
          disabled={!values.copied || !values.understood}
          onClick={goForward}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SeedWordsForm;
