import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import { useStore } from './store/useStore';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Login } from './pages/Login';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initializeFirebaseListeners = useStore(state => state.initializeFirebaseListeners);

  useEffect(() => {
    let unsubscribeListeners: (() => void) | undefined;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        unsubscribeListeners = initializeFirebaseListeners();
      } else if (unsubscribeListeners) {
        unsubscribeListeners();
      }
    });
    
    return () => {
      unsubscribeAuth();
      if (unsubscribeListeners) unsubscribeListeners();
    };
  }, [initializeFirebaseListeners]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        Loading...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          {!user ? (
            <Route path="*" element={<Login />} />
          ) : (
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="sales" element={<Sales />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;
