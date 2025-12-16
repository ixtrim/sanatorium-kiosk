import React, { useState, useEffect } from "react";

// =============================
// NOWA WERSJA GRY — PEŁNA, KIOSKOWA, DZIAŁAJĄCA W INTERFACES
// Zero Tailwinda, tylko czyste CSS inline i styl kompatybilny z kioskami
// =============================

// AI — proste minimax
function computeWinner(b) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every((v) => v)) return "draw";
  return null;
}

function aiMove(board, ai, human) {
  const score = (w) => (w === ai ? 1 : w === human ? -1 : w === "draw" ? 0 : null);

  function minimax(state, player) {
    const w = computeWinner(state);
    const s = score(w);
    if (s !== null) return { idx: -1, val: s };

    let bestIdx = -1;
    let bestVal = player === ai ? -Infinity : Infinity;

    for (let i = 0; i < 9; i++) {
      if (state[i]) continue;
      state[i] = player;
      const { val } = minimax(state, player === "X" ? "O" : "X");
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
    return { idx: bestIdx, val: bestVal };
  }

  const { idx } = minimax([...board], ai);
  return idx >= 0 ? idx : board.findIndex((v) => !v);
}

export default function TicTacToeKiosk() {
  const empty = Array(9).fill(null);

  const [phase, setPhase] = useState("intro"); // intro | play | done
  const [mode, setMode] = useState(null); // ai | pvp
  const [human, setHuman] = useState("X");
  const [startPlayer, setStartPlayer] = useState("X");
  const [turn, setTurn] = useState("X");
  const [board, setBoard] = useState(empty);
  const [winner, setWinner] = useState(null);

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

  const tileClick = (i) => {
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
  useEffect(() => {
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
    margin: "20px auto",
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
    cursor: "pointer",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "0 20px",
        textAlign: "center",
      }}
    >

      {/* INTRO */}
      {phase === "intro" && (
        <div>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Wybierz tryb gry</h2>
          <button
            onClick={() => setMode("pvp")}
            style={{
              padding: "12px 20px",
              margin: "6px",
              borderRadius: "12px",
              background: "#EEEEEE",
              border: "1px solid #EEEEEE",
              cursor: "pointer",
            }}
          >
            2 graczy
          </button>
          <button
            onClick={() => setMode("ai")}
            style={{
              padding: "12px 20px",
              margin: "6px",
              borderRadius: "12px",
              border: "1px solid #333",
              cursor: "pointer",
            }}
          >
            Przeciwko AI
          </button>

          {/* wybór znaku dla AI */}
          {mode === "ai" && (
            <div style={{ marginTop: "16px" }}>
              <div>Wybierz swój znak:</div>
              <button
                onClick={() => setHuman("X")}
                style={{
                  padding: "10px 16px",
                  margin: "6px",
                  borderRadius: "12px",
                  border: "2px solid #333",
                  background: human === "X" ? "#333" : "#fff",
                  color: human === "X" ? "#fff" : "#000",
                }}
              >
                X
              </button>
              <button
                onClick={() => setHuman("O")}
                style={{
                  padding: "10px 16px",
                  margin: "6px",
                  borderRadius: "12px",
                  border: "2px solid #333",
                  background: human === "O" ? "#333" : "#fff",
                  color: human === "O" ? "#fff" : "#000",
                }}
              >
                O
              </button>
            </div>
          )}

          {/* wybór kto zaczyna */}
          {mode && (
            <div style={{ marginTop: "20px" }}>
              <div>Kto zaczyna?</div>
              <button
                onClick={() => setStartPlayer("X")}
                style={{
                  padding: "10px 16px",
                  margin: "6px",
                  borderRadius: "12px",
                  border: "2px solid #333",
                  background: startPlayer === "X" ? "#333" : "#fff",
                  color: startPlayer === "X" ? "#fff" : "#000",
                }}
              >
                X
              </button>
              <button
                onClick={() => setStartPlayer("O")}
                style={{
                  padding: "10px 16px",
                  margin: "6px",
                  borderRadius: "12px",
                  border: "2px solid #333",
                  background: startPlayer === "O" ? "#333" : "#fff",
                  color: startPlayer === "O" ? "#fff" : "#000",
                }}
              >
                O
              </button>
            </div>
          )}

          {mode && (
            <button
              onClick={startGame}
              style={{
                padding: "14px 26px",
                marginTop: "20px",
                borderRadius: "12px",
                border: "2px solid #333",
                background: "#333",
                color: "#fff",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              Start
            </button>
          )}
        </div>
      )}

      {/* PLAY */}
      {phase === "play" && (
        <div>
          <div style={{ fontSize: "20px", marginBottom: "10px" }}>
            Tura: <strong>{turn}</strong>
          </div>

          <div style={boardStyle}>
            {board.map((v, i) => (
              <div key={i} onClick={() => tileClick(i)} style={tileStyle}>
                {v}
              </div>
            ))}
          </div>

          <button
            onClick={resetAll}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              border: "1px solid #333",
              marginTop: "20px",
            }}
          >
            Wyjdź do menu
          </button>
        </div>
      )}

      {/* DONE */}
      {phase === "done" && (
        <div>
          <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>
            {winner === "draw" ? "Remis" : `Wygrywa ${winner}!`}
          </h2>
          <div style={{ marginTop: "12px" }}>
            <button
              onClick={startGame}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "2px solid #333",
                background: "#333",
                color: "#fff",
                margin: "6px",
              }}
            >
              Zagraj ponownie
            </button>
            <button
              onClick={resetAll}
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                border: "1px solid #333",
                margin: "6px",
              }}
            >
              Wyjdź do menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================
// Proste testy sanity-check dla logiki gry
// (działają w dev, nie wpływają na kiosk)
// =============================

if (typeof console !== "undefined") {
  // X wygrywa w wierszu
  console.assert(
    computeWinner(["X", "X", "X", null, null, null, null, null, null]) === "X",
    "X should win in top row",
  );

  // O wygrywa w kolumnie
  console.assert(
    computeWinner(["O", null, null, "O", null, null, "O", null, null]) === "O",
    "O should win in first column",
  );

  // Remis
  console.assert(
    computeWinner(["X", "O", "X", "X", "O", "O", "O", "X", "X"]) === "draw",
    "Should detect draw",
  );

  // AI powinno brać środek na pustej planszy (najlepszy ruch)
  const emptyBoard = Array(9).fill(null);
  const aiCenterMove = aiMove(emptyBoard, "X", "O");
  console.assert(aiCenterMove === 4, "AI should pick center on empty board");
}