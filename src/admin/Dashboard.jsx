import React, { useState, useEffect } from "react";
import { Users, Package, Contact, LogOut, Menu, X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Added for redirect
import AdminsTable from "./AdminsTable";
import BazsStationForm from "./form/BazsStationForm";
import ContactsTable from "./ContactsTable";
import "./css/style.css";

const translations = {
  uz: {
    title: "Admin Panel",
    admins: "Adminlar",
    products: "BAZS",
    contacts: "Kontaktlar",
    logout: "Chiqish",
    search: "Qidirish...",
    logoutMessage: "Chiqish muvaffaqiyatli. Iltimos, qayta kiring.",
  },
  ru: {
    title: "Админ-панель",
    admins: "Админ",
    products: "БАЗС",
    contacts: "Контакты",
    logout: "Выйти",
    search: "Поиск...",
    logoutMessage: "Выход успешен. Пожалуйста, войдите снова.",
  },
  en: {
    title: "Admin Panel",
    admins: "Admins",
    products: "BAZS",
    contacts: "Contacts",
    logout: "Logout",
    search: "Search...",
    logoutMessage: "Logout successful. Please log in again.",
  },
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("admins");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("language") || "uz";
    } catch (e) {
      console.warn("localStorage is not available:", e);
      return "uz";
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate(); // For redirect

  useEffect(() => {
    try {
      localStorage.setItem("language", lang);
    } catch (e) {
      console.warn("Cannot set localStorage:", e);
    }
  }, [lang]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      navigate(`/${lang}/admin/service`); // Redirect to login page
      // Fallback if not using react-router-dom:
      // window.location.href = '/login';
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  if (!isLoggedIn) {
    return <div>{translations[lang].logoutMessage}</div>;
  }

  return (
    <div className="dash-container">
      <div className={`dash-sidebar ${sidebarOpen ? "dash-sidebar-open" : ""}`}>
        <div className="dash-sidebar-header">
          <h2 className="dash-logo">{translations[lang].title}</h2>
          <button
            className="dash-sidebar-toggle dash-desktop-hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="dash-nav">
          <button
            className={`dash-nav-item ${activeTab === "admins" ? "dash-nav-active" : ""
              }`}
            onClick={() => {
              setActiveTab("admins");
              setSidebarOpen(false);
            }}
          >
            <Users size={20} />
            <span>{translations[lang].admins}</span>
          </button>
          <button
            className={`dash-nav-item ${activeTab === "products" ? "dash-nav-active" : ""
              }`}
            onClick={() => {
              setActiveTab("products");
              setSidebarOpen(false);
            }}
          >
            <Package size={20} />
            <span>{translations[lang].products}</span>
          </button>
          <button
            className={`dash-nav-item ${activeTab === "contacts" ? "dash-nav-active" : ""
              }`}
            onClick={() => {
              setActiveTab("contacts");
              setSidebarOpen(false);
            }}
          >
            <Contact size={20} />
            <span>{translations[lang].contacts}</span>
          </button>
        </nav>

        <div className="dash-sidebar-footer">
          <button className="dash-nav-item dash-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>{translations[lang].logout}</span>
          </button>
        </div>
      </div>

      <div className="dash-main">
        <header className="dash-header">
          <button
            className="dash-sidebar-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>

          <div className="dash-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={translations[lang].search}
              className="dash-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="dash-lang">
            <button
              className={`dash-lang-btn ${lang === "uz" ? "dash-lang-active" : ""
                }`}
              onClick={() => handleLangChange("uz")}
            >
              UZ
            </button>
            <button
              className={`dash-lang-btn ${lang === "ru" ? "dash-lang-active" : ""
                }`}
              onClick={() => handleLangChange("ru")}
            >
              RU
            </button>
            <button
              className={`dash-lang-btn ${lang === "en" ? "dash-lang-active" : ""
                }`}
              onClick={() => handleLangChange("en")}
            >
              EN
            </button>
          </div>
        </header>

        <main className="dash-content">
          {activeTab === "admins" && (
            <AdminsTable lang={lang} searchTerm={searchTerm} />
          )}
          {activeTab === "products" && (
            <BazsStationForm lang={lang} searchTerm={searchTerm} />
          )}
          {activeTab === "contacts" && (
            <ContactsTable lang={lang} searchTerm={searchTerm} />
          )}
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="dash-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
