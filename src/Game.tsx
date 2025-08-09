import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";

type Player = 1 | 2;

const trickGroupsInitiales = [
  ["Frontside 180"],
  ["Backside 180"],
  ["Pop Shuvit"],
  ["Manual x 2 seg", "Nose Manual x 2 seg"],
  ["Fakie Pop Shuvit"],
  ["Kickflip"],
  ["Bigspin"],
  ["Tre Flip", "Hardflip"],
  ["Heelflip"],

  ["Varial Flip"],
  ["360 Pop Shuvit", "Fakie Bigspin"],

  ["Double Kickflip", "Double Heelflip"],

  ["Laser Flip", "Bigspin Flip"],
  ["Impossible", "Inward Heelflip"],
  ["Hospital Flip", "Casper Flip"],
];

const trickGroupsAdvanced = [
  ["Kickflip", "Heelflip"],
  ["Frontside 180", "Backside 180"],
  ["Pop Shuvit", "Fakie Pop Shuvit", "FS Pop Shuvit"],

  ["Manual x 5 seg", "Nose Manual x 5 seg"],
  ["Tre Flip", "Hardflip"],

  ["Bigspin", "Varial Flip"],
  ["360 Pop Shuvit", "Fakie Bigspin"],

  ["Double Kickflip", "Double Heelflip"],

  ["Laser Flip", "Bigspin Flip"],
  ["Impossible", "Inward Heelflip"],
  ["Hospital Flip", "Casper Flip"],
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Game() {
  const query = useQuery();
  const nivelParam = query.get("nivel");
  const trickGroups =
    nivelParam?.toLocaleLowerCase() === "principiantes"
      ? trickGroupsInitiales
      : nivelParam?.toLocaleLowerCase() === "amateur"
      ? trickGroupsAdvanced
      : [];

  if (trickGroups.length === 0) alert("error de trucos");

  const [step, setStep] = useState<"home" | "name" | "game">("home");
  const [playerNames, setPlayerNames] = useState<{ 1: string; 2: string }>({
    1: "",
    2: "",
  });

  const [tricks] = useState(() =>
    trickGroups.map((group, index) => ({
      trick: group[Math.floor(Math.random() * group.length)],
      points: (index + 1) * 100,
    }))
  );
  const [index, setIndex] = useState(0);
  const [player, setPlayer] = useState<Player>(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [fails, setFails] = useState({ 1: 0, 2: 0 });
  const [eliminated, setEliminated] = useState({ 1: false, 2: false });
  const [playersTried, setPlayersTried] = useState({ 1: false, 2: false });
  const [displayText, setDisplayText] = useState("");
  const [animating, setAnimating] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const turnRef = useRef<HTMLParagraphElement>(null);

  const currentTrick = tricks[index];

  const startAnimation = () => {
    if (index >= tricks.length || animating) return;

    setAnimating(true);
    setShowButtons(false);

    let count = 0;
    const maxCount = 40;
    const interval = 30;

    const spinInterval = setInterval(() => {
      const group = trickGroups[Math.floor(Math.random() * trickGroups.length)];
      const trick = group[Math.floor(Math.random() * group.length)];
      setDisplayText(trick);
      count++;
      if (count >= maxCount) {
        clearInterval(spinInterval);
        setDisplayText(currentTrick.trick);
        setAnimating(false);
        setPlayersTried({ 1: false, 2: false });

        const firstPlayer = !eliminated[1] ? 1 : 2;
        setPlayerWithFade(firstPlayer);
        if (!eliminated[firstPlayer]) {
          setShowButtons(true);
        }
      }
    }, interval);
  };

  const setPlayerWithFade = (newPlayer: Player) => {
    if (turnRef.current) {
      turnRef.current.classList.add("fade-out");
      setTimeout(() => {
        setPlayer(newPlayer);
        if (turnRef.current) {
          turnRef.current.classList.remove("fade-out");
        }
      }, 400);
    } else {
      setPlayer(newPlayer);
    }
  };

  const handleResult = (success: boolean, button: HTMLButtonElement) => {
    button.classList.add("button-animate");
    setTimeout(() => button.classList.remove("button-animate"), 300);

    if (eliminated[player] || playersTried[player]) return;

    const updatedScores = {
      ...scores,
      [player]: success ? scores[player] + currentTrick.points : scores[player],
    };
    setScores(updatedScores);

    // Resetea fails si tuvo éxito, o suma 1 si falló
    const newFails = {
      ...fails,
      [player]: success ? 0 : fails[player] + 1,
    };

    let justEliminated = false;
    if (newFails[player] >= 3) {
      justEliminated = true;
      setEliminated((prev) => ({ ...prev, [player]: true }));
    }

    setFails(newFails);

    const updatedTried = { ...playersTried, [player]: true };
    setPlayersTried(updatedTried);

    const otherPlayer: Player = player === 1 ? 2 : 1;

    if (
      (updatedTried[1] || eliminated[1]) &&
      (updatedTried[2] || eliminated[2])
    ) {
      setShowButtons(false);
      setTimeout(() => {
        setIndex((i) => i + 1);
      }, 500);
    } else {
      const nextPlayer = !eliminated[otherPlayer] ? otherPlayer : player;
      setPlayerWithFade(nextPlayer);
      if (!eliminated[nextPlayer] && !updatedTried[nextPlayer]) {
        setShowButtons(true);
      } else {
        setShowButtons(false);
      }
    }
  };

  const bothEliminated = eliminated[1] && eliminated[2];

  // HOME
  if (step === "home") {
    return (
      <div className="container rules-container">
        <h1 className="title">Desafío picante</h1>
        <h2 className="subtitle">Reglas</h2>
        <ol className="rules-list">
          <li>Se juega como el skate tradicional, pero por puntos.</li>
          <li>Las pruebas se eligen al azar.</li>
          <li>Cada prueba tiene un puntaje asignado según su dificultad.</li>
          <li>
            El jugador que falle 3 veces consecutivas, queda fuera de juego.
          </li>
        </ol>
        <button className="start-button" onClick={() => setStep("name")}>
          Empezar
        </button>
      </div>
    );
  }

  // NAMES
  if (step === "name") {
    return (
      <div className="container">
        <h2>Ingresá los nombres</h2>
        <input
          placeholder="Jugador 1"
          value={playerNames[1]}
          onChange={(e) =>
            setPlayerNames({ ...playerNames, 1: e.target.value })
          }
        />
        <input
          placeholder="Jugador 2"
          value={playerNames[2]}
          onChange={(e) =>
            setPlayerNames({ ...playerNames, 2: e.target.value })
          }
        />
        <button
          type="button"
          className="button"
          style={{ margin: "20px 0" }}
          onClick={() => {
            if (playerNames[1] && playerNames[2]) {
              setStep("game");
            } else {
              alert("Completá ambos nombres");
            }
          }}
        >
          <div className="button-top">Comenzar juego</div>
          <div className="button-bottom"></div>
          <div className="button-base"></div>
        </button>
      </div>
    );
  }

  // END - Ambos eliminados
  if (bothEliminated) {
    return (
      <div className="container">
        <h1>¡Ambos jugadores han sido eliminados!</h1>
        <div className="eliminated-message">
          <p>
            {playerNames[1]}: {scores[1]} pts
          </p>
          <p>
            {playerNames[2]}: {scores[2]} pts
          </p>
        </div>
      </div>
    );
  }

  // END - Todos los trucos terminados
  if (index >= tricks.length) {
    return (
      <div className="container">
        <h1>¡Juego terminado!</h1>
        <p>
          {playerNames[1]}: {scores[1]} pts | {playerNames[2]}: {scores[2]} pts
        </p>
      </div>
    );
  }

  // GAME
  return (
    <div className="container">
      <h1 style={{ fontSize: "60px", margin: "10px 0" }}>{displayText}</h1>
      <p ref={turnRef} className="fade" style={{ fontSize: "30px", margin: 0 }}>
        Turno: {playerNames[player] || `Jugador ${player}`} —{" "}
        {3 - fails[player]} oportunidades
      </p>
      <p style={{ fontSize: "20px" }}>Por {currentTrick.points} puntos</p>
      <h2>Nivel: {nivelParam}</h2>
      <div style={{ position: "absolute", top: "20px" }}>
        <p style={{ fontSize: "30px" }}>
          {playerNames[1]}: {scores[1]} puntos{" "}
          {"(" + "🛹".repeat(3 - fails[1]) + ")"}
        </p>
        <p style={{ fontSize: "30px" }}>
          {playerNames[2]}: {scores[2]} puntos{" "}
          {"(" + "🛹".repeat(3 - fails[2]) + ")"}
        </p>
      </div>

      {/* Botón Siguiente Truco solo visible cuando NO está animando ni se muestran botones de éxito/fallo */}
      {!animating &&
        !showButtons &&
        !bothEliminated &&
        index < tricks.length && (
          <div style={{ position: "absolute", bottom: "30px" }}>
            <button onClick={startAnimation} type="button" className="button">
              <div className="button-top">
                🛹 {index === 0 ? "Empezar" : "Siguiente Truco"}
              </div>
              <div className="button-bottom"></div>
              <div className="button-base"></div>
            </button>
          </div>
        )}

      {/* Botones para responder si hizo o falló el truco */}
      {showButtons && !eliminated[player] && !playersTried[player] && (
        <div style={{ position: "absolute", bottom: "30px" }}>
          <button
            type="button"
            className="button"
            onClick={(e) => handleResult(true, e.currentTarget)}
          >
            <div className="button-top">✅ Lo hizo</div>
            <div className="button-bottom"></div>
            <div className="button-base"></div>
          </button>
          <button
            type="button"
            className="button"
            onClick={(e) => handleResult(false, e.currentTarget)}
          >
            <div className="button-top">❌ Falló</div>
            <div className="button-bottom"></div>
            <div className="button-base"></div>
          </button>
        </div>
      )}

      {/* Mostrar mensaje de eliminado debajo, con estilo */}
      {eliminated[1] && (
        <div className="eliminated-message">
          <p>
            {playerNames[1]} eliminado con {scores[1]} puntos.
          </p>
        </div>
      )}
      {eliminated[2] && (
        <div className="eliminated-message">
          <p>
            {playerNames[2]} eliminado con {scores[2]} puntos.
          </p>
        </div>
      )}
    </div>
  );
}
