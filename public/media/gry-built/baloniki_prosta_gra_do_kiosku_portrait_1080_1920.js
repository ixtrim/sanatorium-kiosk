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
  _exports.default = BalloonPop;
  _react = _interopRequireWildcard(_react);
  function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
  /**
   * Baloniki — prosta gra dotykowa do infokiosku (portrait 1080×1920)
   *
   * Zasady: przez 30 sekund stukaj w jak najwięcej baloników. Każde trafienie = +1 pkt.
   * UI: duże elementy, tryb pełnoekranowy, wysoki kontrast. Tło pozostaje po stronie hosta (zielone) — komponent ma tło transparentne.
   * Dostępność: brak dźwięków, duże hit-targety, focus ring, aria-live na wynikach.
   *
   * Propsy:
   * - durationMs: długość rundy (default 30000)
   * - spawnEveryMs: odstęp między spawnem balonów (default 700)
   * - maxBalloons: „sufit” liczby jednocześnie widocznych balonów (default 10)
   * - idleTimeoutMs: watchdog bezczynności do powrotu (default 60000)
   * - onExit: (opcjonalne) callback np. do powrotu na HOME
   */
  function BalloonPop({
    durationMs = 30000,
    spawnEveryMs = 700,
    maxBalloons = 10,
    idleTimeoutMs = 60000,
    onExit
  }) {
    const [phase, setPhase] = (0, _react.useState)("intro");
    const [score, setScore] = (0, _react.useState)(0);
    const [leftMs, setLeftMs] = (0, _react.useState)(durationMs);
    const [balloons, setBalloons] = (0, _react.useState)([]);
    const [lastId, setLastId] = (0, _react.useState)(0);
    const areaRef = (0, _react.useRef)(null);
    const tickTimer = (0, _react.useRef)(null);
    const spawnTimer = (0, _react.useRef)(null);
    const idleTimer = (0, _react.useRef)(null);
    const COLORS = (0, _react.useMemo)(() => ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"], []);

    // Helpers — reset i zegary
    const clearAllTimers = () => {
      if (tickTimer.current) window.clearInterval(tickTimer.current);
      if (spawnTimer.current) window.clearInterval(spawnTimer.current);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      tickTimer.current = null;
      spawnTimer.current = null;
      idleTimer.current = null;
    };
    const hardReset = () => {
      clearAllTimers();
      setScore(0);
      setLeftMs(durationMs);
      setBalloons([]);
      setLastId(0);
      setPhase("intro");
      if (onExit) onExit();
    };
    const resetToIntro = () => {
      clearAllTimers();
      setScore(0);
      setLeftMs(durationMs);
      setBalloons([]);
      setLastId(0);
      setPhase("intro");
    };

    // Idle watchdog (global input resets timer)
    (0, _react.useEffect)(() => {
      const poke = () => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => {
          resetToIntro();
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
    }, [idleTimeoutMs]);

    // Start gry
    const start = () => {
      setScore(0);
      setLeftMs(durationMs);
      setBalloons([]);
      setLastId(0);
      setPhase("play");
    };

    // Spawn balonów
    (0, _react.useEffect)(() => {
      if (phase !== "play") return;
      // spawn co spawnEveryMs
      spawnTimer.current = window.setInterval(() => {
        setBalloons(prev => {
          if (prev.length >= maxBalloons) return prev;
          const id = lastId + 1;
          setLastId(id);
          // Losowa pozycja X, rozmiar i prędkość
          const size = 80 + Math.random() * 80; // 80–160 px
          const x = 8 + Math.random() * 84; // unikamy krawędzi (8% marginesu)
          const speed = 60 + Math.random() * 90; // px/s
          const color = COLORS[Math.floor(Math.random() * COLORS.length)];
          const b = {
            id,
            x,
            y: 100 + size / 2,
            size,
            speed,
            color
          };
          return [...prev, b];
        });
      }, spawnEveryMs);
      return () => {
        if (spawnTimer.current) window.clearInterval(spawnTimer.current);
        spawnTimer.current = null;
      };
    }, [phase, spawnEveryMs, maxBalloons, COLORS, lastId]);

    // Ruch i czas gry
    (0, _react.useEffect)(() => {
      if (phase !== "play") return;
      const step = 1000 / 60; // 60 FPS
      const accel = 0; // można podkręcić trudność

      tickTimer.current = window.setInterval(() => {
        setLeftMs(ms => ms > 0 ? ms - step : 0);
        setBalloons(prev => prev.map(b => ({
          ...b,
          y: b.y - b.speed * step / 1000 - accel
        })).filter(b => b.y + b.size / 2 > -20) // usuń po wyjściu górą
        );
      }, step);
      return () => {
        if (tickTimer.current) window.clearInterval(tickTimer.current);
        tickTimer.current = null;
      };
    }, [phase]);

    // Koniec gry
    (0, _react.useEffect)(() => {
      if (phase === "play" && leftMs <= 0) {
        setPhase("done");
        clearAllTimers();
      }
    }, [phase, leftMs]);
    const onPop = id => {
      if (phase !== "play") return;
      setBalloons(prev => prev.filter(b => b.id !== id));
      setScore(s => s + 1);
    };

    // Render balonów
    const renderBalloons = () => /*#__PURE__*/_react.default.createElement("div", {
      className: "absolute inset-0",
      "aria-hidden": true
    }, balloons.map(b => /*#__PURE__*/_react.default.createElement("button", {
      key: b.id,
      onClick: () => onPop(b.id),
      "aria-label": "balon",
      className: "absolute rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-white/70 active:scale-95 transition-transform",
      style: {
        left: `calc(${b.x}% - ${b.size / 2}px)`,
        top: `calc(${b.y}% - ${b.size / 2}px)`,
        width: b.size,
        height: b.size,
        background: b.color,
        border: "2px solid rgba(255,255,255,0.7)"
      }
    })));
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "w-screen h-screen min-h-[100dvh] text-white relative overflow-hidden",
      role: "application",
      "aria-label": "Gra Baloniki"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "absolute top-0 left-0 right-0 p-4 flex items-center justify-between max-w-[980px] mx-auto"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-2xl md:text-3xl font-extrabold drop-shadow"
    }, "Baloniki"), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex items-center gap-2"
    }, onExit && /*#__PURE__*/_react.default.createElement("button", {
      className: "px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base",
      onClick: hardReset
    }, "Zako\u0144cz"), /*#__PURE__*/_react.default.createElement("button", {
      className: "px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base",
      onClick: resetToIntro
    }, "Nowa gra"))), phase === "play" && /*#__PURE__*/_react.default.createElement("div", {
      className: "absolute top-16 left-0 right-0 max-w-[980px] mx-auto px-4 flex items-center justify-between text-lg md:text-xl"
    }, /*#__PURE__*/_react.default.createElement("div", null, "Wynik: ", /*#__PURE__*/_react.default.createElement("span", {
      className: "font-bold"
    }, score)), /*#__PURE__*/_react.default.createElement("div", null, "Pozosta\u0142o: ", /*#__PURE__*/_react.default.createElement("span", {
      className: "font-bold"
    }, Math.ceil(leftMs / 1000), " s"))), /*#__PURE__*/_react.default.createElement("div", {
      ref: areaRef,
      className: "w-full h-full"
    }, phase === "play" && renderBalloons()), phase === "intro" && /*#__PURE__*/_react.default.createElement("div", {
      className: "absolute inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-6"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "bg-white text-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-[720px] text-center"
    }, /*#__PURE__*/_react.default.createElement("h2", {
      className: "text-2xl md:text-3xl font-extrabold mb-2"
    }, "Baloniki"), /*#__PURE__*/_react.default.createElement("p", {
      className: "text-base md:text-lg text-gray-700 mb-6"
    }, "Stuknij w jak najwi\u0119cej balon\xF3w w 30 sekund."), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex flex-col md:flex-row items-center justify-center gap-3"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: start,
      className: "px-6 py-4 rounded-2xl bg-gray-900 text-white text-lg font-bold"
    }, "Start")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mt-6 text-sm text-gray-600"
    }, "Gra zresetuje si\u0119 po bezczynno\u015Bci (", Math.floor(idleTimeoutMs / 1000), " s)."))), phase === "done" && /*#__PURE__*/_react.default.createElement("div", {
      className: "absolute inset-0 bg-black/70 backdrop-blur-sm grid place-items-center p-6",
      "aria-live": "polite"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-center text-white"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-4xl md:text-6xl font-extrabold drop-shadow mb-4"
    }, "Wynik: ", score), /*#__PURE__*/_react.default.createElement("div", {
      className: "text-base md:text-xl text-white/90 mb-4"
    }, "\u015Awietna robota!"), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex items-center justify-center gap-3"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "px-6 py-4 rounded-2xl bg-white text-gray-900 text-lg font-bold",
      onClick: start
    }, "Zagraj ponownie"), /*#__PURE__*/_react.default.createElement("button", {
      className: "px-6 py-4 rounded-2xl border-2 border-white/80 text-lg font-semibold",
      onClick: resetToIntro
    }, "Nowa gra")))), /*#__PURE__*/_react.default.createElement("div", {
      className: "absolute bottom-3 left-0 right-0 text-center text-sm text-white/85"
    }, "T\u0142o ustawia host (zielone). Elementy gry s\u0105 transparentne."));
  }
});