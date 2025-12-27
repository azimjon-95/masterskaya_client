// components/NotificationProvider.jsx
import React, { createContext, useContext, useState } from "react";
import "./NotificationProvider.css"; // CSS alohida fayl

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const showNotification = (message, type = "success") => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);

        // 3 sekunddan keyin avtomatik o'chirish
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 3000);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            <div className="notification-container">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`notification ${notif.type}`}
                    >
                        {notif.message}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}
