import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import RouteProgressBar from "@/components/layout/RouteProgressBar";
import DonationSessionCleaner from "@/components/common/DonationSessionCleaner";

export const metadata = {
  title: "Human Concern",
  description: "A platform for connecting people and resources to address human concerns.",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <Script id="hc-early-probe-tolerance" strategy="beforeInteractive">
          {`
(function () {
  if (typeof window === "undefined") return;
  var KNOWN_SDK_PROBE_MSG_RE = /(atob|URI malformed|Unexpected token|not correctly encoded|not valid JSON|decodeURI|map called on null)/i;
  var prevOnError = window.onerror;
  function suppressProbe(msg, url, lineNo, colNo, err) {
    var s = String(msg || "") + " " + String((err && err.message) || "");
    if (KNOWN_SDK_PROBE_MSG_RE.test(s)) return true;
    if (typeof prevOnError === "function") {
      try { return prevOnError.apply(this, arguments); } catch (_) { return false; }
    }
    return false;
  }
  try { Object.defineProperty(window, "onerror", { configurable: true, enumerable: true, get: function () { return suppressProbe; }, set: function (next) { prevOnError = next; } }); }
  catch (_) { window.onerror = suppressProbe; }

  var $atob = window.atob.bind(window);
  var $decodeURIComponent = window.decodeURIComponent.bind(window);
  var $decodeURI = window.decodeURI.bind(window);

  function safeAtob(input) {
    var s = input;
    if (typeof s !== "string") {
      try { s = String(s); } catch (e) { throw e; }
    }
    try {
      return $atob(s);
    } catch (err1) {
      var isShortOrProbe = (s.length < 32) || (s === "paypal-sdk");
      if (/^[A-Za-z0-9\+\/\s=]*$/.test(s) && s.length >= 8) {
        try {
          var pad0 = (4 - (s.length % 4)) % 4;
          var alt0 = pad0 ? (s + new Array(pad0 + 1).join("=")) : s;
          return $atob(alt0);
        } catch (_e0) {}
      }
      if (s.length >= 16 && /^[A-Za-z0-9\-_=]+$/.test(s) && /[-_=]/.test(s)) {
        try {
          var alt = s.replace(/-/g, "+").replace(/_/g, "/");
          var pad = (4 - (alt.length % 4)) % 4;
          if (pad) alt += new Array(pad + 1).join("=");
          return $atob(alt);
        } catch (_) {}
      }
      if (isShortOrProbe) throw err1;
      throw err1;
    }
  }

  function safeDecodeURIComponent(input) {
    var str = typeof input === "string" ? input : String(input || "");
    try {
      return $decodeURIComponent(str);
    } catch (err) {
      try {
        return $decodeURI(str);
      } catch (_e1) {
        var isShortOrProbe = (str.length < 32) || /^%(?:[0-9A-Fa-f]{2})+$/.test(str);
        var looksRealPercent = typeof str === "string" && str.length >= 32 && /^[%A-Za-z0-9\-_.~!$&'()*+,;=:@\/?#]+$/.test(str) && /%(?:[0-9A-Fa-f]{2})+/.test(str);
        if (looksRealPercent && /%/.test(str)) {
          try {
            var fixed = str.replace(/%(?![0-9A-Fa-f]{2})/g, "%25");
            return $decodeURIComponent(fixed);
          } catch (_e3) {}
        }
        if (isShortOrProbe) throw err;
        throw err;
      }
    }
  }

  function safeDecodeURI(input) {
    var str = typeof input === "string" ? input : String(input || "");
    try {
      return $decodeURI(str);
    } catch (err) {
      var isShortOrProbe = (str.length < 32) || /^%(?:[0-9A-Fa-f]{2})+$/.test(str);
      var looksReal = typeof str === "string" && str.length >= 32 && /[%A-Za-z0-9\-_.~!$&'()*+,;=:@\/?#]/.test(str);
      if (looksReal && /%/.test(str)) {
        try {
          var fixed2 = str.replace(/%(?![0-9A-Fa-f]{2})/g, "%25");
          return $decodeURI(fixed2);
        } catch (_e3) {}
      }
      if (isShortOrProbe) throw err;
      throw err;
    }
  }

  try { Object.defineProperty(window, "atob", { configurable: false, enumerable: true, writable: false, value: safeAtob }); }
  catch (_) { try { window.atob = safeAtob; } catch (_e) {} }
  try { Object.defineProperty(window, "decodeURIComponent", { configurable: false, enumerable: true, writable: false, value: safeDecodeURIComponent }); }
  catch (_) { try { window.decodeURIComponent = safeDecodeURIComponent; } catch (_e) {} }
  try { Object.defineProperty(window, "decodeURI", { configurable: false, enumerable: true, writable: false, value: safeDecodeURI }); }
  catch (_) { try { window.decodeURI = safeDecodeURI; } catch (_e) {} }
})();
          `}
        </Script>
      </head>
      <body className="antialiased">
        <RouteProgressBar />
        <AuthProvider>
          <DonationSessionCleaner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout
