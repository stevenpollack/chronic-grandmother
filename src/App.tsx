import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Rates from "./Pages/Rates";
import ErrorBoundary from "./Components/ErrorBoundary";

import MainLayout from "./Layouts/MainLayout";

import "./App.css";

const App = () => (
  <ErrorBoundary>
    <Router>
      <Routes>
        <Route
          path="/rates"
          element={
            <MainLayout title="Rates">
              <Rates />
            </MainLayout>
          }
        />
        <Route
          path="/"
          element={
            <MainLayout title="Rates">
              <Rates />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  </ErrorBoundary>
);

export default App;
