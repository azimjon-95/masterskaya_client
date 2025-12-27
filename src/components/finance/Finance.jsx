// src/pages/FinancePage.jsx
import { useNotification } from "../../components/Notification/NotificationToast";
import { useState } from 'react';
import { Trash2, Edit2, Loader2 } from 'lucide-react';
import {
    useGetFinanceDataQuery,
    useGetBalanceQuery,
    useCreateTransactionMutation,
    useDeleteTransactionMutation,
} from "../../context/financeApi";

import './style.css';

// Kirim kategoriyalari
const incomeCategories = [
    "Telefon ta'mirlash xizmati",
    "Ekranni almashtirish",
    "Batareya almashtirish",
    "Zaryadka uyasi ta'mirlash",
    "Kamera ta'mirlash",
    "Dynamic (ovoz) ta'mirlash",
    "Suvdan chiqarish / quritish",
    "Dasturiy ta'minot (proshivka, unlock)",
    "Aksessuar sotuv",
    "Telefon sotuv",
    "Qurilma sotib olish (mijozdan)",
    "Oldindan to'lov / avans",
    "Kafolat bo'yicha ta'mirlash",
    "Boshqa xizmatlar",
    "Boshqa kirim",
];

// Chiqim kategoriyalari
const expenseCategories = [
    "Zapchast xaridi",
    "Asbob-uskuna xaridi",
    "Ish haqi (usta va yordamchilarga)",
    "Do'kon ijarasi",
    "Kommunal to'lovlar (elektr, suv)",
    "Internet va telefon aloqasi",
    "Reklama",
    "Transport xarajati",
    "Bank komissiyasi / terminallar",
    "Soliq va patent to'lovlari",
    "Ofis materiallari",
    "Ta'mirlash materiallari",
    "Kafolat bo'yicha qaytarilgan pul",
    "Jarima yoki zarar to'lovlari",
    "Boshqa chiqim",
    "Nonushta",
];

