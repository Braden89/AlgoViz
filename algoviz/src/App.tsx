import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BubbleSortPage from "./pages/BubbleSortPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/algorithms/sorting/bubble" element={<BubbleSortPage />} />
    </Routes>
  );
}


