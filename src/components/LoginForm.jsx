// src/components/LoginForm.jsx
import { Smartphone, User, Lock } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function LoginForm({ username, setUsername, password, setPassword, lang, setLang, onLogin, t }) {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') onLogin();
    };

    return (
        <div className="login-container">
            <div className="login-box animate-slide-up">
                <div className="login-header">
                    <Smartphone className="login-icon" />
                    <h1>{t.repairShop}</h1>
                </div>
                <div className="login-form">
                    <div className="form-group">
                        <label><User size={20} /> {t.username}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="admin"
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={20} /> {t.password}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="admin123"
                        />
                    </div>
                    {/* <LanguageSelector lang={lang} setLang={setLang} /> */}
                    <button type="button" onClick={onLogin} className="login-btn">
                        {t.loginButton}
                    </button>
                </div>
            </div>
        </div>
    );
}