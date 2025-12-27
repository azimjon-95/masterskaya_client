// src/pages/LoginPage.jsx
import { useState } from "react";
import LoginForm from "../components/LoginForm";
import { translations } from "../translations";
import { useLoginMutation } from "../context/adminApi"; // yoki authApi

export default function LoginPage({ onLogin }) {
    const [form, setForm] = useState({ username: "", password: "" });
    const [lang, setLang] = useState("uz");
    const t = translations[lang];

    // RTK Query mutation
    const [login, { isLoading }] = useLoginMutation();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const result = await login(form).unwrap(); // credentials: { username, password }
            // token va user info localStorage ga saqlash
            localStorage.setItem("token", result?.innerData?.token);
            localStorage.setItem("user", JSON.stringify(result?.innerData?.user));

            onLogin(result?.innerData?.user.username, lang);
        } catch (err) {
            console.error(err);
            alert(lang === "uz" ? "Login yoki parol xato!" : "Неверный логин или пароль!");
        }
    };

    return (
        <LoginForm
            username={form.username}
            password={form.password}
            setUsername={(val) => setForm((prev) => ({ ...prev, username: val }))}
            setPassword={(val) => setForm((prev) => ({ ...prev, password: val }))}
            lang={lang}
            setLang={setLang}
            onLogin={handleLogin}
            t={t}
            isLoading={isLoading}
        />
    );
}
