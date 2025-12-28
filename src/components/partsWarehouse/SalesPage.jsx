import { useState, useEffect } from "react"; // useEffect qo'shildi
import { useGetSalesQuery } from "../../context/materialsApi";
import "./style/sales.css";

export default function SalesPage() {
    // Hozirgi yil va oy ni avtomatik olish
    const currentYear = new Date().getFullYear();
    const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, '0'); // 0-11 → 01-12
    const currentMonthValue = `${currentYear}.${currentMonthNum}`;

    const [month, setMonth] = useState(currentMonthValue); // default qiymat — hozirgi oy

    const months = [
        { uz: "Yanvar", num: "01" },
        { uz: "Fevral", num: "02" },
        { uz: "Mart", num: "03" },
        { uz: "Aprel", num: "04" },
        { uz: "May", num: "05" },
        { uz: "Iyun", num: "06" },
        { uz: "Iyul", num: "07" },
        { uz: "Avgust", num: "08" },
        { uz: "Sentyabr", num: "09" },
        { uz: "Oktyabr", num: "10" },
        { uz: "Noyabr", num: "11" },
        { uz: "Dekabr", num: "12" }
    ];

    const { data, isLoading } = useGetSalesQuery(month, { skip: !month });
    const sales = data?.innerData || [];

    return (
        <div className="sales-container">
            <div className="sales-box">
                <h2>Sotuvlar tarixi</h2>

                {/* Month Filter */}
                <div className="filter-box">
                    <select
                        className="filter-input"
                        value={month} // controlled component uchun value qo'shildi
                        onChange={(e) => setMonth(e.target.value)}
                    >
                        <option value="">Barcha oylar</option>
                        {months.map(m => (
                            <option key={m.num} value={`${currentYear}.${m.num}`}>
                                {m.uz}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {isLoading && <p>Yuklanmoqda...</p>}

            <div className="table-wrapper">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>Nomi</th>
                            <th>Miqdor</th>
                            <th>Summa</th>
                            <th>Foyda</th>
                            <th>Sana</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales?.map(s => (
                            <tr key={s._id}>
                                <td data-label="Nomi">{s.name}</td>
                                <td data-label="Miqdor">{s.quantity} dona</td>
                                <td data-label="Summa">{s.totalPrice?.toLocaleString()} {s.currency}</td>
                                <td data-label="Foyda" className="profit">+{s.profit.toLocaleString()} so'm</td>
                                <td data-label="Sana">{new Date(s.soldAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {sales.length === 0 && !isLoading && <p className="empty">Ma'lumot topilmadi</p>}
        </div>
    );
}