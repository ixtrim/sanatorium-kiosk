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
  _exports.default = TicTacToeKiosk;
  _react = _interopRequireWildcard(_react);
  function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
  // =============================
  // NOWA WERSJA GRY — PEŁNA, KIOSKOWA, DZIAŁAJĄCA W INTERFACES
  // Zero Tailwinda, tylko czyste CSS inline i styl kompatybilny z kioskami
  // =============================

  // AI — proste minimax
  function computeWinner(b) {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (const [a, c, d] of lines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every(v => v)) return "draw";
    return null;
  }
  function aiMove(board, ai, human) {
    const score = w => w === ai ? 1 : w === human ? -1 : w === "draw" ? 0 : null;
    function minimax(state, player) {
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
        state[i] = null;
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
      return {
        idx: bestIdx,
        val: bestVal
      };
    }
    const {
      idx
    } = minimax([...board], ai);
    return idx >= 0 ? idx : board.findIndex(v => !v);
  }
  function TicTacToeKiosk() {
    const empty = Array(9).fill(null);
    const [phase, setPhase] = (0, _react.useState)("intro"); // intro | play | done
    const [mode, setMode] = (0, _react.useState)(null); // ai | pvp
    const [human, setHuman] = (0, _react.useState)("X");
    const [startPlayer, setStartPlayer] = (0, _react.useState)("X");
    const [turn, setTurn] = (0, _react.useState)("X");
    const [board, setBoard] = (0, _react.useState)(empty);
    const [winner, setWinner] = (0, _react.useState)(null);
    const resetAll = () => {
      setPhase("intro");
      setMode(null);
      setHuman("X");
      setStartPlayer("X");
      setTurn("X");
      setBoard(empty);
      setWinner(null);
    };
    const startGame = () => {
      setBoard(empty);
      setWinner(null);
      setTurn(startPlayer);
      setPhase("play");
    };
    const tileClick = i => {
      if (winner || board[i] || phase !== "play") return;
      const nb = [...board];
      nb[i] = turn;
      const w = computeWinner(nb);
      setBoard(nb);
      if (w) {
        setWinner(w);
        setPhase("done");
        return;
      }
      setTurn(turn === "X" ? "O" : "X");
    };

    // AI ruch
    (0, _react.useEffect)(() => {
      if (phase !== "play" || mode !== "ai") return;
      const aiMark = human === "X" ? "O" : "X";
      if (turn !== aiMark) return;
      const id = setTimeout(() => {
        const idx = aiMove(board, aiMark, human);
        tileClick(idx);
      }, 300);
      return () => clearTimeout(id);
    }, [turn, phase, mode, board, human]);
    const boardStyle = {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
      width: "300px",
      margin: "20px auto"
    };
    const tileStyle = {
      width: "100px",
      height: "100px",
      borderRadius: "16px",
      background: "#ffffff",
      border: "2px solid #1F9660",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "64px",
      fontWeight: "bold",
      cursor: "pointer"
    };
    return /*#__PURE__*/_react.default.createElement("div", {
      style: {
        width: "100%",
        height: "100%",
        padding: "0 20px",
        textAlign: "center"
      }
    }, phase === "intro" && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h2", {
      style: {
        fontSize: "24px",
        marginBottom: "16px"
      }
    }, "Wybierz tryb gry"), /*#__PURE__*/_react.default.createElement("button", {
      onClick: () => setMode("pvp"),
      style: {
        padding: "12px 20px",
        margin: "6px",
        borderRadius: "12px",
        background: "#EEEEEE",
        border: "1px solid #EEEEEE",
        cursor: "pointer"
      }
    }, "2 graczy"), /*#__PURE__*/_react.default.createElement("button", {
      onClick: () => setMode("ai"),
      style: {
        padding: "12px 20px",
        margin: "6px",
        borderRadius: "12px",
        border: "1px solid #333",
        cursor: "pointer"
      }
    }, "Przeciwko AI"), mode === "ai" && /*#__PURE__*/_react.default.createElement("div", {
      style: {
        marginTop: "16px"
      }
    }, /*#__PURE__*/_react.default.createElement("div", null, "Wybierz sw\xF3j znak:"), /*#__PURE__*/_react.default.createElement("button", {
      onClick: () => setHuman("X"),
      style: {
        padding: "10px 16px",
        margin: "6px",
        borderRadius: "12px",
        border: "2px solid #333",
        background: human === "X" ? "#333" : "#fff",
        color: human === "X" ? "#fff" : "#000"
      }
    }, "X"), /*#__PURE__*/_react.default.createElement("button", {
      onClick: () => setHuman("O"),
      style: {
        padding: "10px 16px",
        margin: "6px",
        borderRadius: "12px",
        border: "2px solid #333",
        background: human === "O" ? "#333" : "#fff",
        color: human === "O" ? "#fff" : "#000"
      }
    }, "O")), mode && /*#__PURE__*/_react.default.createElement("div", {
      style: {
        marginTop: "20px"
      }
    }, /*#__PURE__*/_react.default.createElement("div", null, "Kto zaczyna?"), /*#__PURE__*/_react.default.createElement("button", {
      onClick: () => setStartPlayer("X"),
      style: {
        padding: "10px 16px",
        margin: "6px",
        borderRadius: "12px",
        border: "2px solid #333",
        background: startPlayer === "X" ? "#333" : "#fff",
        color: startPlayer === "X" ? "#fff" : "#000"
      }
    }, "X"), /*#__PURE__*/_react.default.createElement("button", {
      onClick: () => setStartPlayer("O"),
      style: {
        padding: "10px 16px",
        margin: "6px",
        borderRadius: "12px",
        border: "2px solid #333",
        background: startPlayer === "O" ? "#333" : "#fff",
        color: startPlayer === "O" ? "#fff" : "#000"
      }
    }, "O")), mode && /*#__PURE__*/_react.default.createElement("button", {
      onClick: startGame,
      style: {
        padding: "14px 26px",
        marginTop: "20px",
        borderRadius: "12px",
        border: "2px solid #333",
        background: "#333",
        color: "#fff",
        cursor: "pointer",
        fontSize: "18px"
      }
    }, "Start")), phase === "play" && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      style: {
        fontSize: "20px",
        marginBottom: "10px"
      }
    }, "Tura: ", /*#__PURE__*/_react.default.createElement("strong", null, turn)), /*#__PURE__*/_react.default.createElement("div", {
      style: boardStyle
    }, board.map((v, i) => /*#__PURE__*/_react.default.createElement("div", {
      key: i,
      onClick: () => tileClick(i),
      style: tileStyle
    }, v))), /*#__PURE__*/_react.default.createElement("button", {
      onClick: resetAll,
      style: {
        padding: "10px 20px",
        borderRadius: "12px",
        border: "1px solid #333",
        marginTop: "20px"
      }
    }, "Wyjd\u017A do menu")), phase === "done" && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h2", {
      style: {
        fontSize: "28px",
        marginBottom: "16px"
      }
    }, winner === "draw" ? "Remis" : `Wygrywa ${winner}!`), /*#__PURE__*/_react.default.createElement("div", {
      style: {
        marginTop: "12px"
      }
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: startGame,
      style: {
        padding: "10px 24px",
        borderRadius: "12px",
        border: "2px solid #333",
        background: "#333",
        color: "#fff",
        margin: "6px"
      }
    }, "Zagraj ponownie"), /*#__PURE__*/_react.default.createElement("button", {
      onClick: resetAll,
      style: {
        padding: "10px 20px",
        borderRadius: "12px",
        border: "1px solid #333",
        margin: "6px"
      }
    }, "Wyjd\u017A do menu"))));
  }

  // =============================
  // Proste testy sanity-check dla logiki gry
  // (działają w dev, nie wpływają na kiosk)
  // =============================

  if (typeof console !== "undefined") {
    // X wygrywa w wierszu
    console.assert(computeWinner(["X", "X", "X", null, null, null, null, null, null]) === "X", "X should win in top row");

    // O wygrywa w kolumnie
    console.assert(computeWinner(["O", null, null, "O", null, null, "O", null, null]) === "O", "O should win in first column");

    // Remis
    console.assert(computeWinner(["X", "O", "X", "X", "O", "O", "O", "X", "X"]) === "draw", "Should detect draw");

    // AI powinno brać środek na pustej planszy (najlepszy ruch)
    const emptyBoard = Array(9).fill(null);
    const aiCenterMove = aiMove(emptyBoard, "X", "O");
    console.assert(aiCenterMove === 4, "AI should pick center on empty board");
  }
});