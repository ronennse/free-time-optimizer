import React from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ActivityInput from './pages/ActivityInput';
import CalendarIntegration from './pages/CalendarIntegration';
import ScheduleView from './pages/ScheduleView';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <main className="container">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/activities" element={<PrivateRoute><ActivityInput /></PrivateRoute>} />
              <Route path="/calendar" element={<PrivateRoute><CalendarIntegration /></PrivateRoute>} />
              <Route path="/schedule" element={<PrivateRoute><ScheduleView /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
