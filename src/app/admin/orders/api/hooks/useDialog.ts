// hooks/useDialog.ts
'use client'
import { useState } from 'react';

export interface DialogState<T = any> {
  isOpen: boolean;
  data?: T | null;
}

export interface DialogActions<T = any> {
  open: (data?: T) => void;
  close: () => void;
  show: (data?: T) => void;  // alias for open
  toggle: () => void;
}

export type DialogController<T = any> = DialogState<T> & DialogActions<T>;

export function useDialog<T = any>(initialState: boolean = false): DialogController<T> {
  const [state, setState] = useState<DialogState<T>>({
    isOpen: initialState,
    data: null
  });

  const open = (data?: T) => {
    setState({
      isOpen: true,
      data: data ?? null
    });
  };

  const close = () => {
    setState({
      isOpen: false,
      data: null
    });
  };

  const toggle = () => {
    setState(prev => ({
      isOpen: !prev.isOpen,
      data: prev.isOpen ? null : prev.data
    }));
  };

  return {
    // 状态
    isOpen: state.isOpen,
    data: state.data,

    // 操作方法
    open,
    close,
    show: open,  // alias for open
    toggle
  };
}