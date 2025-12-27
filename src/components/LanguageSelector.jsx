// src/components/LanguageSelector.jsx
import { Globe } from 'lucide-react';

export default function LanguageSelector({ lang, setLang }) {
    return (
        <div className="lang-selector">
            <Globe size={18} />
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="uz">O'zbekcha</option>
                <option value="ru">Русский</option>
            </select>
        </div>
    );
}