// O‘zbekcha oy nomlari
const uzbekMonths = [
    "Yan", "Fev", "Mart", "Apr",
    "May", "Iyun", "Iyul", "Avg",
    "Sent", "Okt", "Noy", "Dek"
];
const formatUzbekDate = (dateString) => {
    const date = new Date(dateString);

    let day = date.getDate();
    let month = uzbekMonths[date.getMonth()];
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}-${month} / ${hours}:${minutes}`;
};
export default function FinancePage({ t }) {
    const { showNotification } = useNotification();

    // Joriy yil va oy (hozir: Dekabr 2025)
    const currentYear = new Date().getFullYear(); // 2025
    const currentMonthIndex = new Date().getMonth(); // 11 (Dekabr)
    const [selectedFilter, setSelectedFilter] = useState(null);
    // Oy va yilni tanlash uchun state
    const [selectedMonth, setSelectedMonth] = useState({
        year: currentYear,
        monthIndex: currentMonthIndex, // default: hozirgi oy
    });

    // Forma ma'lumotlari
    const [formData, setFormData] = useState({
        type: 'income',
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
    });

    // Backend'ga jo'natiladigan month parametri
    // Agar "Barcha oylar" tanlansa → undefined (barcha tranzaksiyalar)
    const monthParam = selectedMonth.monthIndex === -1
        ? undefined
        : `${selectedMonth.year}.${String(selectedMonth.monthIndex + 1).padStart(2, '0')}`;

    // RTK Query so'rovlari
    const {
        data: financeData,
        isLoading: isLoadingFinance,
        refetch: refetchFinance,
    } = useGetFinanceDataQuery(monthParam);

    const { data: balanceData, isFetching: isFetchingBalance } = useGetBalanceQuery();

    const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation();
    const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();

    // Ma'lumotlar
    const transactions = financeData?.innerData?.transactions || [];
    const stats = financeData?.innerData?.stats || {};
    const currentBalance = balanceData?.innerData?.totalMoney ?? stats.balance ?? 0;

    // Yangi tranzaksiya qo'shish
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description.trim() || !formData.category.trim() || !formData.amount || formData.amount <= 0) {
            showNotification("Barcha maydonlarni to'g'ri to'ldiring!", "error");
            return;
        }

        try {
            await createTransaction({
                type: formData.type,
                description: formData.description.trim(),
                category: formData.category.trim(),
                amount: Number(formData.amount),
                date: formData.date,
            }).unwrap();

            refetchFinance();
            isFetchingBalance();
            // Formani tozalash
            setFormData({
                type: 'income',
                description: '',
                amount: '',
                category: '',
                date: new Date().toISOString().split('T')[0],
            });

            showNotification("Tranzaksiya muvaffaqiyatli qo'shildi!", "success");
        } catch (err) {
            showNotification("Xato: " + (err.data?.message || "Tranzaksiya qo'shilmadi"), "error");
        }
    };

    // Tranzaksiyani o'chirish
    const handleDelete = async (id) => {
        try {
            await deleteTransaction(id).unwrap();

            showNotification("Tranzaksiya muvaffaqiyatli o'chirildi!", "success");
            refetchFinance(); // yangilash
        } catch (err) {
            showNotification("O'chirishda xato: " + (err.data?.message || "Noma'lum xato"), "error");
        }
    };

    // Loading holati
    if (isLoadingFinance) {
        return (
            <div className="finance-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                <Loader2 size={48} className="animate-spin" />
                <span style={{ marginLeft: 16, fontSize: '1.2rem' }}>Yuklanmoqda...</span>
            </div>
        );
    }

    return (
        <div className="finance-container">
            {/* Umumiy statistika */}
            <div className="finance-stats">
                <div className="stat-card_finance income">
                    <h3>{t?.totalIncome || "Jami kirim"}</h3>
                    <p>{(stats.totalIncome || 0).toLocaleString("uz-UZ")} so'm</p>
                </div>
                <div className="stat-card_finance expense">
                    <h3>{t?.totalExpense || "Jami chiqim"}</h3>
                    <p>{(stats.totalExpense || 0).toLocaleString("uz-UZ")} so'm</p>
                </div>
                <div className="stat-card_finance balance" style={{ backgroundColor: currentBalance >= 0 ? '#e6f4ea' : '#fce8e6' }}>
                    <h3>{t?.balance || "Balans"} {isFetchingBalance && <Loader2 size={16} className="animate-spin inline" />}</h3>
                    <p style={{ color: currentBalance >= 0 ? '#137333' : '#d32f2f' }}>
                        {currentBalance.toLocaleString("uz-UZ")} so'm
                    </p>
                </div>
            </div>

            <div className="finance-content">
                {/* Chap: Forma */}
                <div className="finance-form-section">
                    <form className="transaction-form_finance">
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            <option value="income">Kirim</option>
                            <option value="expense">Chiqim</option>
                        </select>

                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="" disabled>Kategoriyani tanlang</option>
                            {(formData.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Izoh (masalan: Buyurtma to'lovi)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />

                        <input
                            type="number"
                            placeholder="Summa (so'mda)"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            min="1"
                            required
                        />

                        <button onClick={handleSubmit} type="submit" className="submit-btn_finance" disabled={isCreating}>
                            {isCreating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Saqlanmoqda...
                                </>
                            ) : (
                                "Saqlash"
                            )}
                        </button>
                    </form>
                </div>

                {/* O'ng: Jadval */}
                <div className="finance-table-section">
                    <div className="section-header_finance">
                        <h2>{t?.transactions || "Tranzaksiyalar tarixi"}</h2>

                        {/* Oy va yil tanlash */}
                        <div className="month-selector" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <span style={{ fontWeight: '500' }}>Filtr:</span>

                            <select
                                value={selectedMonth.monthIndex}
                                onChange={(e) => setSelectedMonth({ ...selectedMonth, monthIndex: Number(e.target.value) })}
                                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
                            >
                                {uzbekMonths.map((monthName, index) => (
                                    <option key={index} value={index}>
                                        {monthName}
                                    </option>
                                ))}
                            </select>

                            <select
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
                            >

                                <option value="all">Hammasi</option>
                                <option value="income">Kirim</option>
                                <option value="expense">Chiqim</option>

                            </select>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <div className="table-scroll-container">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Sana</th>
                                        <th>Turi</th>
                                        <th>Izoh</th>
                                        <th>Kategoriya</th>
                                        <th>Summa</th>
                                        <th>O'chirish</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                                                {selectedMonth.monthIndex === -1
                                                    ? "Hali tranzaksiya yo'q"
                                                    : `${uzbekMonths[selectedMonth.monthIndex]} ${selectedMonth.year} oyida tranzaksiya topilmadi`}
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions
                                            .filter((trans) => {
                                                if (!selectedFilter || selectedFilter === "all") return true;
                                                return trans.type === selectedFilter;
                                            })
                                            .map((trans) => (
                                                <tr key={trans._id || trans.id}>
                                                    <td>
                                                        {formatUzbekDate(trans.date)}
                                                    </td>
                                                    <td>
                                                        <span className={`type-badge ${trans.type}`}>
                                                            {trans.type === 'income' ? 'Kirim' : 'Chiqim'}
                                                        </span>
                                                    </td>
                                                    <td>{trans.description}</td>
                                                    <td>{trans.category}</td>
                                                    <td style={{ color: trans.type === 'income' ? '#137333' : '#d32f2f' }}>
                                                        {trans.amount.toLocaleString("uz-UZ")} so'm
                                                    </td>
                                                    <td>
                                                        <div className="fin_actions">
                                                            {/* <button className="action-btn edit" title="Tahrirlash (kelajakda)">
                                                                <Edit2 size={16} />
                                                            </button> */}
                                                            <button
                                                                onClick={() => handleDelete(trans._id || trans.id)}
                                                                className="action-btn delete"
                                                                disabled={isDeleting}
                                                                title="O'chirish"
                                                            >
                                                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}