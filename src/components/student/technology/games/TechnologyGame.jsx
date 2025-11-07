// BinaryBuilder.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "./TechnologyGame.module.css";

/**
 * Binary Builder – a simple techy bit-toggling puzzle.
 * Match the target decimal number by flipping bits. Supports 4/6/8-bit modes.
 * Keyboard: [0–7] toggle bit (LSB = 0), Space = submit, H = hint, C = clear.
 */
export default function BinaryBuilder() {
  const MODES = [4, 6, 8];
  const [bitLength, setBitLength] = useState(6);
  const [bits, setBits] = useState(Array(6).fill(0));
  const [target, setTarget] = useState(() => randTarget(6));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [message, setMessage] = useState("Flip bits to match the target.");
  const [showHint, setShowHint] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const mounted = useRef(false);

  // Derived values
  const maxValue = useMemo(() => (1 << bitLength) - 1, [bitLength]);
  const currentValue = useMemo(() => bitsToValue(bits), [bits]);

  // Keep bit array length synced with mode changes
  useEffect(() => {
    setBits((prev) => {
      const next = Array(bitLength).fill(0);
      // Copy over (preserve least significant bits)
      for (let i = 0; i < Math.min(prev.length, bitLength); i++) {
        next[i] = prev[i];
      }
      return next;
    });
    setTarget(randTarget(bitLength));
    setShowHint(false);
    setMessage(`New round: match the target using ${bitLength} bits.`);
  }, [bitLength]);

  function randTarget(nBits) {
    const max = (1 << nBits) - 1;
    return Math.floor(Math.random() * (max + 1));
  }

  function bitsToValue(arr) {
    // arr[0] = LSB
    return arr.reduce((acc, b, i) => acc + (b ? 1 << i : 0), 0);
  }

  function valueToBits(value, nBits) {
    const res = Array(nBits).fill(0);
    for (let i = 0; i < nBits; i++) {
      res[i] = (value >> i) & 1 ? 1 : 0;
    }
    return res;
  }

  const toggleBit = useCallback((i) => {
    setBits((prev) => {
      const next = [...prev];
      next[i] = prev[i] ? 0 : 1;
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setBits(Array(bitLength).fill(0));
    setMessage("Cleared. Try again!");
  }, [bitLength]);

  const handleSubmit = useCallback(() => {
    if (currentValue === target) {
      const delta = 10 + streak * 2; // tiny bonus on streaks
      setScore((s) => s + delta);
      setStreak((s) => s + 1);
      setCelebrate(true);
      setMessage(`Nice! +${delta} points. New target ready.`);
      // fresh round
      const nextTarget = randTarget(bitLength);
      setTarget(nextTarget);
      // optionally pre-seed bits near solution for variety:
      setBits(Array(bitLength).fill(0));
      setShowHint(false);
    } else {
      // Incorrect guess
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          // Game over → soft reset
          setMessage(
            `Out of lives! Final score: ${score}. Press Space to keep playing; new run started.`
          );
          setScore(0);
          setStreak(0);
          setShowHint(false);
          setTarget(randTarget(bitLength));
          setBits(Array(bitLength).fill(0));
          return 3;
        } else {
          setMessage(
            `Not quite (${currentValue} ≠ ${target}). Lives left: ${next}.`
          );
          return next;
        }
      });
      setStreak(0);
    }
  }, [currentValue, target, streak, score, bitLength]);

  // Keyboard controls
  useEffect(() => {
    function onKeyDown(e) {
      if (e.repeat) return;

      // Toggle bit by index: keys 0..7 (0 = LSB)
      if (/^[0-7]$/.test(e.key)) {
        const idx = parseInt(e.key, 10);
        if (idx < bitLength) toggleBit(idx);
      }

      // Submit (Space)
      if (e.code === "Space") {
        e.preventDefault();
        handleSubmit();
      }

      // Hint (H or h)
      if (e.key.toLowerCase() === "h") {
        setShowHint((v) => !v);
      }

      // Clear (C or c)
      if (e.key.toLowerCase() === "c") {
        handleClear();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bitLength, handleClear, handleSubmit, toggleBit]);

  // Small confetti pulse
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (celebrate) {
      const t = setTimeout(() => setCelebrate(false), 800);
      return () => clearTimeout(t);
    }
  }, [celebrate]);

  function handleModeChange(n) {
    if (n === bitLength) return;
    setBitLength(n);
  }

  function nudge(value, dir) {
    // helper to step closer/farther for fun (used by hint)
    const next = Math.min(maxValue, Math.max(0, value + dir));
    setBits(valueToBits(next, bitLength));
  }

  return (
    <div className={`${styles.wrapper} ${celebrate ? styles.celebrate : ""}`}>
      <header className={styles.header}>
        <div className={styles.title}>
          <span className={styles.chip}>TECH</span> Binary Builder
        </div>
        <div className={styles.stats}>
          <span>Score: <strong>{score}</strong></span>
          <span>Streak: <strong>{streak}</strong></span>
          <span>Lives: <strong>{lives}</strong></span>
        </div>
      </header>

      <section className={styles.panel}>
        <div className={styles.row}>
          <div className={styles.block}>
            <div className={styles.label}>Target</div>
            <div className={styles.big}>
              {target} <span className={styles.sub}>/ max {maxValue}</span>
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.label}>Your Value</div>
            <div className={styles.big}>{currentValue}</div>
          </div>
          <div className={styles.block}>
            <div className={styles.label}>Mode</div>
            <div className={styles.modeBtns}>
              {MODES.map((m) => (
                <button
                  key={m}
                  className={`${styles.modeBtn} ${
                    bitLength === m ? styles.active : ""
                  }`}
                  onClick={() => handleModeChange(m)}
                  aria-label={`Set ${m}-bit mode`}
                >
                  {m}-bit
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bitsTray} role="group" aria-label="Bit toggles">
          {/* Most significant bit rendered on the left for visual familiarity */}
          {Array.from({ length: bitLength })
            .map((_, i) => bitLength - 1 - i) // map indexes MSB..LSB
            .map((bitIndexFromLSB) => {
              const on = bits[bitIndexFromLSB] === 1;
              const power = bitIndexFromLSB;
              const value = 1 << power;
              return (
                <button
                  key={bitIndexFromLSB}
                  className={`${styles.bit} ${on ? styles.on : styles.off}`}
                  onClick={() => toggleBit(bitIndexFromLSB)}
                  aria-pressed={on}
                  aria-label={`Toggle bit ${power} (${value})`}
                  title={`Bit ${power} (value ${value}) – press ${power} to toggle`}
                >
                  <span className={styles.bitLamp}>{on ? 1 : 0}</span>
                  <span className={styles.bitMeta}>
                    2<sup>{power}</sup>
                  </span>
                </button>
              );
            })}
        </div>

        <div className={styles.controls}>
          <button className={styles.primary} onClick={handleSubmit}>
            Submit (Space)
          </button>
          <button className={styles.ghost} onClick={() => setShowHint((v) => !v)}>
            {showHint ? "Hide Hint (H)" : "Show Hint (H)"}
          </button>
          <button className={styles.ghost} onClick={handleClear}>
            Clear (C)
          </button>
        </div>

        {showHint && (
          <div className={styles.hint}>
            <div className={styles.hintRow}>
              <span className={styles.hintLabel}>Hint:</span>
              Try to reach <strong>{target}</strong>. You're at{" "}
              <strong>{currentValue}</strong>{" "}
              ({currentValue < target ? "too low" : currentValue > target ? "too high" : "exact"}).
            </div>
            <div className={styles.hintBtns}>
              <button
                className={styles.small}
                onClick={() => nudge(currentValue, +1)}
              >
                +1
              </button>
              <button
                className={styles.small}
                onClick={() => nudge(currentValue, -1)}
              >
                -1
              </button>
              <button
                className={styles.small}
                onClick={() => {
                  // Snap one correct bit toward the target
                  const targetBits = valueToBits(target, bitLength);
                  const next = [...bits];
                  for (let i = 0; i < bitLength; i++) {
                    if (next[i] !== targetBits[i]) {
                      next[i] = targetBits[i];
                      break;
                    }
                  }
                  setBits(next);
                }}
              >
                Snap 1 bit
              </button>
            </div>
          </div>
        )}

        <div className={styles.message} role="status">
          {message}
        </div>
      </section>

      {/* Minimal confetti layer – style in CSS as you like */}
      {celebrate && <div className={styles.confetti} aria-hidden="true" />}
      <footer className={styles.footer}>
        <span>Tip: Press 0–{bitLength - 1} to toggle bits (0 = least significant).</span>
      </footer>
    </div>
  );
}