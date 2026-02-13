/**
 * Hook para gerenciar o estado centralizado do checkout
 */

'use client';

import { useState, useCallback } from 'react';
import {
  CheckoutState,
  Message,
  CustomerData,
  PaymentMethod,
  ProductInfo,
  ChatMode,
  CheckoutStep,
  MessageComponentType,
} from '@/types/checkout';
import { removeComponentFromMessages, updateMessageById } from './checkoutHelpers';

export interface CheckoutStateActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setProduct: (product: ProductInfo) => void;
  setMode: (mode: ChatMode) => void;
  setCheckoutStep: (step: CheckoutStep) => void;
  setSavedStep: (step: CheckoutStep | null) => void;
  setCustomerData: (data: CustomerData) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setCryptoAsset: (asset: 'USDC' | 'XLM' | null) => void; // Nova ação
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  removeComponentFromMessage: (type: MessageComponentType) => void;
  setAiTyping: (isTyping: boolean) => void;
  setShowMessageInput: (show: boolean) => void;
}

export function useCheckoutState() {
  const [state, setState] = useState<CheckoutState>({
    product: null,
    loading: true,
    error: null,
    cryptoAsset: null, // Novo campo
    mode: 'initial',
    checkoutStep: 'welcome',
    savedStep: null,
    showMessageInput: false,
    isAiTyping: false,
    customerData: null,
    paymentMethod: null,
    messages: [],
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setProduct = useCallback((product: ProductInfo) => {
    setState((prev) => ({ ...prev, product }));
  }, []);

  const setMode = useCallback((mode: ChatMode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const setCheckoutStep = useCallback((step: CheckoutStep) => {
    setState((prev) => ({ ...prev, checkoutStep: step }));
  }, []);

  const setSavedStep = useCallback((step: CheckoutStep | null) => {
    setState((prev) => ({ ...prev, savedStep: step }));
  }, []);

  const setCustomerData = useCallback((data: CustomerData) => {
    setState((prev) => ({ ...prev, customerData: data }));
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod | null) => {
    setState((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  const setMessages = useCallback((messages: Message[]) => {
    setState((prev) => ({ ...prev, messages }));
  }, []);

  const addMessage = useCallback((message: Message) => {
    setState((prev) => ({ ...prev, messages: [...prev.messages, message] }));
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setState((prev) => ({
      ...prev,
      messages: updateMessageById(prev.messages, id, updates),
    }));
  }, []);

  const removeComponentFromMessage = useCallback((type: MessageComponentType) => {
    setState((prev) => ({
      ...prev,
      messages: removeComponentFromMessages(prev.messages, type),
    }));
  }, []);

  const setAiTyping = useCallback((isTyping: boolean) => {
    setState((prev) => ({ ...prev, isAiTyping: isTyping }));
  }, []);

  const setShowMessageInput = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showMessageInput: show }));
  }, []);

  const setCryptoAsset = useCallback((asset: 'USDC' | 'XLM' | null) => {
    setState((prev) => ({ ...prev, cryptoAsset: asset }));
  }, []);

  return {
    state,
    actions: {
      setLoading,
      setError,
      setProduct,
      setMode,
      setCheckoutStep,
      setSavedStep,
      setCustomerData,
      setPaymentMethod,
      setCryptoAsset, // Nova ação
      setMessages,
      addMessage,
      updateMessage,
      removeComponentFromMessage,
      setAiTyping,
      setShowMessageInput,
    },
  };
}
