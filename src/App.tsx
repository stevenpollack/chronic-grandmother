import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RatesPage from "./Pages/Rates/Page";
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
              <RatesPage />
            </MainLayout>
          }
        />
        <Route
          path="/"
          element={
            <MainLayout title="Rates">
              <RatesPage />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  </ErrorBoundary>
);

export default App;
