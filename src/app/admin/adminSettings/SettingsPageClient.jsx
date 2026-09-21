"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import AdminHeaderActions from "@/app/admin/components/AdminHeaderActions";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  changeAdminPassword,
  deleteAdminBrandingLogo,
  disconnectAdminPaymentGateway,
  getAdminSettingsBranding,
  getAdminSettingsExchangeRates,
  getAdminSettingsGeneral,
  getAdminSettingsHomepage,
  getAdminSettingsEmail,
  getAdminSettingsNotifications,
  getAdminSettingsPayment,
  getAdminSettingsSecurity,
  sendAdminSettingsTestEmail,
  setAdminPaymentGatewayEnabled,
  syncAdminSettingsExchangeRates,
  updateAdminPaymentGatewayConfiguration,
  updateAdminSettingsBranding,
  updateAdminSettingsEmail,
  updateAdminSettingsExchangeRates,
  updateAdminSettingsGeneral,
  updateAdminSettingsHomepage,
  updateAdminSettingsNotifications,
  updateAdminSettingsSecurity,
  uploadAdminBrandingLogo,
  uploadAdminBrandingFavicon,
  deleteAdminBrandingFavicon,
  uploadAdminHomepageMedia,
} from "@/services/admin";
import SettingsTabs from "./components/SettingsTabs";
import GeneralTab from "./components/tabs/GeneralTab";
import NotificationsTab from "./components/tabs/NotificationsTab";
import SecurityTab from "./components/tabs/SecurityTab";
import BrandingTab from "./components/tabs/BrandingTab";
import HomepageTab from "./components/tabs/HomepageTab";
import PaymentTab from "./components/tabs/PaymentTab";
import ExchangeRatesTab from "./components/tabs/ExchangeRatesTab";
import EmailTab, { validateSmtpConfig } from "./components/tabs/EmailTab";

function normalizeObj(res) {
  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data;
  if (res?.data?.data && typeof res.data.data === "object" && !Array.isArray(res.data.data)) return res.data.data;
  return res && typeof res === "object" ? res : {};
}

function diffObject(prev, next) {
  const p = prev && typeof prev === "object" ? prev : {};
  const n = next && typeof next === "object" ? next : {};
  const out = {};
  for (const key of Object.keys(n)) {
    if (n[key] !== p[key]) out[key] = n[key];
  }
  return out;
}

function normalizeExchangeRates(data) {
  if (Array.isArray(data?.exchangeRates)) return data.exchangeRates;
  if (Array.isArray(data?.rates)) return data.rates;
  if (Array.isArray(data)) return data;
  return [];
}

function diffList(prev, next) {
  const p = Array.isArray(prev) ? prev : [];
  const n = Array.isArray(next) ? next : [];
  return JSON.stringify(p) === JSON.stringify(n) ? null : n;
}

const tabs = ["general", "exchange-rates", "payment", "email", "notifications", "security", "branding", "homepage"];

