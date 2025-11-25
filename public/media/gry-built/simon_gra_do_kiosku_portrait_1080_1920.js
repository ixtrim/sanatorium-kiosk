(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("Game", ["exports", "react"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("react"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.React);
    global.Game = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _react) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = SimonKiosk;
  _exports.isPrefixMatch = isPrefixMatch;
  _exports.nextRandomPad = nextRandomPad;
  _react = _interopRequireWildcard(_react);
  function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
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

  function nextRandomPad() {
    return Math.floor(Math.random() * 4);
  }
  function isPrefixMatch(seq, input) {
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== seq[i]) return false;
    }
    return true;
  }

  // ====== Komponent ======
  function SimonKiosk({
    autoResetMs = 3000,
    // overlay po przegranej → reset do intro
    idleTimeoutMs = 60000,
    showMs = 600,
    // czas podświetlenia jednego kroku sekwencji
    gapMs = 300,
    // przerwa między krokami sekwencji
    onExit,
    maxRounds // opcjonalny limit — po osiągnięciu wyświetla „Brawo!”
  }) {
    const [phase, setPhase] = (0, _react.useState)("intro");
    const [sequence, setSequence] = (0, _react.useState)([]);
    const [progress, setProgress] = (0, _react.useState)([]); // dotychczasowy input gracza
    const [activePad, setActivePad] = (0, _react.useState)(null);
    const [round, setRound] = (0, _react.useState)(0);
    const [message, setMessage] = (0, _react.useState)("");
    const idleTimer = (0, _react.useRef)(null);
    const playTimer = (0, _react.useRef)(null);
    const autoResetTimer = (0, _react.useRef)(null);
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
    (0, _react.useEffect)(() => {
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
      events.forEach(e => window.addEventListener(e, poke, {
        passive: true
      }));
      return () => {
        events.forEach(e => window.removeEventListener(e, poke));
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
    (0, _react.useEffect)(() => {
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
    const onPad = p => {
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
        setSequence(prev => [...prev, next]);
        setRound(r => r + 1);
        setPhase("show");
      }
    };

    // Stylowanie padów (duże pola 2×2)
    const padStyle = id => {
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
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "w-screen h-screen min-h-[100dvh] text-white flex flex-col items-center justify-start relative px-6 pt-6 pb-8",
      role: "application",
      "aria-label": "Gra Simon (Powt\xF3rz sekwencj\u0119)"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "w-full max-w-[980px] flex items-center justify-between gap-4 mb-4"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-2xl md:text-3xl font-extrabold drop-shadow"
    }, "Simon \u2014 powt\xF3rz sekwencj\u0119"), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex items-center gap-2"
    }, onExit && /*#__PURE__*/_react.default.createElement("button", {
      className: "px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base",
      onClick: () => {
        resetAll();
        setPhase("intro");
        onExit();
      }
    }, "Zako\u0144cz"), /*#__PURE__*/_react.default.createElement("button", {
      className: "px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base",
      onClick: () => {
        resetAll();
        setPhase("intro");
      }
    }, "Nowa gra"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "w-full max-w-[980px] mb-3 text-lg md:text-xl flex items-center justify-between"
    }, /*#__PURE__*/_react.default.createElement("div", null, "Runda: ", /*#__PURE__*/_react.default.createElement("span", {
      className: "font-bold"
    }, round)), /*#__PURE__*/_react.default.createElement("div", {
      className: "text-white/90"
    }, phase === "show" ? "Patrz uważnie…" : phase === "input" ? "Twoja kolej!" : "")), /*#__PURE__*/_react.default.createElement("div", {
      className: "w-full max-w-[980px] aspect-square grid grid-cols-2 grid-rows-2 gap-4 p-6 select-none"
    }, /*#__PURE__*/_react.default.createElement("button", {
      "aria-label": "zielony",
      className: padStyle(0),
      onClick: () => onPad(0),
      disabled: phase !== "input"
    }), /*#__PURE__*/_react.default.createElement("button", {
      "aria-label": "niebieski",
      className: padStyle(1),
      onClick: () => onPad(1),
      disabled: phase !== "input"
    }), /*#__PURE__*/_react.default.createElement("button", {
      "aria-label": "\u017C\xF3\u0142ty",
      className: padStyle(2),
      onClick: () => onPad(2),
      disabled: phase !== "input"
    }), /*#__PURE__*/_react.default.createElement("button", {
      "aria-label": "czerwony",
      className: padStyle(3),
      onClick: () => onPad(3),
      disabled: phase !== "input"
    })), phase === "intro" && /*#__PURE__*/_react.default.createElement("div", {
      className: "fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-6"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "bg-white text-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-[720px] text-center"
    }, /*#__PURE__*/_react.default.createElement("h2", {
      className: "text-2xl md:text-3xl font-extrabold mb-2"
    }, "Simon \u2014 powt\xF3rz sekwencj\u0119"), /*#__PURE__*/_react.default.createElement("p", {
      className: "text-base md:text-lg text-gray-700 mb-6"
    }, "Zapami\u0119taj kolejno\u015B\u0107 pod\u015Bwietlanych p\xF3l i powt\xF3rz j\u0105 dotykiem. Ka\u017Cda runda jest d\u0142u\u017Csza o 1."), /*#__PURE__*/_react.default.createElement("button", {
      onClick: startGame,
      className: "px-6 py-4 rounded-2xl bg-gray-900 text-white text-lg font-bold"
    }, "Start"), /*#__PURE__*/_react.default.createElement("div", {
      className: "mt-4 text-sm text-gray-600"
    }, "Bez czynno\u015Bci wr\xF3ci do startu po ", Math.floor(idleTimeoutMs / 1000), " s."))), phase === "done" && /*#__PURE__*/_react.default.createElement("div", {
      className: "fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center p-6",
      "aria-live": "polite"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-center text-white"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-4xl md:text-6xl font-extrabold drop-shadow mb-3"
    }, message || "Koniec gry"), /*#__PURE__*/_react.default.createElement("div", {
      className: "text-base md:text-xl text-white/90 mb-4"
    }, "Osi\u0105gni\u0119ta runda: ", round), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex items-center justify-center gap-3"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "px-6 py-4 rounded-2xl bg-white text-gray-900 text-lg font-bold",
      onClick: startGame
    }, "Zagraj ponownie"), /*#__PURE__*/_react.default.createElement("button", {
      className: "px-6 py-4 rounded-2xl border-2 border-white/80 text-lg font-semibold",
      onClick: () => {
        resetAll();
        setPhase("intro");
      }
    }, "Nowa gra")))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mt-6 text-sm text-white/85 text-center"
    }, "T\u0142o ustawia host (zielone). UI transparentne."));
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
    console.assert(isPrefixMatch([0, 1, 2], [0]) === true, "Prefix 1/3 true");
    console.assert(isPrefixMatch([0, 1, 2], [0, 1]) === true, "Prefix 2/3 true");
    console.assert(isPrefixMatch([0, 1, 2], [0, 2]) === false, "Prefix mismatch false");
    console.log("Simon tests passed ✔");
  }
});