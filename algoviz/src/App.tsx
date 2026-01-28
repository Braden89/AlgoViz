import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BubbleSortPage from "./pages/BubbleSortPage";
import InsertionSortPage from "./pages/InsertionSortPage";
import SortingCatalogPage from "./pages/SortingCatalogPage";
import QuickSortPage from "./pages/QuickSortPage";




export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/algorithms/sorting/bubble" element={<BubbleSortPage />} />
      <Route path="/algorithms/sorting/insertion" element={<InsertionSortPage />} />
      <Route path="/algorithms/sorting" element={<SortingCatalogPage />} />
      <Route path="/algorithms/sorting/quick" element={<QuickSortPage />} />
      


    </Routes>
  );
}


