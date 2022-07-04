import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';
import './PositiveFloatNumInput.module.scss';

type PositiveFloatNumInputProps = {
  className?: string;
  inputAmount?: number;
  isDisabled?: boolean;
  placeholder?: string;
  styles?: Object;
  min?: number;
  max?: number;
  isConfine?: boolean;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEnter?: () => {};
  onAmountChange?: (a: number) => void;
};

const PositiveFloatNumInput: FC<PositiveFloatNumInputProps> = ({
  inputAmount,
  isDisabled = false,
  placeholder = '0',
  className = '',
  styles = {},
  min = 0,
  max = Infinity,
  isConfine = false,
  onInputChange = () => {},
  onEnter = () => {},
  onAmountChange = () => {}
}) => {
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (['-', 'e'].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === 'Enter') {
      onEnter();
    }
  };
  const [amount, setAmount] = useState<number | string | undefined>(inputAmount);

  useEffect(() => {
    setAmount(inputAmount);
  }, [inputAmount]);

  return (
    <input
      className={classNames('positiveFloatNumInput', 'px-1', className)}
      value={amount === 0 ? '' : amount}
      placeholder={placeholder}
      inputMode="decimal"
      type="number"
      min={min}
      max={max}
      pattern="^[0-9]*[.,]?[0-9]*$"
      disabled={isDisabled}
      style={styles}
      onKeyDown={onKeyDown}
      onChange={(event) => {
        if (event.target.value !== '') {
          const value = parseFloat(event.target.value);
          if (value < min) {
            if (isConfine) event.target.value = '0';
            else return;
          } else if (value > max) {
            if (isConfine) event.target.value = '' + max;
            else return;
          }
        }
        setAmount(event.target.value); // set as it is
        onInputChange(event);
        onAmountChange(parseFloat(event.target.value || '0'));
      }}
    />
  );
};

export default PositiveFloatNumInput;
