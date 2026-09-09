import { useCallback, useEffect, useRef, useState } from "react";

export function useAnimatedOpen(duration = 200) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const timer = useRef(null);

  const show = useCallback(() => {
    clearTimeout(timer.current);
    setClosing(false);
    setMounted(true);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen((isOpen) => {
      if (!isOpen) return false;
      setClosing(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, duration);
      return false;
    });
  }, [duration]);

  const toggle = useCallback(() => {
    setOpen((isOpen) => {
      if (isOpen) {
        setClosing(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          setMounted(false);
          setClosing(false);
        }, duration);
        return false;
      }
      clearTimeout(timer.current);
      setClosing(false);
      setMounted(true);
      return true;
    });
  }, [duration]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { open, mounted, closing, show, hide, toggle };
}
