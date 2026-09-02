"use client";

import { useMemo, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export function resolvePaymentSdkConfig(responsePayment = {}, publicSettings = {}) {
  const provider =
    responsePayment?.provider ??
    publicSettings?.provider ??
    null;

  const stripeDefaultPk =
    publicSettings?.stripePublishableKey ??
    publicSettings?.publishableKey ??
    null;

  const paypalDefaultClientId =
    publicSettings?.paypalClientId ??
    publicSettings?.clientId ??
    publicSettings?.paypalConfig?.clientId ??
    null;

  const isStripe = provider === "stripe" || (!provider && stripeDefaultPk);
  const isPayPal = provider === "paypal" || (!provider && paypalDefaultClientId);

  let sdkKey = null;
  if (isStripe) {
    sdkKey = responsePayment?.publishableKey ?? stripeDefaultPk;
  } else if (isPayPal) {
    sdkKey = responsePayment?.clientId ?? paypalDefaultClientId;
  }

  const resolvedProvider = isStripe
    ? "stripe"
    : isPayPal
    ? "paypal"
    : provider;

  const isRecurring =
    responsePayment?.paymentMode === "split" ||
    responsePayment?.isRecurring ||
    publicSettings?.isRecurring ||
    false;

  const setupIntentId =
    responsePayment?.setupIntentId ??
    responsePayment?.setupIntent?.id ??
    publicSettings?.setupIntentId ??
    null;

  const paymentIntentId =
    responsePayment?.paymentIntentId ??
    responsePayment?.id ??
    publicSettings?.paymentIntentId ??
    null;

  const orderId =
    responsePayment?.orderId ??
    publicSettings?.paypalOrderId ??
    null;

  let clientSecret = null;
  if (isStripe) {
    clientSecret =
      responsePayment?.clientSecret ??
      responsePayment?.setupIntent?.client_secret ??
      publicSettings?.stripeClientSecret ??
      null;
  }

  const gatewayConfigurationId =
    responsePayment?.gatewayConfigurationId ??
    publicSettings?.gatewayConfigurationId ??
    null;

  return {
    provider: resolvedProvider,
    sdkKey,
    clientSecret,
    orderId,
    setupIntentId,
    paymentIntentId,
    gatewayConfigurationId,
    isRecurring,
    isStripe,
    isPayPal,
  };
}

export function usePaymentProviderInstance(responsePayment, publicSettings) {
  const config = useMemo(
    () => resolvePaymentSdkConfig(responsePayment, publicSettings),
    [responsePayment, publicSettings]
  );

  const [prevSdkKey, setPrevSdkKey] = useState(null);
  const [stripePromiseCache, setStripePromiseCache] = useState(null);
  const [sdkReInitCounter, setSdkReInitCounter] = useState(0);

  const sdkKeyChanged = Boolean(
    prevSdkKey !== null && prevSdkKey !== config.sdkKey && config.sdkKey
  );

  useEffect(() => {
    if (!config.sdkKey) return;

    const isFirstInit = prevSdkKey === null;
    const keyChanged = !isFirstInit && prevSdkKey !== config.sdkKey;

    let scheduled = false;
    const applyState = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        if (keyChanged) {
          setSdkReInitCounter((n) => n + 1);
          setStripePromiseCache(null);
          if (config.isPayPal) {
            const existing = document.querySelector(
              'script[data-paypal-sdk="true"]'
            );
            if (existing) existing.remove();
            if (typeof window !== "undefined") delete window.paypal;
          }
        }
        if (isFirstInit || keyChanged) {
          setPrevSdkKey(config.sdkKey);
          if (config.isStripe) {
            const promise = loadStripe(config.sdkKey);
            setStripePromiseCache(promise);
          }
        }
      });
    };
    applyState();
  }, [
    config.sdkKey,
    config.provider,
    config.isStripe,
    config.isPayPal,
    config.gatewayConfigurationId,
    prevSdkKey,
  ]);

  const stripePromise = useMemo(() => {
    if (!config.isStripe || !config.sdkKey) return null;
    if (stripePromiseCache && prevSdkKey === config.sdkKey) {
      return stripePromiseCache;
    }
    return loadStripe(config.sdkKey);
  }, [config.isStripe, config.sdkKey, stripePromiseCache, prevSdkKey]);

  const elementsKey = useMemo(() => {
    const parts = [
      config.provider || "",
      config.sdkKey || "",
      config.gatewayConfigurationId || "",
      config.clientSecret ? String(config.clientSecret).slice(0, 16) : "",
      String(sdkReInitCounter),
    ];
    return parts.join("__");
  }, [
    config.provider,
    config.sdkKey,
    config.gatewayConfigurationId,
    config.clientSecret,
    sdkReInitCounter,
  ]);

  return {
    config,
    stripePromise,
    elementsKey,
    sdkReInitCounter,
    sdkKeyChanged,
    isStripe: config.isStripe,
    isPayPal: config.isPayPal,
  };
}

export default usePaymentProviderInstance;
