import React, { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import master from "../../assets/master.png";
import { useNotification } from "../../components/Notification/NotificationToast";
import {
    useCreateUserMutation,
    useUpdateUserMutation,
} from "../../context/adminApi";
import { useGetUserFullDetailsQuery } from "../../context/adminApi";
import "./style.css";

export default function AdminDashboard() {
    const [menu, setMenu] = useState("profile");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));
    const { data, isLoading } = useGetUserFullDetailsQuery(user?._id);

    const notify = useNotification();

    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    // Mock users — real loyihada API dan keladi
    const [users, setUsers] = useState([
        {
            id: 1,
            fullName: "Ali Valiev",
            username: "alivaliev",
            phoneNumber: "+998 90 123 45 67",
            image: null,
            role: "master",
        },
        {
            id: 2,
            fullName: "Madina Karimova",
            username: "madina_k",
            phoneNumber: "+998 91 987 65 43",
            image: null,
            role: "senior_master",
        },
        {
            id: 3,
            fullName: "Jamshid Toirov",
            username: "jamshid99",
            phoneNumber: "+998 99 555 11 22",
            image: null,
            role: "junior_master",
        },
    ]);

    // Forma matn maydonlari
    const [formFields, setFormFields] = useState({
        fullName: "",
        phoneNumber: "",
        username: "",
        password: "",
        role: "master",
    });

    // Rasm fayli va preview
    const [imageFile, setImageFile] = useState(null); // File obyekti (serverga yuboriladi)
    const [imagePreview, setImagePreview] = useState(""); // Lokal URL (preview uchun)

    // Mock orders va finance
    const mockOrders = [
        { _id: "o1", brand: "Samsung", phoneModel: "Galaxy S23", TotalCost: 12000000 },
        { _id: "o2", brand: "iPhone", phoneModel: "14 Pro", TotalCost: 15000000 },
        { _id: "o3", brand: "Xiaomi", phoneModel: "13T Pro", TotalCost: 8000000 },
    ];

    const mockFinance = [
        { _id: "f1", date: "2025-12-01", description: "Samsung S23 ta'mir", category: "Daromad", amount: 12000000 },
        { _id: "f2", date: "2025-12-10", description: "iPhone 14 Pro ekran almashtirish", category: "Daromad", amount: 15000000 },
        { _id: "f3", date: "2025-12-15", description: "Ehtiyot qism sotib olish", category: "Xarajat", amount: -5000000 },
        { _id: "f4", date: "2025-12-20", description: "Xiaomi 13T Pro batareya almashtirish", category: "Daromad", amount: 8000000 },
    ];

    const [orders, setOrders] = useState([]);
    const [finance, setFinance] = useState([]);

    // Birinchi foydalanuvchini avto tanlash
    useEffect(() => {
        if (users.length > 0 && !selectedUser) {
            setSelectedUser(users[0]);
        }
    }, [users]);

    // Orders va finance ni to'ldirish
    useEffect(() => {
        setOrders(mockOrders);
        setFinance(mockFinance);
    }, [selectedUser]);

    // Forma ochish (yaratish yoki tahrirlash)
    const openEditMode = (user = null) => {
        if (user) {
            // Tahrirlash rejimi
            setFormFields({
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                username: user.username,
                password: "",
                role: user.role || "master",
            });
            setImagePreview(user.image || "");
            setImageFile(null);
            setIsEditing(true);
        } else {
            // Yaratish rejimi
            setFormFields({
                fullName: "",
                phoneNumber: "",
                username: "",
                password: "",
                role: "master",
            });
            setImageFile(null);
            setImagePreview("");
            setIsEditing(false);
        }
        setMenu("create");
    };

    // Matn maydonlari o'zgarishi
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({ ...prev, [name]: value }));
    };

    // Rasm tanlash
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    // Submit — create yoki update
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Matn maydonlar
        formData.append("fullName", formFields.fullName);
        formData.append("phoneNumber", formFields.phoneNumber);
        formData.append("username", formFields.username);
        formData.append("role", formFields.role);

        // Parol: yaratishda majburiy, update da faqat kiritilgan bo'lsa
        if (!isEditing || formFields.password) {
            formData.append("password", formFields.password);
        }

        // Yangi rasm tanlangan bo'lsa
        if (imageFile) {
            formData.append("image", imageFile); // backendda "image" field nomi bo'lishi kerak
        }

        // Update bo'lsa id qo'shish
        if (isEditing) {
            formData.append("id", selectedUser.id);
        }

        try {
            if (isEditing) {
                // UPDATE
                const response = await updateUser(formData).unwrap();

                // Local state yangilash (backenddan yangi image URL qaytishi mumkin)
                const updatedImage = response.image || imagePreview || selectedUser.image;

                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === selectedUser.id
                            ? { ...u, ...formFields, image: updatedImage }
                            : u
                    )
                );
                setSelectedUser((prev) => ({ ...prev, ...formFields, image: updatedImage }));

                notify("Foydalanuvchi muvaffaqiyatli yangilandi ✅", "success");
            } else {
                // CREATE
                const response = await createUser(formData).unwrap();

                const newUser = {
                    id: response.id || Date.now(),
                    ...formFields,
                    image: response.image || imagePreview || null,
                };

                setUsers((prev) => [...prev, newUser]);
                notify("Yangi master muvaffaqiyatli yaratildi ✅", "success");
            }

            // Tozalash va profilga qaytish
            openEditMode(null);
            setMenu("profile");
        } catch (err) {
            console.error(err);
            notify(err?.data?.message || "Xatolik yuz berdi", "error");
        }
    };

    const totalIncome = finance
        .filter((f) => f.category === "Daromad")
        .reduce((sum, f) => sum + f.amount, 0);

    return (
        <div className="admin_dashboard">
            <div className="left_panel">
                {selectedUser ? (
                    <div className="user-infos">
                        <div className="banner">
                            <img src={master} alt="banner" />
                        </div>
                        <div className="avatar">
                            <img
                                src={user?.image || "/default-avatar.png"}
                                alt="avatar"
                            />
                        </div>
                        <h2 className="name">{user?.fullName}</h2>
                        <p className="username">{user?.username}</p>
                        <p className="phone">{user?.phoneNumber}</p>

                        <button
                            className="edit-btn"
                            onClick={() => openEditMode(user)}
                        >
                            <MdEdit />
                        </button>

                        <div className="history">
                            <div className="menu-admin">
                                <button onClick={() => setMenu("profile")}>Profil</button>
                                <button onClick={() => setMenu("finance")}>Moliya</button>
                                {
                                    user.role === "admin" && <button onClick={() => setMenu("create")}>+ Yaratish</button>
                                }
                            </div>

                            {/* PROFIL BO'LIMI */}
                            {menu === "profile" && (
                                <div className="orders">
                                    <h3>Ishlar tarixi</h3>
                                    {orders.length === 0 ? (
                                        <p className="no-data">Ish yo‘q</p>
                                    ) : (
                                        orders.map((order) => (
                                            <div key={order._id} className="order-item">
                                                <span>
                                                    {order.brand} {order.phoneModel}
                                                </span>
                                                <span>{order.TotalCost.toLocaleString()} so'm</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* MOLYA BO'LIMI */}
                            {menu === "finance" && (
                                <div className="finance">
                                    <h3>Moliyaviy tarix</h3>
                                    {finance.length === 0 ? (
                                        <p className="no-data">Moliyaviy tarix yo‘q</p>
                                    ) : (
                                        finance.map((f) => (
                                            <div key={f._id} className="finance-item">
                                                <span>
                                                    {new Date(f.date).toLocaleDateString("uz-UZ")}
                                                </span>
                                                <span>{f.description}</span>
                                                <span>{f.category}</span>
                                                <span
                                                    style={{ color: f.amount > 0 ? "green" : "red" }}
                                                >
                                                    {f.amount.toLocaleString()} so'm
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* YARATISH / TAHRIRLASH FORMASI */}
                            {menu === "create" && (
                                <div className="create-order">
                                    <h3>
                                        {isEditing
                                            ? "Foydalanuvchini tahrirlash"
                                            : "Yangi master yaratish"}
                                    </h3>

                                    <form onSubmit={handleSubmit}>
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="To‘liq ismi"
                                            value={formFields.fullName}
                                            onChange={handleChange}
                                            required
                                        />

                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            placeholder="Telefon raqam"
                                            value={formFields.phoneNumber}
                                            onChange={handleChange}
                                            required
                                        />

                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            value={formFields.username}
                                            onChange={handleChange}
                                            required
                                            disabled={isEditing}
                                        />

                                        <input
                                            type="password"
                                            name="password"
                                            placeholder={
                                                isEditing
                                                    ? "Yangi parol (bo‘sh qoldirsangiz o‘zgarmaydi)"
                                                    : "Parol"
                                            }
                                            value={formFields.password}
                                            onChange={handleChange}
                                            required={!isEditing}
                                        />

                                        <select
                                            name="role"
                                            value={formFields.role}
                                            onChange={handleChange}
                                        >
                                            <option value="seller">Seller</option>
                                            <option value="junior_master">Junior master</option>
                                            <option value="senior_master">Senior master</option>
                                            <option value="master">Master</option>
                                            <option value="admin">Admin</option>
                                        </select>

                                        <label htmlFor="img">
                                            Profil rasmi tanlash
                                            <input
                                                className="fileImg"
                                                id="img"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>

                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="preview"
                                                style={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    marginTop: 10,
                                                    display: "block",
                                                }}
                                            />
                                        )}

                                        <div style={{ marginTop: 15 }}>
                                            <button
                                                type="submit"
                                                disabled={isCreating || isUpdating}
                                            >
                                                {isCreating || isUpdating
                                                    ? "Saqlanmoqda..."
                                                    : isEditing
                                                        ? "Yangilash"
                                                        : "Yaratish"}
                                            </button>

                                        </div>
                                    </form>
                                </div>
                            )}

                            <p className="total">
                                Jami daromad: {totalIncome.toLocaleString()} so'm
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="no-user">Foydalanuvchi tanlang</p>
                )}
            </div>
        </div>
    );
}