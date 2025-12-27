// components/modals/OrderDetailsModal.jsx
import React, { useState } from "react";
import "./style/details.css";
import { useUpdateOrderMutation } from "../../context/orderApi";

export default function OrderDetailsModal({ order, statusConfig, onClose, refreshOrders }) {
    const [updateOrder, { isLoading }] = useUpdateOrderMutation();

    const [editSection, setEditSection] = useState(null);
    const [form, setForm] = useState({ ...order });

    if (!order) return null;

    // Info (view mode)
    const Info = ({ label, value }) =>
        value && value !== "" ? (
            <div className="info-row">
                <span>{label}</span>
                <strong>{value}</strong>
            </div>
        ) : null;

    // universal input
    const EditInput = ({ label, name, type = "text" }) => (
        <div className="info-row">
            <span>{label}</span>
            {type === "textarea" ? (
                <textarea
                    value={form[name] || ""}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="edit-input-textarea"
                />
            ) : (
                <input
                    type={type}
                    value={form[name] || ""}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="edit-input"
                />
            )}
        </div>
    );

    // date input
    const EditDate = ({ label, name }) => (
        <div className="info-row">
            <span>{label}</span>
            <input
                type="date"
                value={form[name]?.slice(0, 10) || ""}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="edit-input"
            />
        </div>
    );

    // Save handler
    // Save handler — faqat o'zgargan fieldlar yuboriladi
    const saveSection = async (fields) => {
        const updateData = {};

        fields.forEach((f) => {
            if (form[f] !== order[f]) updateData[f] = form[f]; // faqat o'zgarganlar
        });

        if (Object.keys(updateData).length === 0) {
            setEditSection(null); // o'zgarmasa modal yopiladi
            return;
        }

        await updateOrder({ id: order._id, data: updateData });
        refreshOrders();
        setEditSection(null);
    };

    // reusable section
    const Section = ({ title, fields, children }) => (
        <section className="info-card">
            <div className="section-top">
                <h3>{title}</h3>

                {editSection === title ? (
                    <div className="edit-actions">
                        <button className="ok" onClick={() => saveSection(fields)}>
                            OK
                        </button>
                        <button className="cancel" onClick={() => setEditSection(null)}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button className="edit-btn" onClick={() => setEditSection(title)}>✎</button>
                )}
            </div>

            {children}
        </section>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-top">
                    <h2>📋 Buyurtma Tafsilotlari</h2>
                    <span className={`status-badge ${statusConfig[order.status]?.color}`}>
                        {statusConfig[order.status]?.text}
                    </span>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-sections">



                    {/* =================== 👤 Mijoz =================== */}
                    <Section title="👤 Mijoz" fields={["customerName", "phoneNumber", "district", "village", "street"]}>
                        {editSection === "👤 Mijoz" ? (
                            <>
                                <EditInput label="Ism" name="customerName" />
                                <EditInput label="Telefon" name="phoneNumber" />
                                <EditInput label="Qishloq/Shahar" name="village" />
                                <EditInput label="Ko‘cha" name="street" />
                            </>
                        ) : (
                            <>
                                <Info label="Ism" value={order.customerName} />
                                <Info label="Telefon" value={order.phoneNumber} />
                                <Info label="Manzil" value={[order.district, order.village, order.street].filter(Boolean).join(", ")} />
                            </>
                        )}
                    </Section>



                    {/* =================== 📱 Qurilma =================== */}
                    <Section title="📱 Telefon" fields={["brand", "phoneModel", "color", "condition", "conditionDetail"]}>
                        {editSection === "📱 Telefon" ? (
                            <>
                                <EditInput label="Brend" name="brand" />
                                <EditInput label="Model" name="phoneModel" />
                                <EditInput label="Rang" name="color" />
                                <EditInput label="Holati" name="condition" />
                                <EditInput label="Batafsil" name="conditionDetail" type="textarea" />
                            </>
                        ) : (
                            <>
                                <Info label="Brend" value={order.brand} />
                                <Info label="Model" value={order.phoneModel} />
                                <Info label="Rang" value={order.color} />
                                <Info label="Holati" value={order.condition} />
                                <Info label="Batafsil" value={order.conditionDetail} />
                            </>
                        )}
                    </Section>



                    {/* =================== 🛠 Tamir =================== */}
                    <Section title="🛠 Ta’mir" fields={["problem", "initialDiagnosis", "completedWorks", "TotalCost", "repairDays"]}>
                        {editSection === "🛠 Ta’mir" ? (
                            <>
                                <EditInput label="Muammo" name="problem" />
                                <EditInput label="Diagnoz" name="initialDiagnosis" />
                                <EditInput label="Bajarilgan ishlar" name="completedWorks" type="textarea" />
                                <EditInput label="Narxi (so'm)" name="TotalCost" type="number" />
                                <EditInput label="Muddati (kun)" name="repairDays" type="number" />
                            </>
                        ) : (
                            <>
                                <Info label="Muammo" value={order.problem} />
                                <Info label="Diagnoz" value={order.initialDiagnosis} />
                                <Info label="Bajarilgan ishlar" value={order.completedWorks} />
                                <Info label="Narxi" value={order.TotalCost && order.TotalCost + " so'm"} />
                                <Info label="Muddati" value={order.repairDays && order.repairDays + " kun"} />
                                <Info label="Qabul qilgan" value={order.receivedBy && `${order.receivedBy.FullName} (${order.receivedBy.PhoneNumber})`} />
                                <Info label="Ta'mirlovchi" value={order.repairedBy && `${order.repairedBy.FullName} (${order.repairedBy.PhoneNumber})`} />
                            </>
                        )}
                    </Section>



                    {/* =================== 📅 Sana =================== */}
                    <Section title="📅 Sanalar" fields={["pickupDate", "deliveredAt"]}>
                        {editSection === "📅 Sanalar" ? (
                            <>
                                <EditDate label="Olish sana" name="pickupDate" />
                                <EditDate label="Topshiruv sana" name="deliveredAt" />
                            </>
                        ) : (
                            <>
                                <Info label="Qabul" value={new Date(order.createdAt).toLocaleString("uz-UZ")} />
                                <Info label="Olish" value={order.pickupDate && new Date(order.pickupDate).toLocaleDateString("uz-UZ")} />
                                <Info label="Topshirilgan" value={order.deliveredAt && new Date(order.deliveredAt).toLocaleString("uz-UZ")} />
                            </>
                        )}
                    </Section>



                    {/* =================== 🖼 Rasmlar =================== */}
                    {(order.phoneImage || order.clientImage) && (

                        <div className="image-row">
                            {order.phoneImage && <img src={order.phoneImage} alt="Telefon" />}
                            {order.clientImage && <img src={order.clientImage} alt="Mijoz" />}
                        </div>
                    )}



                </div>
            </div>
        </div>
    );
}
