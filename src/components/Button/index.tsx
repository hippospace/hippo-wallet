import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import cx from 'classnames';
import { useCallback } from 'react';
import { useState } from 'react';
import styles from './Button.module.scss';

type TProps = {
  className?: string;
  id?: string;
  children?: any;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'solid' | 'outlined' | 'list' | 'icon' | 'selected' | 'notSelected';
  type?: 'button' | 'submit' | 'reset' | undefined;
  onClick?: (e: React.MouseEvent<HTMLElement>) => {} | void | Promise<void>;
};

const Button: React.FC<TProps> = (props) => {
  const {
    onClick = () => {},
    isLoading,
    className,
    disabled,
    children,
    variant = 'solid',
    ...rest
  } = props;

  const [loadingState, setLoadingState] = useState(false);

  const onClickCallback = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      setLoadingState(true);
      await onClick(e);
      setLoadingState(false);
    },
    [onClick]
  );

  const loading = isLoading || loadingState;

  return (
    <button
      className={cx(styles.button, className, {
        [styles.disabled]: disabled,
        [styles.loading]: loading,
        [styles.solid]: variant === 'solid',
        [styles.outlined]: variant === 'outlined',
        [styles.list]: variant === 'list',
        [styles.icon]: variant === 'icon',
        [styles.selected]: variant === 'selected',
        [styles.notSelected]: variant === 'notSelected'
      })}
      onClick={onClickCallback}
      disabled={disabled}
      {...rest}>
      {children}
      {loading && (
        <LoadingOutlined style={{ color: 'currentColor', fontSize: 16 }} className="ml-2" />
      )}
    </button>
  );
};

export default Button;
