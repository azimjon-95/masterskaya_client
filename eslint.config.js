import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatsSection from '../components/StatsSection';
import OrdersSection from '../components/OrdersSection';

const translations = { /* xuddi yuqoridagi */ };

export default function DashboardPage() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'uz');
  const [orders, setOrders] = useState([]);
  const username = localStorage.getItem('username') || 'Admin';
  const t = translations[lang];

  // Orders ni localStorage dan yuklash (persistent)
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  return (
    <div className="app-container">
      <Header lang={lang} setLang={setLang} username={username} t={t} />
      <main className="main-content">
        <div className="welcome-section animate-fade-in">
          <h2>{t.welcome}, {username}!</h2>
        </div>
        <StatsSection orders={orders} t={t} />
        <OrdersSection orders={orders} setOrders={setOrders} t={t} lang={lang} />
      </main>
    </div>
  );
}