// SubscriptionCard.jsx (full, self-contained)
// - Hardcoded Monetization Worker base URL
// - POST /customer-portal => { url } (Stripe Billing Portal)
// - Optional: pass `insightsUrls` (array of full URLs on your *User* worker)
//   to show “current plan / next charge / last payment” details.

import React, { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./SubscriptionCard.module.css";

/** ---------- small utils ---------- */
function formatCurrency(amount, currency = "usd") {
  if (amount == null) return "—";
  const n = typeof amount === "number" ? amount : Number(amount);
  // Stripe amounts are cents; if it looks like cents, display dollars.
  const normalized =
    Number.isFinite(n) && (n >= 100 || String(n).endsWith("00")) ? n / 100 : n;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: String(currency || "usd").toUpperCase(),
    }).format(normalized);
  } catch {
    return `${normalized} ${String(currency || "").toUpperCase()}`.trim();
  }
}

function fmtDate(ts) {
  if (!ts) return "—";
  const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truthy(v) {
  return v === true || String(v).toLowerCase() === "true";
}

/** normalize any subscription-ish object (snake_case or camelCase) to a stable shape */
function normalizeSub(raw) {
  if (!raw || typeof raw !== "object") return null;

  const price =
    raw.price ||
    (raw.plan && raw.plan.price) ||
    null;

  const unitAmount =
    price?.unit_amount ??
    price?.unitAmount ??
    raw.unitAmount ??
    raw.amount ??
    null;

  const currency = price?.currency ?? raw.currency ?? "usd";

  const currentPeriodStart =
    raw.currentPeriodStart ?? raw.current_period_start ?? null;
  const currentPeriodEnd =
    raw.currentPeriodEnd ?? raw.current_period_end ?? null;

  const cancelAtPeriodEnd =
    raw.cancelAtPeriodEnd ?? raw.cancel_at_period_end ?? false;

  // optional fields that might exist if your webhook stored them
  const nextInvoiceDate = raw.nextInvoiceDate ?? null;
  const nextInvoiceAmount = raw.nextInvoiceAmount ?? null;

  const lastPayment = raw.lastPayment || null;
  const lastInvoice = raw.lastInvoice || null;

  return {
    status:
      raw.status ||
      raw.subscriptionStatus ||
      "Active",
    plan:
      raw.plan?.nickname ||
      raw.priceNickname ||
      price?.nickname ||
      raw.productName ||
      raw.plan ||
      "Premium",
    price: {
      unitAmount,
      currency,
    },
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: truthy(cancelAtPeriodEnd),
    nextInvoiceDate,
    nextInvoiceAmount,
    lastPayment,
    lastInvoice,
  };
}

/** decide "next charge" vs "ends on" */
function getNextChargeInfo(n) {
  if (!n) return { label: "Next charge", value: "—" };
  if (n.cancelAtPeriodEnd) {
    return { label: "Ends on", value: fmtDate(n.currentPeriodEnd) };
  }
  const date = n.nextInvoiceDate || n.currentPeriodEnd;
  const amt = n.nextInvoiceAmount ?? n.price?.unitAmount ?? null;
  const val =
    date ? `${fmtDate(date)}${amt != null ? ` · ${formatCurrency(amt, n.price?.currency)}` : ""}` : "—";
  return { label: "Next charge", value: val };
}

/** build a nice last payment display from either lastPayment or lastInvoice */
function getLastPaymentInfo(n) {
  if (!n) return "—";
  const status = n.lastPayment?.status || n.lastInvoice?.status;
  const date = n.lastPayment?.date || n.lastInvoice?.date;
  if (!status && !date) return "—";
  return `${status || "—"} · ${fmtDate(date)}`;
}

/** ---------- component ---------- */
export default function SubscriptionCard({
  /** identity used by the worker to resolve the Stripe customer */
  username,
  email,
  /** optional: if you already have subscription data in state */
  initialSubscription = null,
  /** allow opt-out of full-width grid span */
  fullWidth = true,
  /**
   * Optional URLs on your *User* worker that return subscription info.
   * If not provided, the UI still works for billing, but shows placeholders.
   */
  insightsUrls = [],
}) {
  /** HARD-CODED Monetization Worker base URL (as requested) */
  const baseUrl = "https://kos-monetization.shepherdn.workers.dev";

  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(() => normalizeSub(initialSubscription));
  const [error, setError] = useState(null);

  const badgeClass = useMemo(() => {
    const st = String(insights?.status || "").toLowerCase();
    return st.includes("active") || st === "paid" ? styles.active : styles.free;
  }, [insights]);

  /** best-effort fetch from your *User* worker (if provided) */
  const fetchSubscription = useCallback(async () => {
    if (!insightsUrls.length) return; // nothing to query; UI still works
    setLoading(true);
    setError(null);

    for (const url of insightsUrls) {
      try {
        const r = await fetch(url, { headers: { "Accept": "application/json" } });
        if (!r.ok) continue;
        const data = await r.json();
        const normalized =
          normalizeSub(data?.subscription || data?.subscriptionIndex || data);
        if (normalized) {
          setInsights(normalized);
          setLoading(false);
          return;
        }
      } catch {
        /* try next candidate */
      }
    }
    setLoading(false);
  }, [insightsUrls]);

  /** open Stripe billing portal via monetization worker */
  const openBillingPortal = useCallback(async () => {
    setError(null);
    try {
      const r = await fetch(`${baseUrl}/customer-portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }), // worker can resolve by username/email
      });
      const data = await r.json();
      if (!r.ok || !data?.url) {
        throw new Error(data?.error || "Failed to open billing portal");
      }
      window.location.assign(data.url);
    } catch (err) {
      setError(err.message || "Unable to open billing portal");
    }
  }, [baseUrl, email, username]);

  /** unsubscribe just routes to portal; the portal supports cancel */
  const handleUnsubscribe = useCallback(() => {
    openBillingPortal();
  }, [openBillingPortal]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const nextInfo = getNextChargeInfo(insights);
  const lastPay = getLastPaymentInfo(insights);

  return (
    <div
      className={`${styles.card} ${fullWidth ? styles.fullWidth : ""}`}
      role="region"
      aria-label="Subscription details"
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>Subscription</h2>
      </div>

      <p className={styles.text}>
        <span className={styles.strong}>Current Plan:&nbsp;</span>
        {insights?.plan || "—"}
        <span className={`${styles.statusBadge} ${badgeClass}`} aria-live="polite">
          {insights?.status || "—"}
        </span>
      </p>

      <div className={styles.kvGrid} aria-label="Billing insights">
        <div className={styles.kvItem}>
          <div className={styles.kvLabel}>Price</div>
          <div className={styles.kvValue}>
            {insights?.price?.unitAmount != null
              ? `${formatCurrency(insights.price.unitAmount, insights.price.currency)} / mo`
              : "—"}
          </div>
        </div>

        <div className={styles.kvItem}>
          <div className={styles.kvLabel}>Current period</div>
          <div className={styles.kvValue}>
            {fmtDate(insights?.currentPeriodStart)} — {fmtDate(insights?.currentPeriodEnd)}
          </div>
        </div>

        <div className={styles.kvItem}>
          <div className={styles.kvLabel}>{nextInfo.label}</div>
          <div className={styles.kvValue}>{nextInfo.value}</div>
        </div>

        <div className={styles.kvItem}>
          <div className={styles.kvLabel}>Last payment</div>
          <div className={styles.kvValue}>{lastPay}</div>
        </div>
      </div>

      {error && <p className={styles.errorText} role="alert">{error}</p>}
      {loading && <p className={styles.helperText}>Loading subscription…</p>}

      <div className={styles.buttonRow}>
        <button
          className={styles.manageButton}
          onClick={openBillingPortal}
          aria-label="Open billing portal to manage subscription"
        >
          Manage Billing
        </button>

        <button
          className={`${styles.manageButton} ${styles.dangerButton}`}
          onClick={handleUnsubscribe}
          aria-label="Unsubscribe or cancel at period end"
          title="Unsubscribe (opens billing portal)"
        >
          Unsubscribe
        </button>
      </div>

      {insights?.cancelAtPeriodEnd && (
        <p className={styles.helperText} role="status">
          Your subscription will remain active until{" "}
          <span className={styles.strong}>{fmtDate(insights.currentPeriodEnd)}</span>.
        </p>
      )}
    </div>
  );
}
