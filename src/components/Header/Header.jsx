import React, { useEffect, useState } from 'react';
import { BsCaretDownFill, BsPersonCircle, BsX } from "react-icons/bs";
import './style.css';
import { RiStethoscopeLine } from "react-icons/ri";

export default function Header({ t, username, onLogout, lang, setLang, onNavigate }) {
    const [dollarRate, setDollarRate] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [activeMenu, setActiveMenu] = useState('home'); // DEFAULT: home

    useEffect(() => {
        fetch("https://api.exchangerate-api.com/v4/latest/USD")
            .then((res) => res.json())
            .then((data) => setDollarRate(data.rates.UZS))
            .catch((err) => console.error("API error:", err));

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            const defaultUser = {
                id: "694b9f30bf3e549a91a054b8",
                username: "azimjon",
                FullName: "Azimjon Mamutaliyev",
                PhoneNumber: "+998901234567"
            };
            localStorage.setItem('user', JSON.stringify(defaultUser));
            setUser(defaultUser);
        }

        // localStorage dan oxirgi sahifani o'qish, agar yo'q bo'lsa — home
        const savedPage = localStorage.getItem('activePage');
        const initialPage = savedPage || 'home';
        setActiveMenu(initialPage);
        onNavigate(initialPage);
    }, [onNavigate]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
        localStorage.setItem('activePage', menu);
        onNavigate(menu);
        setIsSidebarOpen(false);
    };

    return (
        <>
            <header className="header">
                <div className="mainHeader">
                    <div className="dollarRate">
                        <p>Markaziy Banki</p>
                        <p className="dollar-toggle">
                            1$ = {dollarRate?.toLocaleString("uz-UZ")} so'm
                        </p>
                    </div>
                    <span className="logo-left">
                        {
                            (activeMenu === 'home' || activeMenu === 'finance') ?
                                <button className="diagnostic-btn" onClick={() => handleMenuClick('diagnostic')}>
                                    <RiStethoscopeLine size={20} />
                                    <span>Diagnostika</span>
                                </button>
                                :
                                <button className="diagnostic-btn" onClick={() => handleMenuClick('home')}>
                                    Asosiy
                                </button>
                        }
                        <button onClick={toggleSidebar} className="user-btn">
                            <BsPersonCircle size={28} />
                        </button>
                    </span>
                </div>
            </header>

            <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`user-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Foydalanuvchi</h3>
                    <button onClick={toggleSidebar} className="close-btn">
                        <BsX size={28} />
                    </button>
                </div>

                <div className="user-info">
                    <div className="avatar-placeholder">
                        <BsPersonCircle size={80} />
                    </div>
                    <h4>{user?.FullName}</h4>
                    <p>{user?.PhoneNumber}</p>
                </div>

                <nav className="sidebar-menu">
                    <ul>
                        <li
                            className={`menu-item ${activeMenu === 'home' ? 'active' : ''}`}
                            onClick={() => handleMenuClick('home')}
                        >
                            <span>Asosiy Sahifa</span>
                        </li>
                        <li
                            className={`menu-item ${activeMenu === 'finance' ? 'active' : ''}`}
                            onClick={() => handleMenuClick('finance')}
                        >
                            <span>Moliya bo'limi</span>
                        </li>
                        <li
                            className={`menu-item ${activeMenu === 'warehouse' ? 'active' : ''}`}
                            onClick={() => handleMenuClick('warehouse')}
                        >
                            <span>Ehtiyot qismlar</span>
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={onLogout} className="logout-sidebar-btn">
                        {t.logout}
                    </button>
                </div>
            </aside>
        </>
    );
}