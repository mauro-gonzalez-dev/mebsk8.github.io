import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Game from "./Game";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/juego" element={<Game />} />
    </Routes>
  );
}
