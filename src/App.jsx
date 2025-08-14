import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { YearlyProvider } from './context/YearlyContext';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import CreateLeaguePage from './pages/CreateLeaguePage';
import TeamPage from './pages/TeamPage';
import LeaguePage from './pages/LeaguePage';

function App() {
  return (
    <YearlyProvider>
      <DataProvider>
    <Router>
          <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-league" element={<CreateLeaguePage />} />
        <Route path="/league/:leagueId" element={<LeaguePage />} />
        <Route path="/team/:teamId" element={<TeamPage />} />
      </Routes>
    </Router>
      </DataProvider>
    </YearlyProvider>
  );
}

export default App;
