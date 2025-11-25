import React, { useEffect, useRef, useState } from "react";

/**
 * Simon — „Powtórz sekwencję” dla infokiosku (portrait 1080×1920)
 *
 * Zasady: gra pokazuje sekwencję podświetlanych pól (4 kolory). Gracz powtarza dotykiem.
 * Po poprawnej rundzie sekwencja wydłuża się o 1. Błąd kończy grę.
 *
 * Cechy kioskowe: duże pola, wysoki kontrast, brak dźwięków, overlay wyniku, auto–reset 3 s,
 * watchdog bezczynności 60 s, transparentne tło (zielone tło ustawiasz poza komponentem).
 */

// ====== Czyste funkcje (łatwe do testowania) ======
export type PadId = 0 | 1 | 2 | 3;

export function nextRandomPad(): PadId {
  return Math.floor(Math.random() * 4) as PadId;
}

export function isPrefixMatch(seq: PadId[], input: PadId[]): boolean {
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== seq[i]) return false;
  }
  return true;
}

// ====== Komponent ======
export default function SimonKiosk({
  autoResetMs = 3000, // overlay po przegranej → reset do intro
  idleTimeoutMs = 60000,
  showMs = 600, // czas podświetlenia jednego kroku sekwencji
  gapMs = 300, // przerwa między krokami sekwencji
  onExit,
  maxRounds, // opcjonalny limit — po osiągnięciu wyświetla „Brawo!”
}: {
  autoResetMs?: number;
  idleTimeoutMs?: number;
  showMs?: number;
  gapMs?: number;
  onExit?: () => void;
  maxRounds?: number;
}) {
  type Phase = "intro" | "show" | "input" | "done";
  const [phase, setPhase] = useState<Phase>("intro");
  const [sequence, setSequence] = useState<PadId[]>([]);
  const [progress, setProgress] = useState<PadId[]>([]); // dotychczasowy input gracza
  const [activePad, setActivePad] = useState<PadId | null>(null);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState<string>("");

  const idleTimer = useRef<number | null>(null);
  const playTimer = useRef<number | null>(null);
  const autoResetTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    if (playTimer.current) window.clearTimeout(playTimer.current);
    if (autoResetTimer.current) window.clearTimeout(autoResetTimer.current);
    idleTimer.current = playTimer.current = autoResetTimer.current = null;
  };

  const resetAll = () => {
    clearTimers();
    setSequence([]);
    setProgress([]);
    setActivePad(null);
    setRound(0);
    setMessage("");
  };

  // Watchdog bezczynności
  useEffect(() => {
    const poke = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
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
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [idleTimeoutMs, onExit]);

  const startGame = () => {
    resetAll();
    const first = nextRandomPad();
    setSequence([first]);
    setRound(1);
    setPhase("show");
  };

  // Odtwarzanie sekwencji (SHOW)
  useEffect(() => {
    if (phase !== "show") return;
    setProgress([]);

    let i = 0;
    const playStep = () => {
      // jeśli koniec sekwencji → przejdź do inputu
      if (i >= sequence.length) {
        setActivePad(null);
        setPhase("input");
        return;
      }
      setActivePad(sequence[i]);
      playTimer.current = window.setTimeout(() => {
        setActivePad(null);
        playTimer.current = window.setTimeout(() => {
          i++;
          playStep();
        }, gapMs);
      }, showMs);
    };

    playStep();

    return () => {
      if (playTimer.current) window.clearTimeout(playTimer.current);
      playTimer.current = null;
    };
  }, [phase, sequence, showMs, gapMs]);

  // Obsługa dotknięcia pada przez gracza
  const onPad = (p: PadId) => {
    if (phase !== "input") return;
    const newProgress = [...progress, p];
    setProgress(newProgress);

    // natychmiastowe podświetlenie feedback
    setActivePad(p);
    window.setTimeout(() => setActivePad(null), Math.max(150, showMs * 0.5));

    // walidacja prefiksu
    if (!isPrefixMatch(sequence, newProgress)) {
      setMessage("Pomyłka! Spróbuj ponownie.");
      setPhase("done");
      autoResetTimer.current = window.setTimeout(() => {
        resetAll();
        setPhase("intro");
      }, autoResetMs);
      return;
    }

    // jeśli trafiono całą sekwencję
    if (newProgress.length === sequence.length) {
      // warunek zwycięstwa przy limicie rund
      if (typeof maxRounds === "number" && round >= maxRounds) {
        setMessage("Brawo! Maksymalna runda osiągnięta.");
        setPhase("done");
        autoResetTimer.current = window.setTimeout(() => {
          resetAll();
          setPhase("intro");
        }, autoResetMs);
        return;
      }
      // generuj kolejny krok i odtwarzaj
      const next = nextRandomPad();
      setSequence((prev) => [...prev, next]);
      setRound((r) => r + 1);
      setPhase("show");
    }
  };

  // Stylowanie padów (duże pola 2×2)
  const padStyle = (id: PadId): string => {
    const base = "rounded-3xl w-full h-full transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/80";
    const glow = activePad === id ? " brightness-125 scale-[1.02]" : "";
    switch (id) {
      case 0:
        return base + " bg-emerald-500" + glow;
      case 1:
        return base + " bg-sky-500" + glow;
      case 2:
        return base + " bg-amber-500" + glow;
      case 3:
        return base + " bg-rose-500" + glow;
    }
  };

  return (
    <div className="w-screen h-screen min-h-[100dvh] text-white flex flex-col items-center justify-start relative px-6 pt-6 pb-8" role="application" aria-label="Gra Simon (Powtórz sekwencję)">
      {/* Pasek nagłówka */}
      <div className="w-full max-w-[980px] flex items-center justify-between gap-4 mb-4">
        <div className="text-2xl md:text-3xl font-extrabold drop-shadow">Simon — powtórz sekwencję</div>
        <div className="flex items-center gap-2">
          {onExit && (
            <button className="px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base" onClick={() => { resetAll(); setPhase("intro"); onExit(); }}>Zakończ</button>
          )}
          <button className="px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base" onClick={() => { resetAll(); setPhase("intro"); }}>Nowa gra</button>
        </div>
      </div>

      {/* Status */}
      <div className="w-full max-w-[980px] mb-3 text-lg md:text-xl flex items-center justify-between">
        <div>Runda: <span className="font-bold">{round}</span></div>
        <div className="text-white/90">{phase === "show" ? "Patrz uważnie…" : phase === "input" ? "Twoja kolej!" : ""}</div>
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
            <p className="text-base md:text-lg text-gray-700 mb-6">Zapamiętaj kolejność podświetlanych pól i powtórz ją dotykiem. Każda runda jest dłuższa o 1.</p>
            <button onClick={startGame} className="px-6 py-4 rounded-2xl bg-gray-900 text-white text-lg font-bold">Start</button>
            <div className="mt-4 text-sm text-gray-600">Bez czynności wróci do startu po {Math.floor(idleTimeoutMs/1000)} s.</div>
          </div>
        </div>
      )}

      {/* Overlay wyniku */}
      {phase === "done" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center p-6" aria-live="polite">
          <div className="text-center text-white">
            <div className="text-4xl md:text-6xl font-extrabold drop-shadow mb-3">{message || "Koniec gry"}</div>
            <div className="text-base md:text-xl text-white/90 mb-4">Osiągnięta runda: {round}</div>
            <div className="flex items-center justify-center gap-3">
              <button className="px-6 py-4 rounded-2xl bg-white text-gray-900 text-lg font-bold" onClick={startGame}>Zagraj ponownie</button>
              <button className="px-6 py-4 rounded-2xl border-2 border-white/80 text-lg font-semibold" onClick={() => { resetAll(); setPhase("intro"); }}>Nowa gra</button>
          </div>
          </div>
        </div>
      )}

      {/* Stopka */}
      <div className="mt-6 text-sm text-white/85 text-center">Tło ustawia host (zielone). UI transparentne.</div>
    </div>
  );
}

// ====== Testy lekkie (konsola) ======
const RUN_SIMON_TESTS = false; // ustaw true podczas dev
if (RUN_SIMON_TESTS) {
  // nextRandomPad w zakresie
  for (let i = 0; i < 50; i++) {
    const p = nextRandomPad();
    console.assert(p >= 0 && p <= 3, "Pad out of range");
  }
  // isPrefixMatch
  console.assert(isPrefixMatch([0,1,2], [0]) === true, "Prefix 1/3 true");
  console.assert(isPrefixMatch([0,1,2], [0,1]) === true, "Prefix 2/3 true");
  console.assert(isPrefixMatch([0,1,2], [0,2]) === false, "Prefix mismatch false");
  console.log("Simon tests passed ✔");
}
