import { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import StatsCard from '../components/StatsCard';
import OrderTable from '../components/Order/OrderTable';
import Diagnostic from '../components/diagnostic/Diagnostic';
import PartsWarehouse from '../components/partsWarehouse/PartsWarehouse';
import AddOrderModal from '../components/addOrder/AddOrderModal';
import { Clock, Wrench, CheckCircle, Boxes, CircleOff } from 'lucide-react';
import { translations } from '../translations';
import { useGetOrdersQuery } from '../context/orderApi';
import './style/DashboardPage.css'
import FinancePage from '../components/finance/Finance';

export default function DashboardPage({ username, lang, setLang, onLogout }) {
    const [showAddOrder, setShowAddOrder] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('active');
    const [currentPage, setCurrentPage] = useState('home');
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const [selectedMonth, setSelectedMonth] = useState(`${currentYear}.${currentMonth}`);

    const t = translations[lang];

    const uzMonths = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
    ];

    // RTK Query orqali ma'lumot olish
    const { data, isLoading, refetch } = useGetOrdersQuery(
        { month: selectedMonth, filter: selectedFilter },
        {
            refetchOnMountOrArgChange: true,
            refetchOnReconnect: true,
            skip: !selectedMonth
        }
    );
    const handleNavigate = (page) => {
        setCurrentPage(page);
        localStorage.setItem('activePage', page);
    };
    // Serverdan kelgan tayyor ma'lumotlar
    const orders = data?.innerData?.orders || [];
    const stats = data?.innerData?.stats || { pending: 0, inProgress: 0, ready: 0 };
    // localStorage dan oxirgi tanlangan sahifani o'qish
    useEffect(() => {
        const savedPage = localStorage.getItem('activePage');
        if (savedPage && ['home', 'finance', 'users', 'warehouse', 'diagnostic'].includes(savedPage)) {
            setCurrentPage(savedPage);
        } else {
            // Agar yo'q bo'lsa yoki noto'g'ri bo'lsa — home qilamiz
            setCurrentPage('home');
            localStorage.setItem('activePage', 'home');
        }
    }, []);
    // Client-side search (faqat ism va model bo'yicha)
    const filteredOrders = orders.filter(order =>
        search === '' ||
        (order.customerName?.toLowerCase().includes(search.toLowerCase())) ||
        (order.phoneModel?.toLowerCase().includes(search.toLowerCase())) ||
        (order.phoneNumber?.includes(search))
    );

    return (
        <div className="app-container">
            <Header onNavigate={handleNavigate} t={t} username={username} onLogout={onLogout} lang={lang} setLang={setLang} />

            <main className="main-content">
                {currentPage === 'home' && (
                    <>
                        {/* Stats — serverdan kelgan to'g'ri sonlar */}
                        <div className="stats-grid animate-slide-up">
                            <StatsCard
                                count={stats.pending}
                                title={t.pending || "Kutilmoqda"}
                                icon={Clock}
                                colorClass="stat-new"
                            />
                            <StatsCard
                                count={stats.inProgress}
                                title={t.inProgress || "Jarayonda"}
                                icon={Wrench}
                                colorClass="stat-progress"
                            />
                            <StatsCard
                                count={stats.ready}
                                title={t.ready || "Tayyor"}
                                icon={CheckCircle}
                                colorClass="stat-completed"
                            />
                            <StatsCard
                                count={stats.collected}
                                title={t.ready || "Moffaqiyatli"}
                                icon={Boxes}
                                colorClass="stat-completed"
                            />
                            <StatsCard
                                count={stats.failed}
                                title={t.ready || "Tuzalmaganlar"}
                                icon={CircleOff}
                                colorClass="stat-failed"
                            />
                        </div>

                        <div className="orders-section">
                            <div className="section-header">
                                <h2>{t.orders}</h2>

                                {/* Qidiruv */}
                                <input
                                    type="text"
                                    placeholder={t.search || "Qidirish..."}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="search-input"
                                />

                                {/* Status filter (active/history/failed) */}
                                <select
                                    className="calendar-input"
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                >
                                    <option value="active">Faol buyurtmalar</option>
                                    <option value="history">Tarix (Olib ketilgan)</option>
                                    <option value="failed">Tuzalmaganlar</option>
                                </select>

                                {/* Oy tanlash */}
                                <select
                                    className="calendar-input"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    {uzMonths.map((monthName, index) => {
                                        const monthNumber = String(index + 1).padStart(2, '0');
                                        const value = `${currentYear}.${monthNumber}`;
                                        return (
                                            <option key={value} value={value}>
                                                {monthName}
                                            </option>
                                        );
                                    })}
                                </select>

                                <button onClick={() => setShowAddOrder(true)} className="add-btn-cre">
                                    + <p>{t.addOrder}</p>
                                </button>
                            </div>

                            {/* Modal — yangi buyurtma qo'shish */}
                            {showAddOrder && (
                                <AddOrderModal
                                    t={t}
                                    onClose={() => setShowAddOrder(false)}
                                    refreshOrders={refetch} // muhim: qo'shgandan keyin refetch
                                />
                            )}

                            {/* Jadval — faqat serverdan kelgan + qidiruv bo'yicha filtrlangan */}
                            <OrderTable
                                orders={filteredOrders}
                                t={t}
                                isLoading={isLoading}
                                refreshOrders={refetch}
                            />
                        </div>
                    </>
                )}
                {currentPage === 'finance' && (
                    <FinancePage />
                )}
                {currentPage === 'diagnostic' && (
                    <Diagnostic />
                )}
                {currentPage === 'warehouse' && (
                    <PartsWarehouse />
                )}

            </main>
        </div>
    );
}