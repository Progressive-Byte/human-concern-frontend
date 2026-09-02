"use client";

import { useMemo, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PROMISE_BY_KEY = new Map();

export function resolvePaymentSdkConfig(responsePayment = {}, publicSettings = {}) {
  const provider =
    responsePayment?.provider ??
    publicSettings?.provider ??
    null;

  const stripeDefaultPk =
    publicSettings?.stripePublishableKey ??
    publicSettings?.stripe_publishable_key ??
    publicSettings?.publishableKey ??
    publicSettings?.publishable_key ??
    null;

  const paypalDefaultClientId =
    publicSettings?.paypalClientId ??
    publicSettings?.paypal_client_id ??
    publicSettings?.clientId ??
    publicSettings?.client_id ??
    publicSettings?.paypalConfig?.clientId ??
    publicSettings?.paypalConfig?.client_id ??
    null;

  const isStripe = provider === "stripe" || (!provider && stripeDefaultPk);
  const isPayPal = provider === "paypal" || (!provider && paypalDefaultClientId);

  const hasSubmitResponse = Boolean(
    responsePayment &&
    (responsePayment.clientSecret || responsePayment.paymentIntentId ||
      responsePayment.setupIntentId || responsePayment.orderId ||
      responsePayment.providerTransactionId || responsePayment.gatewayConfigurationId)
  );
  const providerExplicitInResponse = Boolean(responsePayment && responsePayment.provider);

  let sdkKey = null;
  if (isStripe) {
    const responseKeys =
      responsePayment?.publishableKey ??
      responsePayment?.publishable_key ??
      responsePayment?.stripePublishableKey ??
      responsePayment?.stripe_publishable_key ??
      null;
    if (providerExplicitInResponse && hasSubmitResponse && responsePayment.provider === "stripe") {
      sdkKey = responseKeys;
    } else {
      sdkKey = responseKeys ?? stripeDefaultPk;
    }
  } else if (isPayPal) {
    const responseKeys =
      responsePayment?.clientId ??
      responsePayment?.client_id ??
      responsePayment?.paypalClientId ??
      responsePayment?.paypal_client_id ??
      null;
    if (providerExplicitInResponse && hasSubmitResponse && responsePayment.provider === "paypal") {
      sdkKey = responseKeys;
    } else {
      sdkKey = responseKeys ?? paypalDefaultClientId;
    }
  }

  const resolvedProvider = isStripe
    ? "stripe"
    : isPayPal
    ? "paypal"
    : provider;

  const isRecurring =
    responsePayment?.paymentMode === "split" ||
    responsePayment?.paymentMode === "recurring" ||
    responsePayment?.isRecurring ||
    publicSettings?.isRecurring ||
    false;

  const setupIntentId =
    responsePayment?.setupIntentId ??
    responsePayment?.setup_intent_id ??
    responsePayment?.setupIntent?.id ??
    responsePayment?.setup_intent?.id ??
    publicSettings?.setupIntentId ??
    publicSettings?.setup_intent_id ??
    null;

  const paymentIntentId =
    responsePayment?.paymentIntentId ??
    responsePayment?.payment_intent_id ??
    responsePayment?.paymentIntent?.id ??
    responsePayment?.payment_intent?.id ??
    responsePayment?.id ??
    publicSettings?.paymentIntentId ??
    publicSettings?.payment_intent_id ??
    null;

  const orderId =
    responsePayment?.orderId ??
    responsePayment?.order_id ??
    publicSettings?.paypalOrderId ??
    publicSettings?.paypal_order_id ??
    null;

  let clientSecret = null;
  if (isStripe) {
    const responseCs =
      responsePayment?.clientSecret ??
      responsePayment?.client_secret ??
      responsePayment?.stripeClientSecret ??
      responsePayment?.stripe_client_secret ??
      responsePayment?.setupIntent?.clientSecret ??
      responsePayment?.setupIntent?.client_secret ??
      responsePayment?.setup_intent?.client_secret ??
      responsePayment?.setup_intent?.clientSecret ??
      responsePayment?.paymentIntent?.clientSecret ??
      responsePayment?.paymentIntent?.client_secret ??
      responsePayment?.payment_intent?.client_secret ??
      responsePayment?.payment_intent?.clientSecret ??
      null;
    if (providerExplicitInResponse && hasSubmitResponse && responsePayment.provider === "stripe") {
      clientSecret = responseCs;
    } else {
      clientSecret =
        responseCs ??
        publicSettings?.stripeClientSecret ??
        publicSettings?.stripe_client_secret ??
        publicSettings?.clientSecret ??
        publicSettings?.client_secret ??
        null;
    }
  }

  let gatewayConfigurationId =
    responsePayment?.gatewayConfigurationId ??
    responsePayment?.gateway_configuration_id ??
    null;
  if (gatewayConfigurationId == null && publicSettings != null) {
    gatewayConfigurationId =
      publicSettings?.gatewayConfigurationId ??
      publicSettings?.gateway_configuration_id ??
      null;
  }

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

  const [prevSdkKey,         setPrevSdkKey]         = useState(null);
  const [stripePromiseCache, setStripePromiseCache] = useState(null);
  const [sdkReInitCounter,   setSdkReInitCounter]   = useState(0);

  const sdkKeyChanged = Boolean(
    prevSdkKey !== null && prevSdkKey !== config.sdkKey && config.sdkKey
  );

  // --- [sdk-fix-verify] TEMP observation logs. Remove after fix confirmed ---
  useEffect(() => {
    const mk = (k) => (typeof k === "string" && k.length > 8 ? k.slice(0, 8) + "..." : k ?? null);
    console.debug("[sdk-fix-verify] hook-snapshot", {
      responsePayment_provider: responsePayment?.provider ?? null,
      responsePayment_sdkKey: mk(responsePayment?.publishableKey ?? responsePayment?.clientId),
      publicSettings_provider: publicSettings?.provider ?? null,
      publicSettings_sdkKey: mk(publicSettings?.stripePublishableKey ?? publicSettings?.paypalClientId),
      resolved_sdkKey: mk(config.sdkKey),
      resolved_provider: config.provider,
      resolved_gatewayConfigurationId: config.gatewayConfigurationId,
      prevSdkKey: mk(prevSdkKey),
      sdkKeyChanged,
      stripePromiseCached: Boolean(stripePromiseCache),
      sdkReInitCounter,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sdkKey, config.provider, config.gatewayConfigurationId, prevSdkKey, sdkKeyChanged, stripePromiseCache, sdkReInitCounter, responsePayment?.provider, publicSettings?.provider]);

  useEffect(() => {
    if (!config.sdkKey) return;

    const isFirstInit = prevSdkKey === null;
    const keyChanged = !isFirstInit && prevSdkKey !== config.sdkKey;

    let scheduled = false;
    const applyState = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        // --- [sdk-fix-verify] TEMP observation log. Remove after fix confirmed ---
        const mk = (k) => (typeof k === "string" && k.length > 8 ? k.slice(0, 8) + "..." : k ?? null);
        console.debug("[sdk-fix-verify] hook-effect-fire", {
          isFirstInit,
          keyChanged,
          prevSdkKey: mk(prevSdkKey),
          newSdkKey: mk(config.sdkKey),
          provider: config.provider,
          gatewayConfigurationId: config.gatewayConfigurationId,
        });
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
            let cached = STRIPE_PROMISE_BY_KEY.get(config.sdkKey);
            if (!cached) {
              cached = loadStripe(config.sdkKey);
              STRIPE_PROMISE_BY_KEY.set(config.sdkKey, cached);
            }
            setStripePromiseCache(cached);
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
    let cached = STRIPE_PROMISE_BY_KEY.get(config.sdkKey);
    if (!cached) {
      cached = loadStripe(config.sdkKey);
      STRIPE_PROMISE_BY_KEY.set(config.sdkKey, cached);
    }
    return cached;
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
