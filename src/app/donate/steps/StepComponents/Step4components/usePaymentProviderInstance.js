"use client";

import { useMemo, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PROMISE_BY_KEY = new Map();

export function resolvePaymentSdkConfig(responsePayment = {}, publicSettings = {}, nestedPaymentSource = null) {
  const _src = (nestedPaymentSource && typeof nestedPaymentSource === 'object') ? nestedPaymentSource : null;
  const _n = (keys) => {
    if (!_src) return null;
    for (const k of keys) {
      if (_src[k] !== undefined && _src[k] !== null) return _src[k];
    }
    return null;
  };
  const provider =
    _n(['provider']) ??
    responsePayment?.provider ??
    publicSettings?.provider ??
    null;

  const stripeDefaultPk =
    _n(['stripePublishableKey','stripe_publishable_key','publishableKey','publishable_key']) ??
    publicSettings?.stripePublishableKey ??
    publicSettings?.stripe_publishable_key ??
    publicSettings?.publishableKey ??
    publicSettings?.publishable_key ??
    null;

  const paypalDefaultClientId =
    _n(['paypalClientId','paypal_client_id','clientId','client_id']) ??
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
      _n(['publishableKey','publishable_key','stripePublishableKey','stripe_publishable_key']) ??
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
      _n(['clientId','client_id','paypalClientId','paypal_client_id']) ??
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

  const isRecurring = Boolean(
    (typeof _n(['paymentMode']) === 'string' && (_n(['paymentMode']) === 'split' || _n(['paymentMode']) === 'recurring')) ||
    _n(['isRecurring']) ||
    responsePayment?.paymentMode === "split" ||
    responsePayment?.paymentMode === "recurring" ||
    responsePayment?.isRecurring ||
    publicSettings?.isRecurring
  );

  const setupIntentId =
    _n(['setupIntentId','setup_intent_id']) ??
    responsePayment?.setupIntentId ??
    responsePayment?.setup_intent_id ??
    responsePayment?.setupIntent?.id ??
    responsePayment?.setup_intent?.id ??
    publicSettings?.setupIntentId ??
    publicSettings?.setup_intent_id ??
    null;

  const paymentIntentId =
    _n(['paymentIntentId','payment_intent_id']) ??
    responsePayment?.paymentIntentId ??
    responsePayment?.payment_intent_id ??
    responsePayment?.paymentIntent?.id ??
    responsePayment?.payment_intent?.id ??
    responsePayment?.id ??
    publicSettings?.paymentIntentId ??
    publicSettings?.payment_intent_id ??
    null;

  const orderId =
    _n(['orderId','order_id']) ??
    responsePayment?.orderId ??
    responsePayment?.order_id ??
    publicSettings?.paypalOrderId ??
    publicSettings?.paypal_order_id ??
    null;

  let clientSecret = null;
  if (isStripe) {
    const responseCs =
      _n(['clientSecret','client_secret','stripeClientSecret','stripe_client_secret']) ??
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
    _n(['gatewayConfigurationId','gateway_configuration_id']) ??
    responsePayment?.gatewayConfigurationId ??
    responsePayment?.gateway_configuration_id ??
    null;
  if (gatewayConfigurationId == null && publicSettings != null) {
    gatewayConfigurationId =
      publicSettings?.gatewayConfigurationId ??
      publicSettings?.gateway_configuration_id ??
      null;
  }

  const approvalUrl =
    _n(['approvalUrl','approval_url']) ??
    responsePayment?.approvalUrl ??
    responsePayment?.approval_url ??
    null;

  const redirectUrl =
    _n(['redirectUrl','redirect_url']) ??
    responsePayment?.redirectUrl ??
    responsePayment?.redirect_url ??
    publicSettings?.redirectUrl ??
    approvalUrl ??
    null;

  const billingAgreementToken =
    _n(['billingAgreementToken','billing_agreement_token','baToken','ba_token']) ??
    responsePayment?.billingAgreementToken ??
    responsePayment?.billing_agreement_token ??
    responsePayment?.baToken ??
    responsePayment?.ba_token ??
    publicSettings?.billingAgreementToken ??
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
    approvalUrl,
    redirectUrl,
    billingAgreementToken,
  };
}

export function usePaymentProviderInstance(responsePayment, publicSettings, nestedPaymentSource = null) {
  const config = useMemo(
    () => resolvePaymentSdkConfig(responsePayment, publicSettings, nestedPaymentSource),
    [responsePayment, publicSettings, nestedPaymentSource]
  );

  const [prevSdkKey,         setPrevSdkKey]         = useState(null);
  const [stripePromiseCache, setStripePromiseCache] = useState(null);
  const [sdkReInitCounter,   setSdkReInitCounter]   = useState(0);

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
