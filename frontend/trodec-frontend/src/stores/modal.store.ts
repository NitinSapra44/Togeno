import { create } from "zustand";

interface ModalState {
  isLoginModalOpen: boolean;
  loginMessage: string;
  pendingAction: (() => void) | null;
  openLoginModal: (options?: { message?: string; onComplete?: () => void }) => void;
  closeLoginModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginModalOpen: false,
  loginMessage: "Login to continue your purchase",
  pendingAction: null,
  openLoginModal: (options) =>
    set({
      isLoginModalOpen: true,
      loginMessage: options?.message || "Login to continue your purchase",
      pendingAction: options?.onComplete || null,
    }),
  closeLoginModal: () => set({ isLoginModalOpen: false, pendingAction: null, loginMessage: "" }),
}));
