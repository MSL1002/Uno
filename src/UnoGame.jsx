import { useState, useEffect, useCallback, useRef } from "react";
import UnoEngine from "./components/UnoComponents/Engine.js";
import "./UnoStyle.scss";

const COLOR_MAP = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#ca8a04",
  wild: "#545454",
};

const COLOR_BG = {
  red: "#1c0a0a",
  green: "#0a1c0a",
  blue: "#0a0e1c",
  yellow: "#1c1a0a",
  wild: "#14091c",
};

function canPlayOn(card, topCard, activeColor) {
  const effectiveColor = activeColor || topCard.color;
  if (card.color === "wild") return true;
  if (card.color === effectiveColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

// card face only plays nice being here, so included in this file for now
function CardFace({ card, color, colorName, size = "small" }) {
  const isLarge = size === "large";
  const w = isLarge ? 80 : 54;
  const h = isLarge ? 120 : 80;
  const fontSize = isLarge ? 22 : 13;
  const subFontSize = isLarge ? 11 : 8;

  const ICONS = {
    skip: "⊘",
    reverse: "⇄",
    draw2: "+2",
    wild: "★",
    wild4: "+4",
  };

  const label = ICONS[card.value] ?? card.value;

  // Ensure color is always defined for consistency
  const displayColor = color || "#888";
  const wildBackground = card.isWild && size === "large" ? displayColor : "#fff";
  const wildText = card.isWild && size === "large" && colorName ? colorName.toUpperCase() : null;

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: isLarge ? 10 : 7,
        background: card.isWild ? wildBackground : "#fff",
        border: `2px solid ${displayColor}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 2px 12px ${displayColor}44`,
        flexShrink: 0,
      }}
    >
      {/* Color band */}
      {!card.isWild && (
        <div
          style={{
            position: "absolute",
            inset: "12%",
            borderRadius: isLarge ? 8 : 5,
            background: COLOR_MAP[card.color],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: "900",
              fontSize,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
            }}
          >
            {label}
          </span>
        </div>
      )}

      {card.isWild && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {wildText ? (
            <span style={{ color: "#fff", fontWeight: "900", fontSize: isLarge ? 18 : subFontSize, letterSpacing: 1 }}>
              {wildText}
            </span>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                {["red", "green", "blue", "yellow"].map((c) => (
                  <div
                    key={c}
                    style={{ width: isLarge ? 18 : 12, height: isLarge ? 18 : 12, background: COLOR_MAP[c], borderRadius: "50%" }}
                  />
                ))}
              </div>
              <span style={{ color: "#fff", fontWeight: "900", fontSize: subFontSize, marginTop: 4, letterSpacing: 1 }}>
                {card.value === "wild4" ? "+4" : "WILD"}
              </span>
            </>
          )}
        </div>
      )}

      {/* Corner labels */}
      {!card.isWild && (
        <>
          <span style={{ position: "absolute", top: 3, left: 4, color, fontSize: subFontSize, fontWeight: "700" }}>
            {label}
          </span>
          <span style={{ position: "absolute", bottom: 3, right: 4, color, fontSize: subFontSize, fontWeight: "700", transform: "rotate(180deg)" }}>
            {label}
          </span>
        </>
      )}
    </div>
  );
}

