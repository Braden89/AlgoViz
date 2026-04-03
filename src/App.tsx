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
import NetworkingPage from "./pages/NetworkingPage";
import PaxosPage from "./pages/PaxosPage";
import Rdt30Page from "./pages/Rdt30Page";
import ChordPage from "./pages/ChordPage";
import MachineLearningPage from "./pages/MachineLearningPage";
import LinearRegressionPage from "./pages/LinearRegressionPage";
import GradientDescentPage from "./pages/GradientDescentPage";
import KNearestNeighborsPage from "./pages/KNearestNeighborsPage";
import PerceptronPage from "./pages/PerceptronPage";


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
      <Route path="/algorithms/networking" element={<NetworkingPage />} />
      <Route path="/algorithms/networking/paxos" element={<PaxosPage />} />
      <Route path="/algorithms/networking/rdt-3-0" element={<Rdt30Page />} />
      <Route path="/algorithms/networking/chord" element={<ChordPage />} />
      <Route path="/algorithms/machine-learning" element={<MachineLearningPage />} />
      <Route path="/algorithms/machine-learning/linear-regression" element={<LinearRegressionPage />} />
      <Route path="/algorithms/machine-learning/gradient-descent" element={<GradientDescentPage />} />
      <Route path="/algorithms/machine-learning/k-nearest-neighbors" element={<KNearestNeighborsPage />} />
      <Route path="/algorithms/machine-learning/perceptron" element={<PerceptronPage />} />

      {/* Optional: redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
