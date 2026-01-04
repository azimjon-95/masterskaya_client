import React, { useState, useEffect } from 'react';
import { useGetDashboardQuery, useRefetchDashboardMutation } from '../../context/dashboardApi';
import socket from '../../socket';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './style.css';

const Dashboard = () => {
    const [refetchDashboard] = useRefetchDashboardMutation();
    const getCurrentMonth = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        return `${y}.${m}`;
    };

    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const { data: dashboardData, isLoading, refetch } = useGetDashboardQuery(selectedMonth);

    // Socket.io real-time yangilanishlar
    useEffect(() => {
        socket.on('dashboard-update', () => {
            refetch();
            refetchDashboard();
        });

        return () => socket.disconnect();
    }, [refetch]);


    const formatCurrency = (value) => {
        return new Intl.NumberFormat('uz-UZ').format(value) + ' so\'m';
    };

    const COLORS = {
        income: '#10b981',
        expense: '#ef4444',
        profit: '#3b82f6',
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899'
    };

    const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    if (isLoading) {
        return (
            <div className="dashboard-loading-container">
                <div className="dashboard-loading-spinner"></div>
                <p className="dashboard-loading-text">Yuklanmoqda...</p>
            </div>
        );
    }

    const data = dashboardData?.innerData || {
        chart: [],
        topIncome: [],
        topExpense: [],
        income: 0,
        expense: 0,
        profit: 0,
        balance: 0,
        store: { count: 0, extiyot: { count: 0, sum: 0 }, aksessuar: { count: 0, sum: 0 } }
    };

    return (
        <div className="dashboard-main-wrapper">
            {/* Header Section */}
            <div className="dashboard-header-section">
                <div className="dashboard-header-content">
                    <h1 className="dashboard-main-title">📊 Monitoring</h1>
                    <input
                        className="dashboard-month-selector"
                        type="month"
                        value={selectedMonth.replace(".", "-")}
                        onChange={(e) => {
                            const value = e.target.value; // "2026-01"
                            if (!value) return;

                            const [year, month] = value.split("-");
                            setSelectedMonth(`${year}.${month}`);
                        }}
                    />

                </div>
            </div>

            {/* Stats Cards */}
            <div className="dashboard-stats-grid">
                <div className="dashboard-stat-card dashboard-stat-card-income">
                    <div className="dashboard-stat-icon">💰</div>
                    <div className="dashboard-stat-content">
                        <p className="dashboard-stat-label">Daromad</p>
                        <p className="dashboard-stat-value">{formatCurrency(data.income)}</p>
                    </div>
                </div>

                <div className="dashboard-stat-card dashboard-stat-card-expense">
                    <div className="dashboard-stat-icon">💸</div>
                    <div className="dashboard-stat-content">
                        <p className="dashboard-stat-label">Xarajat</p>
                        <p className="dashboard-stat-value">{formatCurrency(data.expense)}</p>
                    </div>
                </div>

                <div className="dashboard-stat-card dashboard-stat-card-profit">
                    <div className="dashboard-stat-icon">📈</div>
                    <div className="dashboard-stat-content">
                        <p className="dashboard-stat-label">Foyda</p>
                        <p className="dashboard-stat-value">{formatCurrency(data.profit)}</p>
                    </div>
                </div>

                <div className="dashboard-stat-card dashboard-stat-card-balance">
                    <div className="dashboard-stat-icon">💳</div>
                    <div className="dashboard-stat-content">
                        <p className="dashboard-stat-label">Balans</p>
                        <p className="dashboard-stat-value">{formatCurrency(data.balance)}</p>
                    </div>
                </div>

                <div className="dashboard-stat-card dashboard-stat-card-given">
                    <div className="dashboard-stat-icon">💳</div>
                    <div className="dashboard-stat-content">
                        <p className="dashboard-stat-label">Berilgan qarz</p>
                        <p className="dashboard-stat-value">{formatCurrency(data.debts.given)}</p>
                    </div>
                </div>

                <div className="dashboard-stat-card dashboard-stat-card-taken">
                    <div className="dashboard-stat-icon">💳</div>
                    <div className="dashboard-stat-content">
                        <p className="dashboard-stat-label">Olingan qarz</p>
                        <p className="dashboard-stat-value">{formatCurrency(data.debts.taken)}</p>
                    </div>
                </div>
            </div>

            {/* Line Chart - Kunlik hisobot */}
            <div className="dashboard-chart-card">
                <h2 className="dashboard-chart-title">{" "} 📅 Kunlik moliyaviy hisobot</h2>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data.chart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 11 }}
                            stroke="#6b7280"
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="#6b7280"
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                            formatter={(value) => formatCurrency(value)}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '12px' }}
                            iconType="circle"
                        />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke={COLORS.income}
                            strokeWidth={2.5}
                            name="Daromad"
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            stroke={COLORS.expense}
                            strokeWidth={2.5}
                            name="Xarajat"
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top Income & Expense */}
            <div className="dashboard-top-charts-grid">
                {/* Top Daromadlar */}
                <div className="dashboard-chart-card">
                    <h2 className="dashboard-chart-title">🔝 Top daromadlar</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.topIncome} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="_id"
                                tick={{ fontSize: 10 }}
                                stroke="#6b7280"
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                stroke="#6b7280"
                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Bar dataKey="total" fill={COLORS.income} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Xarajatlar */}
                <div className="dashboard-chart-card">
                    <h2 className="dashboard-chart-title">🔻 Top xarajatlar</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <Pie
                                data={data.topExpense}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="total"
                            >
                                {data.topExpense.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                formatter={(value) => formatCurrency(value)}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Store Statistics */}
            <div className="dashboard-store-section">
                <h2 className="dashboard-section-title">🏪 Ombor statistikasi</h2>

                <div className="dashboard-store-grid">
                    <div className="dashboard-store-card dashboard-store-card-total">
                        <div className="dashboard-store-icon">📦</div>
                        <div className="dashboard-store-content">
                            <p className="dashboard-store-label">Jami mahsulotlar</p>
                            <p className="dashboard-store-value">{data.store.count} ta</p>
                        </div>
                    </div>

                    <div className="dashboard-store-card dashboard-store-card-extiyot">
                        <div className="dashboard-store-icon">🔧</div>
                        <div className="dashboard-store-content">
                            <p className="dashboard-store-label">Ehtiyot qismlar</p>
                            <p className="dashboard-store-count">{data.store.extiyot.count} ta</p>
                            <p className="dashboard-store-sum">{formatCurrency(data.store.extiyot.sum)}</p>
                        </div>
                    </div>

                    <div className="dashboard-store-card dashboard-store-card-aksessuar">
                        <div className="dashboard-store-icon">📱</div>
                        <div className="dashboard-store-content">
                            <p className="dashboard-store-label">Aksessuarlar</p>
                            <p className="dashboard-store-count">{data.store.aksessuar.count} ta</p>
                            <p className="dashboard-store-sum">{formatCurrency(data.store.aksessuar.sum)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;