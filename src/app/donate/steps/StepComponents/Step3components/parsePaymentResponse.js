// Turns the POST /donations/submit response into the context payload the payment
// panel reads. Kept separate from Step3Payment so the screen stays readable.
export function parsePaymentResponse({ res, data, gatewayState, grandTotal }) {
  const pick = (...values) => values.find((v) => v !== undefined && v !== null && v !== "");

  const providerSwapped = Boolean(
    res?.providerSwapped ?? res?.data?.providerSwapped ?? res?.data?.data?.providerSwapped
  );
  const providerSwappedFrom =
    res?.providerSwappedFrom ?? res?.data?.providerSwappedFrom ?? res?.data?.data?.providerSwappedFrom ?? null;
  const swappedReasonCode =
    res?.swappedReasonCode ?? res?.data?.swappedReasonCode ?? res?.data?.data?.swappedReasonCode ?? null;

  const payment =
    res?.payment ??
    res?.data?.payment ??
    res?.data?.data?.payment ??
    res?.payments?.[0] ??
    {};

  const pendingSessionId = pick(
    payment?.pendingSessionId,
    payment?.pending_session_id,
    res?.data?.pendingSessionId,
    res?.data?.pending_session_id,
    res?.pendingSessionId
  );
  const setupIntentId = pick(
    payment?.setupIntentId,
    payment?.setup_intent_id,
    payment?.setupIntent?.id,
    payment?.setup_intent?.id,
    res?.data?.setupIntentId,
    res?.data?.setup_intent_id
  );
  const paymentIntentId = pick(
    payment?.paymentIntentId,
    payment?.payment_intent_id,
    payment?.paymentIntent?.id,
    payment?.payment_intent?.id,
    res?.data?.paymentIntentId,
    res?.data?.payment_intent_id
  );
  const challenge =
    payment?.challenge ??
    res?.data?.challenge ??
    res?.challenge ??
    null;

  if (providerSwapped && typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("hc_unified_challenge");
      sessionStorage.removeItem("hc_last_challenge");
      sessionStorage.removeItem("hc_auth_challenge_id");
      sessionStorage.removeItem("hc_frontend_return_payload_id");
    } catch {}
  }

  if (challenge && typeof window !== "undefined") {
    try {
      sessionStorage.setItem("hc_unified_challenge", JSON.stringify(challenge));
      if (challenge.authChallengeId) {
        sessionStorage.setItem("hc_auth_challenge_id", String(challenge.authChallengeId));
      }
      if (challenge.frontendReturnPayloadId) {
        sessionStorage.setItem("hc_frontend_return_payload_id", String(challenge.frontendReturnPayloadId));
      }
    } catch {}
  }

  const resolvedPublishableKey = pick(
    res?.stripePublishableKey,
    res?.publishableKey,
    res?.stripe_publishable_key,
    res?.data?.stripePublishableKey,
    res?.data?.stripe_publishable_key,
    res?.data?.publishableKey,
    payment?.stripePublishableKey,
    payment?.stripe_publishable_key,
    payment?.publishableKey,
    payment?.publishable_key
  );
  const resolvedClientId = pick(
    res?.clientId,
    res?.client_id,
    res?.data?.clientId,
    res?.data?.client_id,
    res?.data?.payment?.clientId,
    res?.data?.payment?.client_id,
    payment?.clientId,
    payment?.client_id
  );
  const gatewayConfigurationId = pick(
    payment?.gatewayConfigurationId,
    payment?.gateway_configuration_id,
    res?.data?.gatewayConfigurationId,
    res?.data?.gateway_configuration_id,
    res?.gatewayConfigurationId,
    gatewayState?.configurationId,
    data?.gatewayConfigurationId
  );
  const orderId = pick(
    payment?.orderId,
    payment?.order_id,
    res?.data?.orderId,
    res?.data?.order_id,
    res?.orderId
  );
  const redirectUrl = pick(
    payment?.redirectUrl,
    payment?.redirect_url,
    payment?.approvalUrl,
    payment?.approval_url,
    res?.data?.redirectUrl,
    res?.data?.redirect_url,
    res?.data?.approvalUrl,
    res?.data?.approval_url,
    res?.redirectUrl,
    res?.approvalUrl
  );
  const approvalUrl = pick(
    payment?.approvalUrl,
    payment?.approval_url,
    res?.data?.approvalUrl,
    res?.data?.approval_url,
    res?.approvalUrl,
    redirectUrl
  );
  const billingAgreementToken = pick(
    payment?.billingAgreementToken,
    payment?.billing_agreement_token,
    payment?.baToken,
    res?.data?.billingAgreementToken,
    res?.data?.billing_agreement_token,
    res?.data?.baToken,
    res?.billingAgreementToken
  );
  const stripeClientSecret = pick(
    payment?.clientSecret,
    payment?.client_secret,
    payment?.stripeClientSecret,
    payment?.stripe_client_secret,
    payment?.setupIntent?.clientSecret,
    payment?.setupIntent?.client_secret,
    payment?.setup_intent?.client_secret,
    payment?.setup_intent?.clientSecret,
    payment?.paymentIntent?.clientSecret,
    payment?.paymentIntent?.client_secret,
    payment?.payment_intent?.client_secret,
    payment?.payment_intent?.clientSecret,
    res?.data?.clientSecret,
    res?.data?.client_secret,
    res?.data?.stripeClientSecret,
    res?.data?.stripe_client_secret,
    res?.clientSecret,
    res?.client_secret
  );
  const resolvedPaymentType =
    (payment?.paymentMode && (payment.paymentMode === "split" || payment.paymentMode === "recurring")) ? "recurring" :
    (payment?.paymentMode === "one_time" || payment?.paymentMode === "onetime") ? "one-time" :
    (setupIntentId && !paymentIntentId) ? "recurring" :
    data?.paymentType;
  const resolvedProvider = pick(
    payment?.provider,
    res?.data?.provider,
    res?.provider,
    gatewayState?.gateway,
    data?.paymentMethod
  );

  if (providerSwapped && resolvedProvider && typeof window !== "undefined") {
    try {
      sessionStorage.setItem("hc_provider_swap", JSON.stringify({
        swapped: true,
        from: providerSwappedFrom,
        to: resolvedProvider,
        reasonCode: swappedReasonCode,
        donationId: res?.donationId ?? res?.data?.donationId ?? null,
        ts: Date.now(),
      }));
    } catch {}
  }

  const updatePayload = {
    donationId:           pick(res?.donationId, res?.data?.donationId, res?.id),
    guestSessionId:       pick(res?.guestSessionId, res?.data?.guestSessionId, res?.guest_session_id, res?.data?.guest_session_id),
    stripeClientSecret,
    stripePublishableKey: resolvedPublishableKey,
    paypalClientId:       resolvedClientId,
    paypalOrderId:        orderId,
    pendingSessionId,
    setupIntentId,
    gatewayConfigurationId,
    paymentMethod:        resolvedProvider,
    paymentType:          resolvedPaymentType,
    grandTotal:           grandTotal ?? data?.grandTotal ?? 0,
    submitted:            true,
    unifiedChallenge:     challenge,
    payment:              payment ?? res?.data?.payment ?? res?.payment ?? {},
    redirectUrl,
    paypalRedirectUrl:    redirectUrl,
    approvalUrl,
    paypalApprovalUrl:    approvalUrl,
    billingAgreementToken,
    paypalBillingAgreementToken: billingAgreementToken,
    baToken:              billingAgreementToken,
    providerSwapped,
    providerSwappedFrom:  providerSwappedFrom ?? "",
    swappedReasonCode:    swappedReasonCode ?? "",
  };

  return {
    updatePayload,
    resolvedProvider,
    resolvedPublishableKey,
    resolvedClientId,
    gatewayConfigurationId,
  };
}
