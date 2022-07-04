import cx from 'classnames';
import React from 'react';

interface TProps {
  logoSrc: string;
  className?: string;
  onClick?: () => void;
}

const CoinIcon: React.FC<TProps> = ({ logoSrc, className, onClick = () => {} }) => {
  const onImgError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = '';
    event.currentTarget.className = 'bg-black';
  };
  return (
    <div className={cx(className, 'w-6 h-6')} onClick={onClick}>
      <img src={logoSrc} className="w-full h-full rounded-full" alt="" onError={onImgError} />
    </div>
  );
};

export default CoinIcon;
