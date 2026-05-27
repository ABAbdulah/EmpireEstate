import React from 'react';
import { create } from 'zustand';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmModal } from './ConfirmModal';

type Variant = 'default' | 'success' | 'danger' | 'warning';

interface ModalConfig {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: Variant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalStore {
  config: ModalConfig | null;
  show: (cfg: ModalConfig) => void;
  hide: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  config: null,
  show: (cfg) => set({ config: cfg }),
  hide: () => set({ config: null }),
}));

/**
 * Show a global app-wide modal from anywhere.
 *
 * Examples:
 *   showAlert({ title: "Insufficient funds", message: "You need $1k.", icon: "cash-outline", variant: "danger" });
 *   showAlert({ title: "Reset?", message: "Wipes all progress.", variant: "danger", confirmLabel: "Yes, reset", cancelLabel: "Cancel", onConfirm: () => doReset() });
 */
export function showAlert(cfg: ModalConfig) {
  useModalStore.getState().show(cfg);
}

export function hideAlert() {
  useModalStore.getState().hide();
}

/** Mount once at the root of the app (e.g. in _layout.tsx) */
export function GlobalModal() {
  const config = useModalStore((s) => s.config);
  const hide = useModalStore((s) => s.hide);
  return (
    <ConfirmModal
      visible={!!config}
      title={config?.title ?? ''}
      message={config?.message}
      icon={config?.icon}
      variant={config?.variant ?? 'default'}
      confirmLabel={config?.confirmLabel ?? 'OK'}
      cancelLabel={config?.cancelLabel}
      onCancel={() => {
        config?.onCancel?.();
        hide();
      }}
      onConfirm={() => {
        config?.onConfirm?.();
        hide();
      }}
    />
  );
}
