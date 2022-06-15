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
      <div className="flex border-2 border-grey-900 rounded-xl flex-grow" key={word}>
        <div className="py-2 px-2 w-10 text-center">{index + 1}.</div>
        <div className="w-[2px] h-full bg-grey-900" />
        <div className="py-2 px-2 w-[119px] flex-grow">{word}</div>
      </div>
    ));
  }, [mnemonicAndSeed?.mnemonic]);
  return (
    <div>
      <h4 className="font-bold text-grey-900 mb-4">Back Up Your Secret Phrase</h4>
      <div className="text-grey-900">
        Save these 12 words to a password manager, or write it down and store in a secure place. Do
        not share with anyone.
      </div>
      <div className="flex flex-wrap gap-4 py-10 justify-center">{renderMnemonicList}</div>
      <div className="flex flex-col gap-4">
        <CopyToClipboard
          text={mnemonicAndSeed?.mnemonic || ''}
          onCopy={() => {
            handleOnClickCopy();
            setFieldValue('copied', true);
          }}>
          <Button className="font-bold">
            <div className="text-inherit">
              {copied ? 'Succesfully Copied' : 'Copy Backup Mnemonic File (Required)'}
            </div>
          </Button>
        </CopyToClipboard>
        <CheckboxInput
          checked={values.understood}
          onChange={(e) => setFieldValue('understood', e.target.checked)}>
          <div className="helpText text-grey-900">
            I understand that if I lose my secret phrase, I’ll lose all of the crypto in my wallet.
          </div>
        </CheckboxInput>
      </div>
      <Button
        className="w-[430px] mx-auto mt-10"
        disabled={!values.copied || !values.understood}
        onClick={goForward}>
        Continue
      </Button>
    </div>
  );
};

export default SeedWordsForm;
