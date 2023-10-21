import { useEffect } from 'react';

const useClickOutside = (ref: React.RefObject<HTMLElement | undefined>, callback: (...args: unknown[]) => void) => {
  const handleClick = (e: React.SyntheticEvent<HTMLElement, 'click'>) => {
    // @ts-ignore
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };
  useEffect(() => {
    // @ts-ignore
    document.addEventListener('click', handleClick);
    return () => {
      // @ts-ignore
      document.removeEventListener('click', handleClick);
    };
  });
};

export default useClickOutside;
