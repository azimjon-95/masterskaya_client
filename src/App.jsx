// src/App.jsx
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { NotificationProvider } from "./components/Notification/NotificationToast";
import { syncOrdersToServer } from "./offlineSync";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [lang, setLang] = useState('uz');

  // Agar localStorage da token bo'lsa avtomatik login qilamiz
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setUsername(JSON.parse(user).username);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("online", syncOrdersToServer);
    syncOrdersToServer(); // kirishda ham tekshirsin

    return () => window.removeEventListener("online", syncOrdersToServer);
  }, []);

  const handleLogin = (user, selectedLang) => {
    setUsername(user);
    setLang(selectedLang);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUsername('');
  };

  return <NotificationProvider>
    {
      isLoggedIn ? (
        <DashboardPage
          username={username}
          lang={lang}
          setLang={setLang}
          onLogout={handleLogout}
        />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )
    }
  </NotificationProvider>;
}
