import { useState } from "react";
import UnoSetup from "./MainMenu";
import HowToPlay from "./HowToPlay";
import UnoGame from "./UnoGame";

export default function App() {
  const [currentPage, setCurrentPage] = useState("setup");
  const [gameConfig, setGameConfig] = useState(null);

  if (gameConfig) {
    return (
      <UnoGame
        playerName={gameConfig.playerName}
        opponents={gameConfig.opponents}
        onExit={() => setGameConfig(null)}
      />
    );
  }

  return (
    <>
      {currentPage === "setup" && (
        <UnoSetup 
          onStart={setGameConfig} 
          onHowToPlay={() => setCurrentPage("how-to-play")} 
        />
      )}
      {currentPage === "how-to-play" && (
        <HowToPlay onBack={() => setCurrentPage("setup")} />
      )}
    </>
  );
}