export default function UnoGame({ playerName = "Player", opponents = 1, onExit }) {

  const engineRef = useRef(null);
  const [state, setState] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [animatingAI, setAnimatingAI] = useState(false);
  const [toast, setToast] = useState(null);

  const snap = useCallback(() => {
    setState(engineRef.current.snapshot());
  }, []);

  const showToast = useCallback((msg, duration = 2200) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }, []);

  // Init
  useEffect(() => {
    engineRef.current = new UnoEngine(playerName, opponents);
    snap();
  }, [playerName, opponents]);

  // Auto-run AI after human acts
  const runAI = useCallback(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    if (engine.phase !== "playing" || !engine.currentPlayer.isAI) return;

    setAnimatingAI(true);
    // Stagger AI turns
    const delay = 700;
    setTimeout(() => {
      const actions = engine.runAITurns();
      actions.forEach((a, i) => {
        setTimeout(() => showToast(a, 1800), i * 200);
      });
      snap();
      setAnimatingAI(false);
    }, delay);
  }, [snap, showToast]);

  // Watch for AI turn
  useEffect(() => {
    if (!state) return;
    if (state.phase === "playing" && state.players[state.currentIndex]?.isAI) {
      runAI();
    }
  }, [state?.currentIndex, state?.phase]);

  if (!state) return <div className="loading">Shuffling deck...</div>;

  const humanPlayer = state.players[0];
  const isMyTurn = state.currentIndex === 0 && state.phase === "playing";

  const handlePlayCard = (cardId) => {
    if (!isMyTurn || animatingAI) return;
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  const handleConfirmPlay = () => {
    if (!selectedCard) return;
    const result = engineRef.current.playCard(selectedCard);
    if (!result.ok) {
      showToast(`Unable to Play Card: ${result.error}`);
      return;
    }
    setSelectedCard(null);
    if (result.needsColor) {
      setColorPickerOpen(true);
      snap();
    } else {
      snap();
      // Check UNO
      const p = engineRef.current.players[0];
    }
  };

  const handleColorChoice = (color) => {
    engineRef.current.chooseColor(color);
    setColorPickerOpen(false);
    snap();
  };

  const handleDraw = () => {
    if (!isMyTurn || animatingAI) return;
    setSelectedCard(null);
    engineRef.current.drawAndPass();
    snap();
  };

  const handleNewGame = () => {
    engineRef.current = new UnoEngine(playerName, opponents);
    setSelectedCard(null);
    setColorPickerOpen(false);
    snap();
  };

  const topCard = state.topCard;
  const effectiveColor = state.activeColor || topCard.color;
  const accentColor = COLOR_MAP[effectiveColor] || "#888";

  return (
    <div className="root">
      {/* Ambient glow */}
      <div className="glow" />

      {toast && <div className="toast">{toast}</div>}

      {/* Game Over overlay */}
      {state.phase === "gameOver" && (
        <div className="overlay">
          <div className="overlayCard">
            <div className="overlayTitle">
              {state.winner?.id === 0 ? "YOU WIN!" : `${state.winner?.name} WINS`}
            </div>
            <div className="overlayScore">
              Hand sizes: {state.players.map((p) => `${p.name}: ${p.handSize}`).join(" · ")}
            </div>
            <div className="overlayActions">
              {onExit && (
                <button className="overlayBtn overlayBtnSecondary" onClick={onExit}>
                  Main Menu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Color Picker */}
      {colorPickerOpen && (
        <div className="overlay">
          <div className="colorPicker">
            <p className="colorPickerTitle">Choose a color</p>
            <div className="colorGrid">
              {["red", "green", "blue", "yellow"].map((c) => (
                <button
                  key={c}
                  className="colorBtn"
                  onClick={() => handleColorChoice(c)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Layout */}
      <div className="layout">
        {/* Left: Log + Deck info */}
        <aside className="sidebar">
          <div className="sideHeader">
            <span className="logoSmall" style={{ color: accentColor }}>
              UNO
            </span>
            {onExit && (
              <button className="exitBtn" onClick={onExit}>✕</button>
            )}
          </div>

          <div className="deckInfo">
            <div className="deckStat">
              <span className="deckNum">{state.drawPileSize}</span>
              <span className="deckLabel">cards left</span>
            </div>
            {state.pendingDraw > 0 && (
              <div className="deckStat" style={{ color: "#ef4444" }}>
                <span className="deckNum">+{state.pendingDraw}</span>
                <span className="deckLabel">pending draw</span>
              </div>
            )}
          </div>

          <div className="logBox">
            {state.log.map((entry, i) => (
              <div key={i} className="logEntry">
                {entry}
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Table */}
        <main className="table">
          {/* AI Opponents */}
          <div className="opponents">
            {state.players.slice(1).map((p) => (
              <div
                key={p.id}
                className="opponentArea"
              >
                <div className="opponentName">
                  {p.name}
                  {p.hasUno && <span className="unoBadge">UNO</span>}
                  {state.currentIndex === p.id && animatingAI && (
                    <span className="thinkingDot">•••</span>
                  )}
                </div>
                <div className="aiCards">
                  {Array.from({ length: Math.min(p.handSize, 12) }).map((_, i) => (
                    <div key={i} className="aiCard" />
                  ))}
                  {p.handSize > 12 && (
                    <span className="aiCardExtra">+{p.handSize - 12}</span>
                  )}
                </div>
                <div className="cardCount">{p.handSize} cards</div>
              </div>
            ))}
          </div>

          {/* Center play area */}
          <div className="playArea">
            {/* Draw pile */}
            <div className="pileGroup">
              <div
                className="drawPile clickable"
                onClick={handleDraw}
                title={state.pendingDraw > 0 ? `Draw ${state.pendingDraw}` : "Draw a card"}
              >
                <div className="cardBack">
                  <span className="cardBackLogo">UNO</span>
                </div>
              </div>
              <span className="pileLabel">
                {state.pendingDraw > 0 ? `Draw ${state.pendingDraw}` : "Draw"}
              </span>
            </div>

            {/* Top card */}
            <div className="pileGroup">
              <CardFace
              card={topCard}
              color={COLOR_MAP[effectiveColor] || COLOR_MAP[topCard.color] || "#888"}
              colorName={effectiveColor}
              size="large"
            />
              <span className="pileLabel">Discard</span>
            </div>
          </div>

          {/* Direction indicator */}
          <div className="directionRow">
            <span className="turnIndicator">
              {isMyTurn ? " YOUR TURN " : `${state.players[state.currentIndex]?.name}'s turn`}
            </span>
            <span className="directionLabel">
              {state.direction === 1 ? "▶ Clockwise" : "◀ Counter-clockwise"}
            </span>
          </div>

          {/* Human hand */}
          <div className="humanArea">
            <div className="humanMeta">
              <span className="humanName">
                {humanPlayer.name}
                {humanPlayer.hasUno && (
                  <span className="unoBadge"> UNO!</span>
                )}
              </span>
              <div className="handActions">
                {selectedCard && (
                  <button className="playBtn" onClick={handleConfirmPlay}>
                    Play Card ▶
                  </button>
                )}
              </div>
            </div>

            <div className="hand">
              {humanPlayer.hand.map((card, i) => {
                const playable =
                  isMyTurn &&
                  !animatingAI &&
                  canPlayOn(card, topCard, effectiveColor) &&
                  (state.pendingDraw === 0 ||
                    card.value === "draw2" ||
                    card.value === "wild4");

                return (
                  <div
                    key={card.id}
                    className="handCard"
                    style={{
                      transform:
                        selectedCard === card.id
                          ? "translateY(-24px) scale(1.08)"
                          : playable
                          ? "translateY(-8px)"
                          : "translateY(0)",
                      opacity: isMyTurn && !playable ? 0.45 : 1,
                      cursor: playable || selectedCard === card.id ? "pointer" : "default",
                      zIndex: selectedCard === card.id ? 10 : i,
                      boxShadow:
                        selectedCard === card.id
                          ? `0 8px 32px ${COLOR_MAP[card.color]}88`
                          : playable
                          ? `0 4px 16px ${COLOR_MAP[card.color]}44`
                          : "none",
                    }}
                    onClick={() => playable && handlePlayCard(card.id)}
                  >
                    <CardFace card={card} color={COLOR_MAP[card.color]} size="small" />
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}