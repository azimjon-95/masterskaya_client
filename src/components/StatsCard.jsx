// src/components/StatsCard.jsx
export default function StatsCard({ count, title, icon: Icon, colorClass }) {
    return (
        <div className={`stat-card ${colorClass}`}>
            <Icon className="stat-icon" />
            <div className="stat-info">
                <h3>{count}</h3>
                <p>{title}</p>
            </div>
        </div>
    );
}