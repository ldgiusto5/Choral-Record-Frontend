import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ChoirDetailPage from './pages/ChoirDetailPage';
import CreateChoirPage from './pages/CreateChoirPage';
import EditChoirPage from './pages/EditChoirPage';
import AddPiecePage from './pages/AddPiecePage';
import AddEventPage from './pages/AddEventPage';
import EditPiecePage from './pages/EditPiecePage';
import EditEventPage from './pages/EditEventPage';
import ChoirFollowersPage from './pages/ChoirFollowersPage';
import EventsPage from './pages/EventsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Footer from './components/Footer';
import './App.css';

function AppContent() {
  const location = useLocation();
  const hideFooter = ['/login', '/register', '/verify-email'].includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile/:usernameOrId" element={<ProfilePage />} />
        <Route path="/choirs/create" element={<CreateChoirPage />} />
        <Route path="/choirs/:id" element={<ChoirDetailPage />} />
        <Route path="/choirs/:id/followers" element={<ChoirFollowersPage />} />
        <Route path="/choirs/:id/edit" element={<EditChoirPage />} />
        <Route path="/choirs/:id/pieces/add" element={<AddPiecePage />} />
        <Route path="/choirs/:id/events/add" element={<AddEventPage />} />
        <Route path="/choirs/:id/pieces/:pieceId/edit" element={<EditPiecePage />} />
        <Route path="/choirs/:id/events/:eventId/edit" element={<EditEventPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#e0e0ff',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: { primary: '#06b6d4', secondary: '#1a1a2e' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' },
            },
          }}
        />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
