// Path:
// Focus:
// Version Update:

import React, { useEffect, useMemo, useRef, useState } from "react";
import { submitIssueReport, validateIssueReport } from "../utils/issueHelper";
import styles from "./IssueReportModal.module.css";

export default function IssueReportModal({
  open,
  onClose,
  onSubmit,
  appVersion,
  gitCommit,
  collectExtras,
  recentLogs,
  defaultSeverity = "medium",
}) {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [stepsRaw, setStepsRaw] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [severity, setSeverity] = useState(defaultSeverity);
  const [category, setCategory] = useState("");
  const [component, setComponent] = useState("");
  const [email, setEmail] = useState("");
  const [allowContact, setAllowContact] = useState(true);
  const [files, setFiles] = useState([]);
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [extras, setExtras] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef(null);

  // Reset form when opened/closed
  useEffect(() => {
    if (open) {
      setError("");
      setSummary("");
      setDescription("");
      setStepsRaw("");
      setExpected("");
      setActual("");
      setSeverity(defaultSeverity);
      setCategory("");
      setComponent("");
      setEmail("");
      setAllowContact(true);
      setFiles([]);
      setIncludeDiagnostics(true);
      setExtras(null);
      setSubmitting(false);
      if (collectExtras) {
        setCollecting(true);
        Promise.resolve(collectExtras())
          .then((data) => setExtras(data || null))
          .catch(() => setExtras({ error: "collectExtras failed" }))
          .finally(() => setCollecting(false));
      }
    }
  }, [open, defaultSeverity, collectExtras]);

  // Basic runtime snapshot
  const baseDiagnostics = useMemo(() => {
    if (!open) return null;
    const nav = typeof navigator !== "undefined" ? navigator : {};
    const win = typeof window !== "undefined" ? window : {};
    const perf = typeof performance !== "undefined" ? performance : {};

    const memory = (perf && perf.memory) || (nav && nav.deviceMemory) || undefined;

    return {
      timestampISO: new Date().toISOString(),
      url: win.location ? String(win.location.href) : "",
      userAgent: nav.userAgent || "",
      platform: nav.platform || "",
      language: nav.language || "",
      viewport: {
        width: win.innerWidth || 0,
        height: win.innerHeight || 0,
      },
      devicePixelRatio: win.devicePixelRatio || 1,
      online: typeof navigator !== "undefined" ? !!navigator.onLine : true,
      appVersion,
      gitCommit,
      memory,
      performance: {
        timeOrigin: perf.timeOrigin,
        now: typeof perf.now === "function" ? perf.now() : undefined,
      },
      recentLogs,
      extras,
    };
  }, [open, appVersion, gitCommit, recentLogs, extras]);

  // Escape to close
  useEffect(() => {
    function onKey(e) {
      if (!open || submitting) return;
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  const handleFileChange = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles(f);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");

    const steps = stepsRaw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      summary: summary.trim(),
      description: description.trim(),
      steps,
      expected: expected.trim(),
      actual: actual.trim(),
      severity,
      category: category.trim() || undefined,
      component: component.trim() || undefined,
      email: email.trim() || undefined,
      allowContact,
      attachments: files,
      diagnostics: includeDiagnostics ? baseDiagnostics : undefined,
    };

    // Validate the payload first
    const validationErrors = validateIssueReport(payload);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    setSubmitting(true);

    try {
      // Submit directly to the API via issueHelper
      const result = await submitIssueReport(payload);
      
      // Call the parent onSubmit callback if provided (for custom handling)
      if (onSubmit) {
        await onSubmit(payload, result);
      }
      
      // Close the modal on success
      onClose?.();
    } catch (err) {
      console.error("Issue report submission failed:", err);
      
      // Extract meaningful error message
      let errorMessage = "Submit failed. Please try again.";
      if (err.message) {
        if (err.message.includes("HTTP 4")) {
          errorMessage = "Invalid request. Please check your input and try again.";
        } else if (err.message.includes("HTTP 5")) {
          errorMessage = "Server error. Please try again later.";
        } else if (err.message.includes("network") || err.message.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = `Submit failed: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="issue-modal-title">
      <div className={styles.modal} ref={dialogRef}>
        <div className={styles.header}>
          <h2 id="issue-modal-title" style={{ margin: 0 }}>Report an Issue</h2>
          <button 
            type="button" 
            onClick={onClose} 
            aria-label="Close" 
            className={styles.closeBtn}
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error ? <div className={styles.error}>{error}</div> : null}

          <label className={styles.label}>
            Summary <span className={styles.req}>*</span>
            <input
              className={styles.input}
              type="text"
              placeholder="One-line title (e.g., Crash when saving quiz)"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              disabled={submitting}
              maxLength={200}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {summary.length}/200 characters
            </div>
          </label>

          <label className={styles.label}>
            Description
            <textarea
              className={styles.textarea}
              placeholder="What happened? Any context we should know?"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              maxLength={5000}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {description.length}/5000 characters
            </div>
          </label>

          <label className={styles.label}>
            Steps to reproduce (one per line)
            <textarea
              className={styles.textarea}
              placeholder={"1) Go to Dashboard\n2) Click Save\n3) Observe error"}
              rows={4}
              value={stepsRaw}
              onChange={(e) => setStepsRaw(e.target.value)}
              disabled={submitting}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.labelFlex}>
              Expected result
              <input
                className={styles.input}
                type="text"
                placeholder="What should have happened?"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                disabled={submitting}
              />
            </label>
            <label className={`${styles.labelFlex} ${styles.rowGap}`}>
              Actual result
              <input
                className={styles.input}
                type="text"
                placeholder="What actually happened?"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                disabled={submitting}
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.labelFlex}>
              Severity
              <select 
                className={styles.input} 
                value={severity} 
                onChange={(e) => setSeverity(e.target.value)}
                disabled={submitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>

            <label className={`${styles.labelFlex} ${styles.rowGap}`}>
              Category (optional)
              <input 
                className={styles.input} 
                type="text" 
                placeholder="e.g., UI, Performance, Data" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.labelFlex}>
              Component (optional)
              <input 
                className={styles.input} 
                type="text" 
                placeholder="e.g., QuizScoring, MBTISetupModal" 
                value={component} 
                onChange={(e) => setComponent(e.target.value)}
                disabled={submitting}
              />
            </label>

            <label className={`${styles.labelFlex} ${styles.rowGap}`}>
              Your email (optional)
              <input 
                className={styles.input} 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </label>
          </div>

          <label className={styles.label}>
            Attachments (screenshots, logs)
            <input 
              className={styles.input} 
              type="file" 
              multiple 
              onChange={handleFileChange}
              disabled={submitting}
              accept="image/jpeg,image/png,image/gif,image/webp,text/plain,text/csv,application/json,application/pdf"
            />
            {files.length > 0 && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {files.length} file(s) selected (max 5 files, 10MB each)
              </div>
            )}
          </label>

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={allowContact} 
                onChange={(e) => setAllowContact(e.target.checked)}
                disabled={submitting}
              /> 
              Allow us to contact you about this issue
            </label>
          </div>

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={includeDiagnostics} 
                onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                disabled={submitting}
              /> 
              Include diagnostics (URL, browser, viewport, version)
            </label>
            {collecting && <span style={{ marginLeft: 8, fontSize: 12 }}>Collecting details…</span>}
          </div>

          {includeDiagnostics && (
            <details className={styles.details}>
              <summary>Preview diagnostics JSON</summary>
              <pre className={styles.pre}>
                {JSON.stringify(baseDiagnostics, null, 2)}
              </pre>
            </details>
          )}

          <div className={styles.footer}>
            <button 
              type="button" 
              onClick={onClose} 
              className={styles.secondaryBtn}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.primaryBtn}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}