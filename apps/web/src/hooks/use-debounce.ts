import { useEffect, useRef, useMemo } from 'react';

export const useDebounce = <T extends (...args: any[]) => void>(callback: T, delay: number) => {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useMemo(() => {
        let timeoutId: NodeJS.Timeout;

        const debounced = (...args: Parameters<T>) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        };

        return debounced;
    }, [delay]);
};
