import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { YearlyProvider } from './context/YearlyContext';
import Navigation from './components/Navigation';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import CreateLeaguePage from './pages/CreateLeaguePage';
import TeamPage from './pages/TeamPage';
import LeaguePage from './pages/LeaguePage';
import LeagueSettingsPage from './pages/LeagueSettingsPage';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <AuthProvider>
    <YearlyProvider>
      <DataProvider>
    <Router>
            <Navigation onLoginClick={() => setShowLoginModal(true)} />
            <LoginForm
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
            />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-league" element={<CreateLeaguePage />} />
        <Route path="/league/:leagueId" element={<LeaguePage />} />
        <Route path="/league/:leagueId/settings" element={<LeagueSettingsPage />} />
        <Route path="/team/:teamId" element={<TeamPage />} />
      </Routes>
    </Router>
      </DataProvider>
    </YearlyProvider>
    </AuthProvider>
  );
}

export default App;
