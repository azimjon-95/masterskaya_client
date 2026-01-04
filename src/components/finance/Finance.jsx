// // src/pages/FinancePage.jsx
import { useNotification } from "../../components/Notification/NotificationToast";
import { useState } from 'react';
import { Trash2, Loader2, Eye } from 'lucide-react';
import {
    useGetFinanceDataQuery,
    useGetBalanceQuery,
    useCreateTransactionMutation,
    useDeleteTransactionMutation,
    useGetDebtorsQuery,
    usePayDebtByPhoneMutation
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
    "Qarz qaytarildi",
    "Qarz olish",
];

// Chiqim kategoriyalari
const expenseCategories = [
    "O'zimni ehtiyojlarimga",
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
    "Qarz berish",
    "Qarzni qaytarish",
];

// O‘zbekcha oy nomlari
const uzbekMonths = [
    "Yan", "Fev", "Mart", "Apr",
    "May", "Iyun", "Iyul", "Avg",
    "Sent", "Okt", "Noy", "Dek"
];

const formatUzbekDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = uzbekMonths[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}-${month} / ${hours}:${minutes}`;
};

export default function FinancePage({ t }) {
    const { showNotification } = useNotification();

    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    const [selectedFilter, setSelectedFilter] = useState(null);


    const [payDebtByPhone, { isLoading: isPayingDebt }] = usePayDebtByPhoneMutation();

    const [selectedMonth, setSelectedMonth] = useState({
        year: currentYear,
        monthIndex: currentMonthIndex,
    });

    const availableYears = [];
    for (let y = currentYear - 5; y <= currentYear + 1; y++) {
        availableYears.push(y);
    }

    // Forma ma'lumotlari
    const [formData, setFormData] = useState({
        type: 'income',
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
    });

    // Qarzga oid qo'shimcha ma'lumotlar
    const [debtData, setDebtData] = useState({
        debtType: null,
        fullName: '',
        phone: '',
        dueDate: '',
    });

    // Delete va detail modal state'lari
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    // Backend parametrlari
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
    const { data: debtsData } = useGetDebtorsQuery();
    const activeDebts = debtsData?.innerData || [];

    const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation();
    const [deleteTransaction] = useDeleteTransactionMutation();

    // Ma'lumotlar
    const transactions = financeData?.innerData?.transactions || [];
    const stats = financeData?.innerData?.stats || {};
    const currentBalance = balanceData?.innerData?.totalMoney ?? stats.balance ?? 0;

    // Yordamchi funksiyalar
    const isDebtRelatedCategory = (category) => {
        return [
            "Qarz berish",
            "Qarz olish",
        ].includes(category);
    };

    const getDebtTypeFromCategory = (category) => {
        if (category === "Qarz berish") return "given";
        if (category === "Qarz olish") return "taken";
        return null;
    };

    const isDebtReturnCategory = (category) => {
        return category === "Qarz qaytarildi" || category === "Qarzni qaytarish";
    };

    // Yangi tranzaksiya qo'shish
    const [selectedDebtForPayment, setSelectedDebtForPayment] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Majburiy maydonlarni tekshirish
        if (!formData.description.trim() || !formData.category.trim() || !formData.amount || formData.amount <= 0) {
            showNotification("Barcha maydonlarni to'g'ri to'ldiring!", "error");
            return;
        }

        // Qarz qaytarish kategoriyalari uchun maxsus logika
        if (formData.category === "Qarzni qaytarish" || formData.category === "Qarz qaytarildi") {
            if (!selectedDebtForPayment) {
                showNotification("Iltimos, qaytarilayotgan qarzni tanlang!", "error");
                return;
            }

            try {
                await payDebtByPhone({
                    phone: selectedDebtForPayment.phone.trim(),
                    amount: Number(formData.amount),
                    type: formData.type
                }).unwrap();

                showNotification(
                    `${selectedDebtForPayment.fullName} (${selectedDebtForPayment.phone}) bo‘yicha ${Number(formData.amount).toLocaleString()} so‘m qarz muvaffaqiyatli yopildi! ✅`,
                    "success"
                );

                // Formani tozalash
                setFormData({
                    type: 'income',
                    description: '',
                    amount: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                });
                setSelectedDebtForPayment(null);
                refetchFinance();
                return;
            } catch (err) {
                showNotification(
                    err?.data?.message || "Qarzni yopishda xatolik yuz berdi",
                    "error"
                );
                return;
            }
        }

        // Qarz berish/olishda F.I.Sh majburiy
        if (isDebtRelatedCategory(formData.category)) {
            if (!debtData.fullName.trim() || debtData.fullName.length < 3) {
                showNotification("F.I.Sh to'g'ri kiritilmadi!", "error");
                return;
            }
        }

        try {
            const payload = {
                type: formData.type,
                description: formData.description.trim(),
                category: formData.category.trim(),
                amount: Number(formData.amount),
                date: formData.date,
            };

            // Yangi qarz yaratish
            if (isDebtRelatedCategory(formData.category)) {
                payload.debt = {
                    debtType: getDebtTypeFromCategory(formData.category),
                    amount: Number(formData.amount),
                    fullName: debtData.fullName.trim(),
                    phone: debtData.phone.trim() || undefined,
                    dueDate: debtData.dueDate ? new Date(debtData.dueDate) : undefined,
                };
            }

            await createTransaction(payload).unwrap();

            // Tozalash
            setFormData({
                type: 'income',
                description: '',
                amount: '',
                category: '',
                date: new Date().toISOString().split('T')[0],
            });
            setDebtData({ debtType: null, fullName: '', phone: '', dueDate: '' });
            setSelectedDebtForPayment(null);

            showNotification("Tranzaksiya muvaffaqiyatli qo'shildi! ✅", "success");
            refetchFinance();
        } catch (err) {
            showNotification("Xato: " + (err?.data?.message || "Tranzaksiya qo'shilmadi"), "error");
        }
    };

    // O'chirish tasdiqlash
    const handleDeleteConfirm = async (id) => {
        try {
            await deleteTransaction(id).unwrap();
            showNotification("Tranzaksiya muvaffaqiyatli o'chirildi! ✅", "success");
            refetchFinance();
        } catch (err) {
            showNotification("O'chirishda xato: " + (err.data?.message || "Noma'lum xato"), "error");
        } finally {
            setDeleteConfirmId(null);
        }
    };

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
            {/* Statistika */}
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
                {/* Forma */}
                <div className="finance-form-section">
                    <form className="transaction-form_finance" onSubmit={handleSubmit}>
                        <div className="transaction-form_box">
                            <select
                                value={formData.type}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setFormData({
                                        ...formData,
                                        type: newType,
                                        category: '',
                                    });
                                    setDebtData({ debtType: null, fullName: '', phone: '', dueDate: '' });
                                }}
                                required
                            >
                                <option value="income">Kirim</option>
                                <option value="expense">Chiqim</option>
                            </select>

                            <select
                                value={formData.category}
                                onChange={(e) => {
                                    const cat = e.target.value;
                                    setFormData({ ...formData, category: cat });

                                    const debtType = getDebtTypeFromCategory(cat);
                                    if (debtType) {
                                        setDebtData({ ...debtData, debtType });
                                        setFormData(prev => ({
                                            ...prev,
                                            type: debtType === "given" ? "expense" : "income"
                                        }));
                                    } else {
                                        setDebtData({ debtType: null, fullName: '', phone: '', dueDate: '' });
                                    }
                                }}
                                required
                            >
                                <option value="" disabled>Kategoriyani tanlang</option>
                                {(formData.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Yangi qarz yaratish maydonlari */}
                        {isDebtRelatedCategory(formData.category) && !isDebtReturnCategory(formData.category) && (
                            <>
                                <div className="transaction-form_box">
                                    <input
                                        type="text"
                                        placeholder="F.I.Sh (majburiy)"
                                        value={debtData.fullName}
                                        onChange={(e) => setDebtData({ ...debtData, fullName: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Telefon raqami (ixtiyoriy)"
                                        value={debtData.phone}
                                        onChange={(e) => setDebtData({ ...debtData, phone: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="date"
                                    placeholder="Qaytarish muddati (ixtiyoriy)"
                                    value={debtData.dueDate}
                                    onChange={(e) => setDebtData({ ...debtData, dueDate: e.target.value })}
                                />
                            </>
                        )}

                        {/* Qarz qaytarish uchun mavjud qarzni tanlash */}
                        {(formData.category === "Qarzni qaytarish" || formData.category === "Qarz qaytarildi") && (
                            <select
                                value={selectedDebtForPayment?.phone || ""}
                                onChange={(e) => {
                                    const selected = activeDebts.find(debt => debt.phone === e.target.value);
                                    setSelectedDebtForPayment(selected || null);
                                }}
                                required
                                style={{ fontSize: "13px", padding: "10px", marginBottom: "10px" }}
                            >
                                <option value="" disabled>
                                    Qaytarilayotgan qarzni tanlang
                                </option>
                                {activeDebts.length === 0 ? (
                                    <option disabled>Hech qanday faol qarz yo'q</option>
                                ) : (
                                    activeDebts
                                        .filter(debt => {
                                            const requiredType = formData.category === "Qarzni qaytarish" ? "taken" : "given";
                                            return debt.debtType === requiredType && !debt.isReturned;
                                        })
                                        .map((debt, inx) => (
                                            <option key={inx} value={debt.phone}>
                                                {debt.fullName} – {debt.amount.toLocaleString()} so'm{' '}
                                                {debt.phone ? `(${debt.phone})` : ''}
                                            </option>
                                        ))
                                )}
                            </select>
                        )}

                        <input
                            type="number"
                            placeholder="Summa (so'mda)"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            min="1"
                            required
                        />

                        <textarea
                            placeholder="Izoh (masalan: Buyurtma to'lovi)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />

                        <button type="submit" className="submit-btn_finance" disabled={isCreating || isPayingDebt}>
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

                {/* Jadval */}
                <div className="finance-table-section">
                    <div className="section-header_finance">
                        <h2>{t?.transactions || "Tranzaksiyalar tarixi"}</h2>

                        <div className="month-selector" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <span style={{ fontWeight: '500' }}>Filtr:</span>
                            <select
                                value={selectedMonth.year}
                                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
                                onChange={(e) => setSelectedMonth({ ...selectedMonth, year: Number(e.target.value) })}
                            >
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>

                            <select
                                value={selectedMonth.monthIndex}
                                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
                                onChange={(e) => setSelectedMonth({ ...selectedMonth, monthIndex: Number(e.target.value) })}
                            >
                                <option value={-1}>Barcha oylar</option>
                                {uzbekMonths.map((monthName, index) => (
                                    <option key={index} value={index}>{monthName}</option>
                                ))}
                            </select>

                            <select
                                value={selectedFilter || "all"}
                                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
                                onChange={(e) => setSelectedFilter(e.target.value === "all" ? null : e.target.value)}
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
                                        <th>Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                                                Tranzaksiya topilmadi
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions
                                            .filter((trans) => !selectedFilter || selectedFilter === "all" || trans.type === selectedFilter)
                                            .map((trans) => {
                                                const isPersonal = trans.type === 'expense' && trans.category === "O'zimni ehtiyojlarimga";
                                                const hasDebt = trans.debt && trans.debt.amount > 0;
                                                const isActiveDebt = hasDebt && !trans.debt.isReturned && trans.debt.phone;

                                                return (
                                                    <tr key={trans._id || trans.id}>
                                                        <td>{formatUzbekDate(trans.date)}</td>
                                                        <td>
                                                            <span className={`type-badge ${trans.type} ${isPersonal ? 'personal' : ''}`}>
                                                                {isPersonal ? 'Shaxsiy chiqim' : (trans.type === 'income' ? 'Kirim' : 'Chiqim')}
                                                            </span>
                                                        </td>
                                                        <td style={{ overflow: "hidden" }}>{trans.description || '(izoh yoʻq)'}</td>
                                                        <td>{trans.category}</td>
                                                        <td style={{
                                                            color: trans.type === 'income' ? '#137333' : (isPersonal ? '#e67e22' : '#d32f2f'),
                                                            fontWeight: isPersonal ? '600' : 'normal'
                                                        }}>
                                                            {trans.amount.toLocaleString("uz-UZ")} so'm
                                                        </td>
                                                        <td>
                                                            <div className="fin_actions" style={{ position: 'relative', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                {/* Ko'rish tugmasi */}
                                                                {hasDebt && (
                                                                    <button
                                                                        onClick={() => setSelectedTransaction(trans)}
                                                                        className="action-btn view"
                                                                        title="Tafsilotlarni ko'rish"
                                                                    >
                                                                        <Eye size={16} />
                                                                    </button>
                                                                )}

                                                                {/* O'chirish tugmasi */}
                                                                <div style={{ position: 'relative' }}>
                                                                    <button
                                                                        onClick={() => setDeleteConfirmId(trans._id || trans.id)}
                                                                        className="action-btn delete"
                                                                        title="O'chirish"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>

                                                                    {deleteConfirmId === (trans._id || trans.id) && (
                                                                        <div className="confirm-popover" onClick={(e) => e.stopPropagation()}>
                                                                            <div className="popover-content">
                                                                                <p>Bu tranzaksiyani o'chirmoqchimisiz?</p>
                                                                                <div className="popover-actions">
                                                                                    <button className="btn-cancel" onClick={() => setDeleteConfirmId(null)}>
                                                                                        Yo'q
                                                                                    </button>
                                                                                    <button className="btn-danger" onClick={() => handleDeleteConfirm(trans._id || trans.id)}>
                                                                                        Ha, o'chirish
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tranzaksiya detallari modal */}
            {selectedTransaction && (
                <div className="modal-overlay" onClick={() => setSelectedTransaction(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Tranzaksiya tafsilotlari</h3>
                        <div className="detail-grid">
                            <div><strong>Sana:</strong> {formatUzbekDate(selectedTransaction.date)}</div>
                            <div><strong>Turi:</strong> {selectedTransaction.type === 'income' ? 'Kirim' : 'Chiqim'}</div>
                            <div><strong>Kategoriya:</strong> {selectedTransaction.category}</div>
                            <div><strong>Summa:</strong> {selectedTransaction.amount.toLocaleString("uz-UZ")} so'm</div>
                            <div><strong>Izoh:</strong> {selectedTransaction.description || '(izoh yoʻq)'}</div>

                            {selectedTransaction.debt && selectedTransaction.debt.amount > 0 && (
                                <>
                                    <hr style={{ margin: '16px 0' }} />
                                    <h4>Qarz ma'lumotlari</h4>
                                    <div><strong>Qarz turi:</strong> {selectedTransaction.debt.debtType === 'given' ? 'Berilgan qarz' : 'Olingan qarz'}</div>
                                    <div><strong>Miqdori:</strong> {selectedTransaction.debt.amount.toLocaleString("uz-UZ")} so'm</div>
                                    <div><strong>F.I.Sh:</strong> {selectedTransaction.debt.fullName}</div>
                                    {selectedTransaction.debt.phone && <div><strong>Telefon:</strong> {selectedTransaction.debt.phone}</div>}
                                    {selectedTransaction.debt.dueDate && (
                                        <div><strong>Qaytarish muddati:</strong> {new Date(selectedTransaction.debt.dueDate).toLocaleDateString('uz-UZ')}</div>
                                    )}
                                    <div><strong>Qaytarilganmi:</strong> {selectedTransaction.debt.isReturned ? 'Ha' : 'Yoʻq'}</div>
                                    {selectedTransaction.debt.returnedAt && (
                                        <div><strong>Qaytarilgan sana:</strong> {new Date(selectedTransaction.debt.returnedAt).toLocaleDateString('uz-UZ')}</div>
                                    )}
                                </>
                            )}
                        </div>
                        <button className="btn-close-modal" onClick={() => setSelectedTransaction(null)}>Yopish</button>
                    </div>
                </div>
            )}

            {/* Popover backdrop */}
            {deleteConfirmId && (
                <div className="popover-backdrop" onClick={() => setDeleteConfirmId(null)} />
            )}
        </div>
    );
}