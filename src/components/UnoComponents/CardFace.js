function CardFace({ card, color, size = "small" }) {
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

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: isLarge ? 10 : 7,
        background: card.isWild ? "#1a1a2e" : "#fff",
        border: `2px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 2px 12px ${color}44`,
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
            background: color,
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