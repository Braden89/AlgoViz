import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import SortingCatalogPage from "./pages/SortingCatalogPage";

import BubbleSortPage from "./pages/BubbleSortPage";
import InsertionSortPage from "./pages/InsertionSortPage";
import QuickSortPage from "./pages/QuickSortPage";
import TreeSortPage from "./pages/TreeSortPage"; 
import BogoSortPage from "./pages/BogoSortPage";
import GraphsPage from "./pages/GraphsPage";
import DfsPage from "./pages/DfsPage";
import BfsPage from "./pages/BfsPage";


export default function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Sorting */}
      <Route path="/algorithms/sorting" element={<SortingCatalogPage />} />
      <Route path="/algorithms/sorting/bubble" element={<BubbleSortPage />} />
      <Route path="/algorithms/sorting/insertion" element={<InsertionSortPage />} />
      <Route path="/algorithms/sorting/quick" element={<QuickSortPage />} />
      <Route path="/algorithms/sorting/tree" element={<TreeSortPage />} />
      <Route path="/algorithms/sorting/bogo" element={<BogoSortPage />} />
      <Route path="/graphs" element={<GraphsPage />} />
      <Route path="/graphs/dfs" element={<DfsPage />} />
      <Route path="/graphs/bfs" element={<BfsPage />} />

      {/* Optional: redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
