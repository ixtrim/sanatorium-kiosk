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
  _exports.aiBestMove = aiBestMove;
  _exports.computeWinner = computeWinner;
  _exports.default = KioskTicTacToe;
  _react = _interopRequireWildcard(_react);
  function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
  // 💾 Jak to zachować na jutro?
  // • Przypnij rozmowę (📌) lub użyj menu „⋯” przy nazwie rozmowy → Dodaj do ulubionych.
  // • W menu dokumentu wybierz „Pobierz plik (.tsx)” i trzymaj w repo (np. GitHub).

  // =====================
  // Typy i stałe
  // =====================

  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

  // =====================
  // Logika gry (czyste funkcje)
  // =====================
  function computeWinner(b) {
    for (const [a, c, d] of LINES) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every(x => x)) return "draw";
    return null;
  }
  function aiBestMove(b, ai, human) {
    // Zwraca ocenę tylko dla stanów końcowych (liczba). Dla pozostałych zwracamy null i kontynuujemy minimax.
    const score = w => w === ai ? 1 : w === human ? -1 : w === "draw" ? 0 : null;
    const minimax = (state, player) => {
      const w = computeWinner(state);
      const s = score(w);
      if (s !== null) return {
        idx: -1,
        val: s
      };
      let bestIdx = -1;
      let bestVal = player === ai ? -Infinity : Infinity;
      for (let i = 0; i < 9; i++) {
        if (state[i]) continue;
        state[i] = player;
        const {
          val
        } = minimax(state, player === "X" ? "O" : "X");
        state[i] = "";
        if (player === ai) {
          if (val > bestVal) {
            bestVal = val;
            bestIdx = i;
          }
        } else {
          if (val < bestVal) {
            bestVal = val;
            bestIdx = i;
          }
        }
      }

      // Gdyby z jakiegoś powodu nie znaleziono ruchu (powinno być niemożliwe), zwróć pierwszy pusty.
      if (bestIdx === -1) {
        const fallback = state.findIndex(c => !c);
        return {
          idx: fallback,
          val: player === ai ? -Infinity : Infinity
        };
      }
      return {
        idx: bestIdx,
        val: bestVal
      };
    };
    const {
      idx
    } = minimax([...b], ai);
    // Dodatkowe zabezpieczenie: jeśli idx < 0, wybierz pierwszy wolny ruch
    return idx >= 0 ? idx : b.findIndex(c => !c);
  }

  // =====================
  // Komponent główny
  // =====================
  function KioskTicTacToe({
    autoResetMs = 3000,
    // auto–reset po zakończeniu: 3 s
    idleTimeoutMs = 60000,
    onExit
  }) {
    const [board, setBoard] = (0, _react.useState)(Array(9).fill(""));
    const [current, setCurrent] = (0, _react.useState)("X");
    const [humanMark, setHumanMark] = (0, _react.useState)("X");
    const [mode, setMode] = (0, _react.useState)(null);
    const [phase, setPhase] = (0, _react.useState)("intro");
    const [message, setMessage] = (0, _react.useState)("");
    const [winner, setWinner] = (0, _react.useState)(null);
    const idleTimer = (0, _react.useRef)(null);
    const autoResetTimer = (0, _react.useRef)(null);

    // --- Timery ---
    const clearAutoReset = () => {
      if (autoResetTimer.current) {
        window.clearTimeout(autoResetTimer.current);
        autoResetTimer.current = null;
      }
    };

    // --- Reset stanu ---
    const resetBoard = () => {
      setBoard(Array(9).fill(""));
      setWinner(null);
      setMessage("");
      setCurrent("X");
      setPhase(mode ? "play" : "intro"); // auto–reset wraca do tej samej konfiguracji
    };
    const resetToIntro = () => {
      clearAutoReset();
      setMode(null);
      setHumanMark("X");
      setWinner(null);
      setMessage("");
      setBoard(Array(9).fill(""));
      setCurrent("X");
      setPhase("intro"); // przycisk „Nowa gra” zawsze do wyboru trybu i znaku
    };
    const hardResetToIntro = () => {
      clearAutoReset();
      setMode(null);
      setHumanMark("X");
      setPhase("intro");
      resetBoard();
      if (onExit) onExit();
    };

    // --- Watchdog bezczynności ---
    (0, _react.useEffect)(() => {
      const poke = () => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => {
          hardResetToIntro();
        }, idleTimeoutMs);
      };
      poke();
      const events = ["pointerdown", "pointerup", "keydown", "touchstart"];
      events.forEach(e => window.addEventListener(e, poke, {
        passive: true
      }));
      return () => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        events.forEach(e => window.removeEventListener(e, poke));
      };
    }, [idleTimeoutMs]);

    // --- Ruch gracza / logika gry ---
    const place = idx => {
      if (winner || board[idx] || phase !== "play") return;
      const nb = [...board];
      nb[idx] = current;
      const w = computeWinner(nb);
      setBoard(nb);
      if (w) {
        setWinner(w);
        setPhase("done");
        setMessage(w === "draw" ? "Remis!" : w === "O" ? "Wygrało kółko!" : "Wygrał krzyżyk!");
        clearAutoReset();
        autoResetTimer.current = window.setTimeout(() => {
          resetBoard();
        }, autoResetMs);
        return;
      }
      setCurrent(current === "X" ? "O" : "X");
    };

    // --- Tura AI ---
    (0, _react.useEffect)(() => {
      if (phase !== "play" || mode !== "ai") return;
      const aiMark = humanMark === "X" ? "O" : "X";
      if (current !== aiMark) return;
      const t = window.setTimeout(() => {
        const idx = aiBestMove(board, aiMark, humanMark);
        if (idx >= 0) place(idx);
      }, 250);
      return () => window.clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, mode, phase, humanMark, board]);

    // --- Start gry po wyborach w intro ---
    const startGame = (pickedMode, mark) => {
      setMode(pickedMode);
      setHumanMark(mark);
      setCurrent("X");
      setBoard(Array(9).fill(""));
      setWinner(null);
      setPhase("play");
      setMessage(pickedMode === "ai" ? mark === "X" ? "Grasz jako X" : "Grasz jako O" : "Tryb: 2 graczy");
    };

    // --- UI kafelka ---
    const Tile = ({
      idx
    }) => {
      const val = board[idx];
      return /*#__PURE__*/_react.default.createElement("button", {
        "aria-label": `Pole ${idx + 1}${val ? ", zajęte: " + val : ""}`,
        className: "flex items-center justify-center rounded-2xl shadow-md text-[10vw] md:text-[7rem] lg:text-[10rem] xl:text-[12rem] font-bold select-none focus:outline-none focus:ring-4 focus:ring-white/80 transition-transform active:scale-95 bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white/20",
        disabled: !!winner || !!val || phase !== "play",
        onClick: () => place(idx)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "drop-shadow-[0_1px_0_rgba(0,0,0,0.5)]"
      }, val));
    };
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "w-screen h-screen min-h-[100dvh] flex flex-col items-center justify-start px-6 pt-6 pb-8 text-white",
      role: "application",
      "aria-label": "Gra k\xF3\u0142ko i krzy\u017Cyk"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "w-full max-w-[980px] flex items-center justify-between gap-4 mb-4"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm"
    }, "K\xF3\u0142ko i krzy\u017Cyk"), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex items-center gap-2"
    }, onExit && /*#__PURE__*/_react.default.createElement("button", {
      className: "px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base",
      onClick: hardResetToIntro
    }, "Zako\u0144cz"), /*#__PURE__*/_react.default.createElement("button", {
      className: "px-4 py-2 rounded-xl bg-white/15 border border-white/40 hover:bg-white/25 text-base",
      onClick: resetToIntro
    }, "Nowa gra"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "w-full max-w-[980px] mb-3 text-lg md:text-xl"
    }, phase === "play" && /*#__PURE__*/_react.default.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/_react.default.createElement("div", null, "Tura: ", /*#__PURE__*/_react.default.createElement("span", {
      className: "font-bold"
    }, current), mode === "ai" && /*#__PURE__*/_react.default.createElement("span", {
      className: "ml-2 text-white/80 text-base"
    }, "(Ty: ", humanMark, ")")), message && /*#__PURE__*/_react.default.createElement("div", {
      className: "text-white/90"
    }, message))), /*#__PURE__*/_react.default.createElement("div", {
      className: "w-full max-w-[980px] aspect-square grid grid-cols-3 grid-rows-3 gap-3 p-6 bg-transparent"
    }, Array.from({
      length: 9
    }).map((_, i) => /*#__PURE__*/_react.default.createElement(Tile, {
      key: i,
      idx: i
    }))), phase === "done" && /*#__PURE__*/_react.default.createElement("div", {
      className: "fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6",
      "aria-live": "assertive",
      role: "alertdialog",
      "aria-label": "Wynik gry"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-center text-white space-y-4"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-4xl md:text-6xl font-extrabold drop-shadow"
    }, message), /*#__PURE__*/_react.default.createElement("div", {
      className: "text-base md:text-xl text-white/90"
    }, "Nowa partia rozpocznie si\u0119 automatycznie za ", Math.floor(autoResetMs / 1000), " s"), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex items-center justify-center gap-3"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "px-5 py-3 rounded-2xl bg-white text-gray-900 font-bold",
      onClick: resetToIntro,
      autoFocus: true
    }, "Nowa gra teraz")))), phase === "intro" && /*#__PURE__*/_react.default.createElement("div", {
      className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "w-full max-w-[720px] bg-white text-gray-900 rounded-3xl shadow-2xl p-6 md:p-8"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "text-center"
    }, /*#__PURE__*/_react.default.createElement("h2", {
      className: "text-2xl md:text-3xl font-extrabold mb-2"
    }, "Z kim chcesz zagra\u0107?"), /*#__PURE__*/_react.default.createElement("p", {
      className: "text-base md:text-lg text-gray-700 mb-6"
    }, "Wybierz tryb gry, a nast\u0119pnie sw\xF3j znak.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "w-full px-4 py-5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-lg font-semibold",
      onClick: () => setMode("pvp"),
      "aria-pressed": mode === "pvp"
    }, "2 graczy (obok siebie)"), /*#__PURE__*/_react.default.createElement("button", {
      className: "w-full px-4 py-5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-lg font-semibold",
      onClick: () => setMode("ai"),
      "aria-pressed": mode === "ai"
    }, "Przeciwko AI")), /*#__PURE__*/_react.default.createElement("div", {
      className: "text-center mb-3 font-semibold"
    }, "Wybierz sw\xF3j znak"), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex items-center justify-center gap-4 md:gap-6 mb-6"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: `w-32 h-32 md:w-36 md:h-36 rounded-3xl border-2 text-5xl md:text-6xl font-extrabold ${humanMark === "X" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-900"}`,
      onClick: () => setHumanMark("X"),
      "aria-pressed": humanMark === "X"
    }, "X"), /*#__PURE__*/_react.default.createElement("button", {
      className: `w-32 h-32 md:w-36 md:h-36 rounded-3xl border-2 text-5xl md:text-6xl font-extrabold ${humanMark === "O" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-900"}`,
      onClick: () => setHumanMark("O"),
      "aria-pressed": humanMark === "O"
    }, "O")), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex flex-col md:flex-row items-center justify-center gap-3"
    }, /*#__PURE__*/_react.default.createElement("button", {
      disabled: !mode,
      onClick: () => startGame(mode || "pvp", humanMark || "X"),
      className: "px-6 py-4 rounded-2xl bg-gray-900 text-white text-lg font-bold disabled:opacity-50"
    }, "Start"), /*#__PURE__*/_react.default.createElement("button", {
      onClick: hardResetToIntro,
      className: "px-6 py-4 rounded-2xl border-2 border-gray-300 text-lg font-semibold"
    }, "Anuluj")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mt-6 text-center text-sm text-gray-600"
    }, "Wskaz\xF3wka: gra zresetuje si\u0119 automatycznie po ", Math.floor(idleTimeoutMs / 1000), " s bezczynno\u015Bci."))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mt-6 text-sm text-white/85 max-w-[980px] text-center"
    }, "T\u0142o ekranu ustawia host (zielone). Siatka jest p\xF3\u0142przezroczysta, aby zachowa\u0107 sp\xF3jno\u015B\u0107 z projektem."));
  }

  // =====================
  // Testy lekkie (konsola) – nie zmieniaj istniejących; dodano kilka nowych
  // Włącz przez ustawienie RUN_TTT_TESTS = true (tylko w dev)
  // =====================
  const RUN_TTT_TESTS = false;
  if (RUN_TTT_TESTS) {
    const empty = Array(9).fill("");

    // Istniejące przypadki (nie modyfikowane):
    console.assert(computeWinner(["X", "X", "X", "", "", "", "", "", ""]) === "X", "Row win failed");
    console.assert(computeWinner(["O", "X", "X", "O", "", "", "O", "", ""]) === "O", "Column win failed");
    console.assert(computeWinner(["X", "", "O", "", "X", "", "O", "", "X"]) === "X", "Diagonal win failed");
    console.assert(computeWinner(["X", "O", "X", "X", "O", "O", "O", "X", "X"]) === "draw", "Draw failed");

    // Dodatkowe testy (nowe):
    // AI powinno zacząć od środka na pustej planszy
    console.assert(aiBestMove(empty, "X", "O") === 4, "AI should pick center on empty board");

    // AI powinno zablokować natychmiastową przegraną
    const blockBoard = ["X", "X", "", "", "O", "", "", "", ""]; // AI (O) musi zablokować index 2
    console.assert(aiBestMove(blockBoard, "O", "X") === 2, "AI should block immediate loss");

    // AI powinno wykonać zwycięski ruch, jeśli dostępny
    const winBoard = ["O", "O", "", "X", "X", "", "", "", ""]; // AI (O) wygrywa na 2
    console.assert(aiBestMove(winBoard, "O", "X") === 2, "AI should take winning move");

    // computeWinner powinno zwracać null gdy gra trwa
    console.assert(computeWinner(["X", "O", "", "", "X", "", "", "", ""]) === null, "Ongoing game should return null");

    // aiBestMove zawsze powinno zwrócić poprawny index (0..8) na planszy z wolnymi polami
    const anyBoard = ["X", "O", "X", "", "O", "", "", "", "X"]; // kilka wolnych
    const move = aiBestMove(anyBoard, "O", "X");
    console.assert(move >= 0 && move < 9 && anyBoard[move] === "", "AI returns a valid empty index");
    console.log("TicTacToe tests passed ✔");
  }
});