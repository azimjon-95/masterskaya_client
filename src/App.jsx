import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { NotificationProvider } from "./components/Notification/NotificationToast";
import { syncOrdersToServer } from "./offlineSync";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [lang, setLang] = useState('uz');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setUsername(JSON.parse(user).username);
      setIsLoggedIn(true);
    }
  }, []);

  // 🔥 Token muddati tugaganda avtomatik logout
  useEffect(() => {
    const logoutHandler = () => {
      localStorage.clear();
      setIsLoggedIn(false);
      setUsername('');
    };

    window.addEventListener("forceLogout", logoutHandler);

    return () => window.removeEventListener("forceLogout", logoutHandler);
  }, []);

  useEffect(() => {
    window.addEventListener("online", syncOrdersToServer);
    syncOrdersToServer();
    return () => window.removeEventListener("online", syncOrdersToServer);
  }, []);

  const handleLogin = (user, selectedLang) => {
    setUsername(user);
    setLang(selectedLang);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <NotificationProvider>
      {isLoggedIn ? (
        <DashboardPage username={username} lang={lang} setLang={setLang} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </NotificationProvider>
  );
}