const SettingsPageClient = () => {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { admin } = useAdminAuth();

  const initialTab = useMemo(() => {
    const t = String(searchParams?.get("tab") || "general").toLowerCase();
    return tabs.includes(t) ? t : "general";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  function setTab(next) {
    const t = tabs.includes(next) ? next : "general";
    setActiveTab(t);
    const sp = new URLSearchParams(searchParams?.toString?.() || "");
    sp.set("tab", t);
    router.replace(`/admin/adminSettings?${sp.toString()}`);
  }

  const [error, setError] = useState("");

  const [general, setGeneral] = useState({ organization: {}, localization: {} });
  const [generalInitial, setGeneralInitial] = useState({ organization: {}, localization: {} });
  const [generalLoading, setGeneralLoading] = useState(false);
  const [generalSaving, setGeneralSaving] = useState(false);

  const [notifications, setNotifications] = useState({});
  const [notificationsInitial, setNotificationsInitial] = useState({});
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsSaving, setNotificationsSaving] = useState(false);

  const [security, setSecurity] = useState({});
  const [securityInitial, setSecurityInitial] = useState({});
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  const [branding, setBranding] = useState({});
  const [brandingInitial, setBrandingInitial] = useState({});
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [brandingLogoBusy, setBrandingLogoBusy] = useState(false);
  const [brandingFaviconBusy, setBrandingFaviconBusy] = useState(false);

  const [homepage, setHomepage] = useState({});
  const [homepageInitial, setHomepageInitial] = useState({});
  const [homepageLoading, setHomepageLoading] = useState(false);
  const [homepageSaving, setHomepageSaving] = useState(false);

  const [payment, setPayment] = useState({});
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);

  const [email, setEmail] = useState({});
  const [emailInitial, setEmailInitial] = useState({});
  const [emailResolved, setEmailResolved] = useState({});
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailTestTo, setEmailTestTo] = useState("");

  const [exchangeRates, setExchangeRates] = useState([]);
  const [exchangeRatesInitial, setExchangeRatesInitial] = useState([]);
  const [exchangeRatesLoading, setExchangeRatesLoading] = useState(false);
  const [exchangeRatesSaving, setExchangeRatesSaving] = useState(false);
  const [exchangeRatesSyncing, setExchangeRatesSyncing] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);

  async function refreshExchangeRates() {
    const res = await getAdminSettingsExchangeRates();
    const data = normalizeObj(res);
    const rates = normalizeExchangeRates(data);
    setExchangeRates(rates);
    setExchangeRatesInitial(rates);
    return rates;
  }

  function applyEmailResponse(res) {
    const data = normalizeObj(res);
    const incoming = data?.email && typeof data.email === "object" ? data.email : {};
    // The password is write-only — keep the field empty so an untouched form never re-sends it.
    const masked = { ...incoming, password: "" };
    setEmail(masked);
    setEmailInitial(masked);
    setEmailResolved(data?.resolved && typeof data.resolved === "object" ? data.resolved : {});
    return masked;
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      setError("");
      try {
        if (activeTab === "general") {
          setGeneralLoading(true);
          const res = await getAdminSettingsGeneral();
          if (!alive) return;
          const data = normalizeObj(res);
          setGeneral(data);
          setGeneralInitial(data);
        }
        if (activeTab === "notifications") {
          setNotificationsLoading(true);
          const res = await getAdminSettingsNotifications();
          if (!alive) return;
          const data = normalizeObj(res);
          const n = data?.notifications && typeof data.notifications === "object" ? data.notifications : data;
          setNotifications(n);
          setNotificationsInitial(n);
        }
        if (activeTab === "security") {
          setSecurityLoading(true);
          const res = await getAdminSettingsSecurity();
          if (!alive) return;
          const data = normalizeObj(res);
          const s = data?.security && typeof data.security === "object" ? data.security : data;
          setSecurity(s);
          setSecurityInitial(s);
        }
        if (activeTab === "branding") {
          setBrandingLoading(true);
          const res = await getAdminSettingsBranding();
          if (!alive) return;
          const data = normalizeObj(res);
          setBranding(data);
          setBrandingInitial(data);
        }
        if (activeTab === "homepage") {
          setHomepageLoading(true);
          const res = await getAdminSettingsHomepage();
          if (!alive) return;
          const data = normalizeObj(res);
          const h = data?.homepage && typeof data.homepage === "object" ? data.homepage : data;
          setHomepage(h);
          setHomepageInitial(h);
        }
        if (activeTab === "payment") {
          setPaymentLoading(true);
          const res = await getAdminSettingsPayment();
          if (!alive) return;
          const data = normalizeObj(res);
          setPayment(data);
        }
        if (activeTab === "exchange-rates") {
          setExchangeRatesLoading(true);
          const res = await getAdminSettingsExchangeRates();
          if (!alive) return;
          const data = normalizeObj(res);
          const rates = normalizeExchangeRates(data);
          setExchangeRates(rates);
          setExchangeRatesInitial(rates);
        }
        if (activeTab === "email") {
          setEmailLoading(true);
          const res = await getAdminSettingsEmail();
          if (!alive) return;
          applyEmailResponse(res);
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load settings.");
      } finally {
        if (!alive) return;
        setGeneralLoading(false);
        setNotificationsLoading(false);
        setSecurityLoading(false);
        setBrandingLoading(false);
        setHomepageLoading(false);
        setPaymentLoading(false);
        setExchangeRatesLoading(false);
        setEmailLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [activeTab]);

  async function saveGeneral(section) {
    setGeneralSaving(true);
    setError("");
    try {
      const orgPatch = diffObject(generalInitial?.organization, general?.organization);
      const locPatch = diffObject(generalInitial?.localization, general?.localization);
      const payload = {};
      if (section === "organization") {
        if (Object.keys(orgPatch).length) payload.organization = orgPatch;
      } else if (section === "localization") {
        if (Object.keys(locPatch).length) payload.localization = locPatch;
      } else {
        if (Object.keys(orgPatch).length) payload.organization = orgPatch;
        if (Object.keys(locPatch).length) payload.localization = locPatch;
      }

      if (!Object.keys(payload).length) {
        toast.info("No changes to save.");
        return;
      }

      const res = await updateAdminSettingsGeneral(payload);
      const data = normalizeObj(res);
      setGeneral(data);
      setGeneralInitial(data);
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setGeneralSaving(false);
    }
  }

  async function saveNotifications() {
    setNotificationsSaving(true);
    setError("");
    try {
      const payload = diffObject(notificationsInitial, notifications);
      if (!Object.keys(payload).length) {
        toast.info("No changes to save.");
        return;
      }
      const res = await updateAdminSettingsNotifications(payload);
      const data = normalizeObj(res);
      const n = data?.notifications && typeof data.notifications === "object" ? data.notifications : data;
      setNotifications(n);
      setNotificationsInitial(n);
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setNotificationsSaving(false);
    }
  }

  async function saveSecurity() {
    setSecuritySaving(true);
    setPasswordSaving(true);
    setError("");
    try {
      const secPayload = diffObject(securityInitial, security);
      const secHasChanges = Object.keys(secPayload).length > 0;

      const wantsPasswordChange =
        String(passwordForm.currentPassword || "").trim() ||
        String(passwordForm.newPassword || "").trim() ||
        String(passwordForm.confirmNewPassword || "").trim();

      if (!secHasChanges && !wantsPasswordChange) {
        toast.info("No changes to save.");
        return;
      }

      if (secHasChanges) {
        const res = await updateAdminSettingsSecurity(secPayload);
        const data = normalizeObj(res);
        const s = data?.security && typeof data.security === "object" ? data.security : data;
        setSecurity(s);
        setSecurityInitial(s);
      }

      if (wantsPasswordChange) {
        const currentPassword = String(passwordForm.currentPassword || "");
        const newPassword = String(passwordForm.newPassword || "");
        const confirmNewPassword = String(passwordForm.confirmNewPassword || "");

        if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
          toast.error("Fill all password fields.");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          toast.error("Passwords do not match.");
          return;
        }

        await changeAdminPassword({ currentPassword, newPassword });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      }

      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setSecuritySaving(false);
      setPasswordSaving(false);
    }
  }

  async function saveBranding() {
    setBrandingSaving(true);
    setError("");
    try {
      const current = branding?.branding && typeof branding.branding === "object" ? branding.branding : branding;
      const initial = brandingInitial?.branding && typeof brandingInitial.branding === "object" ? brandingInitial.branding : brandingInitial;
      const payload = diffObject(initial, current);
      if (!Object.keys(payload).length) {
        toast.info("No changes to save.");
        return;
      }
      const res = await updateAdminSettingsBranding(payload);
      const data = normalizeObj(res);
      setBranding(data);
      setBrandingInitial(data);
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setBrandingSaving(false);
    }
  }

  async function uploadLogo(file) {
    if (!file) return;
    setBrandingLogoBusy(true);
    setError("");
    try {
      const res = await uploadAdminBrandingLogo(file);
      const data = normalizeObj(res);
      setBranding(data);
      setBrandingInitial(data);
      toast.success("Logo uploaded");
    } catch (e) {
      setError(e?.message || "Upload failed.");
      toast.error(e?.message || "Upload failed.");
    } finally {
      setBrandingLogoBusy(false);
    }
  }

  async function removeLogo() {
    setBrandingLogoBusy(true);
    setError("");
    try {
      const res = await deleteAdminBrandingLogo();
      const data = normalizeObj(res);
      setBranding(data);
      setBrandingInitial(data);
      toast.success("Logo removed");
    } catch (e) {
      setError(e?.message || "Remove failed.");
      toast.error(e?.message || "Remove failed.");
    } finally {
      setBrandingLogoBusy(false);
    }
  }

  async function uploadFavicon(file) {
    if (!file) return;
    setBrandingFaviconBusy(true);
    setError("");
    try {
      const res = await uploadAdminBrandingFavicon(file);
      const data = normalizeObj(res);
      setBranding(data);
      setBrandingInitial(data);
      toast.success("Favicon uploaded");
    } catch (e) {
      setError(e?.message || "Upload failed.");
      toast.error(e?.message || "Upload failed.");
    } finally {
      setBrandingFaviconBusy(false);
    }
  }

  async function removeFavicon() {
    setBrandingFaviconBusy(true);
    setError("");
    try {
      const res = await deleteAdminBrandingFavicon();
      const data = normalizeObj(res);
      setBranding(data);
      setBrandingInitial(data);
      toast.success("Favicon removed");
    } catch (e) {
      setError(e?.message || "Remove failed.");
      toast.error(e?.message || "Remove failed.");
    } finally {
      setBrandingFaviconBusy(false);
    }
  }

  async function saveHomepage() {
    setHomepageSaving(true);
    setError("");
    try {
      // Top-level keys only (sections / header / footer); nested arrays are replaced wholesale server-side.
      const payload = {};
      for (const key of Object.keys(homepage || {})) {
        if (JSON.stringify(homepage[key]) !== JSON.stringify((homepageInitial || {})[key])) {
          payload[key] = homepage[key];
        }
      }
      if (!Object.keys(payload).length) {
        toast.info("No changes to save.");
        return;
      }
      const res = await updateAdminSettingsHomepage(payload);
      const data = normalizeObj(res);
      const h = data?.homepage && typeof data.homepage === "object" ? data.homepage : data;
      setHomepage(h);
      setHomepageInitial(h);
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setHomepageSaving(false);
    }
  }

  // Uploads one image and returns its public path; the tab stores it in the right slot.
  async function uploadHomepageImage(file) {
    if (!file) return "";
    setError("");
    try {
      const res = await uploadAdminHomepageMedia(file);
      const data = normalizeObj(res);
      return data?.path || "";
    } catch (e) {
      setError(e?.message || "Upload failed.");
      toast.error(e?.message || "Upload failed.");
      return "";
    }
  }

  async function configureGateway(provider, payload) {
    setPaymentBusy(true);
    setError("");
    try {
      await updateAdminPaymentGatewayConfiguration(provider, payload);
      const res = await getAdminSettingsPayment();
      const data = normalizeObj(res);
      setPayment(data);
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function toggleGateway(provider, configurationId, enabled) {
    setPaymentBusy(true);
    setError("");
    try {
      await setAdminPaymentGatewayEnabled(provider, enabled, configurationId);
      const res = await getAdminSettingsPayment();
      const data = normalizeObj(res);
      setPayment(data);
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Update failed.");
      toast.error(e?.message || "Update failed.");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function disconnectGateway(provider, configurationId) {
    setPaymentBusy(true);
    setError("");
    try {
      await disconnectAdminPaymentGateway(provider, configurationId);
      const res = await getAdminSettingsPayment();
      const data = normalizeObj(res);
      setPayment(data);
      toast.success("Disconnected");
    } catch (e) {
      setError(e?.message || "Disconnect failed.");
      toast.error(e?.message || "Disconnect failed.");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function saveExchangeRates() {
    setExchangeRatesSaving(true);
    setError("");
    try {
      const cleaned = (Array.isArray(exchangeRates) ? exchangeRates : []).map((item) => ({
        currency: String(item?.currency || "").trim(),
        rate: String(item?.rate || "").trim(),
      }));
      const payloadRates = diffList(exchangeRatesInitial, cleaned);

      if (!payloadRates) {
        toast.info("No changes to save.");
        return;
      }

      const res = await updateAdminSettingsExchangeRates({ exchangeRates: cleaned });
      const data = normalizeObj(res);
      const rates = normalizeExchangeRates(data);
      setExchangeRates(rates);
      setExchangeRatesInitial(rates);
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setExchangeRatesSaving(false);
    }
  }

  async function syncExchangeRates() {
    setExchangeRatesSyncing(true);
    setError("");
    try {
      await syncAdminSettingsExchangeRates();
      await refreshExchangeRates();
      toast.success("Exchange rates synced");
    } catch (e) {
      setError(e?.message || "Sync failed.");
      toast.error(e?.message || "Sync failed.");
    } finally {
      setExchangeRatesSyncing(false);
    }
  }

  async function saveEmail() {
    setEmailSaving(true);
    setError("");
    try {
      const validationErrors = validateSmtpConfig(email);
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        setError(firstError);
        toast.error(firstError);
        return;
      }

      const { password, ...rest } = email || {};
      const payload = diffObject(emailInitial || {}, rest);
      if (typeof password === "string" && password.length > 0) payload.password = password;

      if (!Object.keys(payload).length) {
        toast.info("No changes to save.");
        return;
      }

      const res = await updateAdminSettingsEmail(payload);
      applyEmailResponse(res);
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setEmailSaving(false);
    }
  }

  async function sendEmailTest() {
    setEmailTesting(true);
    setError("");
    try {
      const res = await sendAdminSettingsTestEmail({ to: emailTestTo });
      const data = normalizeObj(res);
      if (data?.ok) {
        toast.success(`Test email sent to ${data.to || "the configured address"}`);
      } else {
        toast.error(data?.error || "Test email failed.");
      }

      const refreshed = await getAdminSettingsEmail();
      applyEmailResponse(refreshed);
    } catch (e) {
      setError(e?.message || "Test failed.");
      toast.error(e?.message || "Test failed.");
    } finally {
      setEmailTesting(false);
    }
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <div className="hc-animate-fade-up flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">Settings</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Manage your platform settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <AdminHeaderActions admin={admin} />
        </div>
      </div>

      <SettingsTabs value={activeTab} onChange={setTab} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      {activeTab === "general" ? (
        <GeneralTab value={general} onChange={setGeneral} loading={generalLoading} saving={generalSaving} onSaveOrganization={() => saveGeneral("organization")} onSaveLocalization={() => saveGeneral("localization")} />
      ) : null}

      {activeTab === "exchange-rates" ? (
        <ExchangeRatesTab
          value={exchangeRates}
          onChange={setExchangeRates}
          loading={exchangeRatesLoading}
          saving={exchangeRatesSaving}
          syncing={exchangeRatesSyncing}
          onSave={saveExchangeRates}
          onSync={syncExchangeRates}
        />
      ) : null}

      {activeTab === "payment" ? (
        <PaymentTab
          value={payment}
          loading={paymentLoading}
          busy={paymentBusy || paymentLoading}
          onConfigure={configureGateway}
          onToggleEnabled={toggleGateway}
          onDisconnect={disconnectGateway}
        />
      ) : null}

      {activeTab === "email" ? (
        <EmailTab
          value={email}
          resolved={emailResolved}
          testTo={emailTestTo}
          onChangeTestTo={setEmailTestTo}
          onChange={setEmail}
          loading={emailLoading}
          saving={emailSaving}
          testing={emailTesting}
          onSave={saveEmail}
          onSendTest={sendEmailTest}
        />
      ) : null}

      {activeTab === "notifications" ? (
        <NotificationsTab value={notifications} onChange={setNotifications} loading={notificationsLoading} saving={notificationsSaving} onSave={saveNotifications} />
      ) : null}

      {activeTab === "security" ? (
        <SecurityTab
          value={security}
          onChange={setSecurity}
          loading={securityLoading}
          saving={securitySaving || passwordSaving}
          passwordForm={passwordForm}
          onChangePasswordForm={setPasswordForm}
          onSave={saveSecurity}
        />
      ) : null}

      {activeTab === "branding" ? (
        <BrandingTab
          value={branding}
          onChange={setBranding}
          loading={brandingLoading}
          saving={brandingSaving}
          logoBusy={brandingLogoBusy}
          onUploadLogo={uploadLogo}
          onRemoveLogo={removeLogo}
          faviconBusy={brandingFaviconBusy}
          onUploadFavicon={uploadFavicon}
          onRemoveFavicon={removeFavicon}
          onSave={saveBranding}
        />
      ) : null}

      {activeTab === "homepage" ? (
        <HomepageTab
          value={homepage}
          onChange={setHomepage}
          loading={homepageLoading}
          saving={homepageSaving}
          onSave={saveHomepage}
          onUploadImage={uploadHomepageImage}
        />
      ) : null}
    </main>
  );
}
export default SettingsPageClient;
