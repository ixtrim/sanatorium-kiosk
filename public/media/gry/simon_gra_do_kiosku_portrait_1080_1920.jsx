import React, { useEffect, useRef, useState } from "react";

/**
 * Simon — „Powtórz sekwencję” dla infokiosku (portrait 1080×1920)
 * z odliczaniem 3 → 2 → 1 po naciśnięciu START.
 */

// ====== Czyste funkcje (łatwe do testowania) ======
export function nextRandomPad() {
  return Math.floor(Math.random() * 4);
}

export function isPrefixMatch(seq, input) {
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== seq[i]) return false;
  }
  return true;
}

// ====== Komponent główny ======
export default function SimonKiosk({
  autoResetMs = 3000,
  idleTimeoutMs = 60000,
  showMs = 600,
  gapMs = 300,
  onExit,
  maxRounds,
}) {
  const [phase, setPhase] = useState("intro");
  const [countdown, setCountdown] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [progress, setProgress] = useState([]);
  const [activePad, setActivePad] = useState(null);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState("");

  const idleTimer = useRef(null);
  const playTimer = useRef(null);
  const autoResetTimer = useRef(null);

  const clearTimers = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (playTimer.current) clearTimeout(playTimer.current);
    if (autoResetTimer.current) clearTimeout(autoResetTimer.current);
    idleTimer.current = playTimer.current = autoResetTimer.current = null;
  };

  const resetAll = () => {
    clearTimers();
    setSequence([]);
    setProgress([]);
    setActivePad(null);
    setRound(0);
    setMessage("");
    setCountdown(null);
  };

  // Watchdog bezczynności
  useEffect(() => {
    const poke = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        resetAll();
        setPhase("intro");
        if (onExit) onExit();
      }, idleTimeoutMs);
    };
    poke();
    const events = ["pointerdown", "pointerup", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, poke, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, poke));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [idleTimeoutMs, onExit]);

  // Logika odliczania 3 → 2 → 1
  useEffect(() => {
    if (phase !== "countdown" || countdown === null) return;

    if (countdown === 0) {
      const first = nextRandomPad();
      setSequence([first]);
      setRound(1);
      setPhase("show");
      return;
    }

    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const startGame = () => {
    resetAll();
    setCountdown(3);
    setPhase("countdown");
  };

  // Odtwarzanie sekwencji (SHOW)
  useEffect(() => {
    if (phase !== "show") return;
    setProgress([]);

    let i = 0;
    const playStep = () => {
      if (i >= sequence.length) {
        setActivePad(null);
        setPhase("input");
        return;
      }
      setActivePad(sequence[i]);
      playTimer.current = setTimeout(() => {
        setActivePad(null);
        playTimer.current = setTimeout(() => {
          i++;
          playStep();
        }, gapMs);
      }, showMs);
    };

    playStep();

    return () => {
      if (playTimer.current) clearTimeout(playTimer.current);
      playTimer.current = null;
    };
  }, [phase, sequence, showMs, gapMs]);

  // Obsługa tapnięcia w pad
  const onPad = (p) => {
    if (phase !== "input") return;
    const newProgress = [...progress, p];
    setProgress(newProgress);

    setActivePad(p);
    setTimeout(() => setActivePad(null), Math.max(150, showMs * 0.5));

    if (!isPrefixMatch(sequence, newProgress)) {
      setMessage("Pomyłka! Spróbuj ponownie.");
      setPhase("done");
      autoResetTimer.current = setTimeout(() => {
        resetAll();
        setPhase("intro");
      }, autoResetMs);
      return;
    }

    if (newProgress.length === sequence.length) {
      if (typeof maxRounds === "number" && round >= maxRounds) {
        setMessage("Brawo! Maksymalna runda osiągnięta.");
        setPhase("done");
        autoResetTimer.current = setTimeout(() => {
          resetAll();
          setPhase("intro");
        }, autoResetMs);
        return;
      }
      const next = nextRandomPad();
      setSequence((prev) => [...prev, next]);
      setRound((r) => r + 1);
      setPhase("show");
    }
  };

  // Stylowanie padów (duże pola 2×2)
  const padStyle = (id) => {
    const base =
      "rounded-3xl w-full h-full transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/80";
    const glow = activePad === id ? " brightness-125 scale-[1.02]" : "";
    const color =
      id === 0
        ? " bg-emerald-500"
        : id === 1
        ? " bg-sky-500"
        : id === 2
        ? " bg-amber-500"
        : " bg-rose-500";
    return base + color + glow;
  };

  return (
    <div
      className="w-screen h-screen min-h-[100dvh] text-white flex flex-col items-center justify-start relative px-6 pt-6 pb-8"
      role="application"
      aria-label="Gra Simon (Powtórz sekwencję)"
    >
      {/* Pasek nagłówka */}
      <div className="w-full max-w-[980px] flex items-center justify-between gap-4 mb-4">
        <div className="text-2xl md:text-3xl font-extrabold drop-shadow">
          Simon — powtórz sekwencję
        </div>
        <div className="flex items-center gap-2">
          {onExit && (
            <button
              className="px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base"
              onClick={() => {
                resetAll();
                setPhase("intro");
                onExit();
              }}
            >
              Zakończ
            </button>
          )}
          <button
            className="px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base"
            onClick={() => {
              resetAll();
              setPhase("intro");
            }}
          >
            Nowa gra
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="w-full max-w-[980px] mb-3 text-lg md:text-xl flex items-center justify-between">
        <div>
          Runda: <span className="font-bold">{round}</span>
        </div>
        <div className="text-white/90">
          {phase === "show"
            ? "Patrz uważnie…"
            : phase === "input"
            ? "Twoja kolej!"
            : ""}
        </div>
      </div>

      {/* Plansza 2×2 */}
      <div className="w-full max-w-[980px] aspect-square grid grid-cols-2 grid-rows-2 gap-4 p-6 select-none">
        <button aria-label="zielony" className={padStyle(0)} onClick={() => onPad(0)} disabled={phase !== "input"} />
        <button aria-label="niebieski" className={padStyle(1)} onClick={() => onPad(1)} disabled={phase !== "input"} />
        <button aria-label="żółty" className={padStyle(2)} onClick={() => onPad(2)} disabled={phase !== "input"} />
        <button aria-label="czerwony" className={padStyle(3)} onClick={() => onPad(3)} disabled={phase !== "input"} />
      </div>

      {/* Ekran startowy */}
      {phase === "intro" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-6">
          <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-[720px] text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Simon — powtórz sekwencję</h2>
            <p className="text-base md:text-lg text-gray-700 mb-6">
              Zapamiętaj kolejność podświetlanych pól i powtórz ją dotykiem. Każda runda jest dłuższa o 1.
            </p>
            <button onClick={startGame} className="px-6 py-4 rounded-2xl bg-gray-900 text-white text-lg font-bold">
              Start
            </button>
            <div className="mt-4 text-sm text-gray-600">
              Bez czynności wróci do startu po {Math.floor(idleTimeoutMs / 1000)} s.
            </div>
          </div>
        </div>
      )}

      {/* Odliczanie */}
      {phase === "countdown" && countdown !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center p-6">
          <div className="text-white text-7xl md:text-8xl font-extrabold drop-shadow animate-pulse">{countdown}</div>
        </div>
      )}

      {/* Overlay wyniku */}
      {phase === "done" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center p-6" aria-live="polite">
          <div className="text-center text-white">
            <div className="text-4xl md:text-6xl font-extrabold drop-shadow mb-3">{message || "Koniec gry"}</div>
            <div className="text-base md:text-xl text-white/90 mb-4">Osiągnięta runda: {round}</div>
            <div className="flex items-center justify-center gap-3">
              <button className="px-6 py-4 rounded-2xl bg-white text-gray-900 text-lg font-bold" onClick={startGame}>
                Zagraj ponownie
              </button>
              <button
                className="px-6 py-4 rounded-2xl border-2 border-white/80 text-lg font-semibold"
                onClick={() => {
                  resetAll();
                  setPhase("intro");
                }}
              >
                Nowa gra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stopka */}
      <div className="mt-6 text-sm text-white/85 text-center">Tło ustawia host (zielone). UI jest transparentne.</div>
    </div>
  );
}