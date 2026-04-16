import { useState } from "react";
import "./MainMenuStyle.scss";

export default function MainMenu({ onStart, onHowToPlay }) {
  const [opponents, setOpponents] = useState(1);
  const [playerName, setPlayerName] = useState("Player");
  const [hoveredCount, setHoveredCount] = useState(null);

  const aiNames = ["Nova", "Rex", "Sage"];

  return (
    <div className="setupRoot">
      <div className="card">
        <div className="logoWrap">
          <span className="logoUno">UNO</span>
        </div>

        <div className="section">
          <label>Your Name</label>
          <input
            value={playerName}
            maxLength={16}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="section">
          <label>Opponents</label>
          <div className="opponentGrid">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setOpponents(n)}
                onMouseEnter={() => setHoveredCount(n)}
                onMouseLeave={() => setHoveredCount(null)}
              >
                <span className="opponentNum">{n}</span>
                <span className="opponentLabel">
                  {n === 1 ? "opponent" : "opponents"}
                </span>
                <div className="aiList">
                  {aiNames.slice(0, n).map((name) => (
                    <span key={name} className="aiChip">
                      {name}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          className="startBtn howToPlayBtn"
          onClick={() => onHowToPlay()}
        >
          How to Play
        </button>

        <button
          className="startBtn"
          onClick={() => onStart({ playerName: playerName || "Player", opponents })}
        >
          DEAL CARDS
          <span className="startArrow">→</span>
        </button>
      </div>
    </div>
  );
}

