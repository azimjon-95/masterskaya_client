import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import {
    useGetPartsQuery,
    useAddPartMutation,
    useUpdatePartMutation,
    useDeletePartMutation
} from '../../context/materialsApi';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { GiShoppingCart } from "react-icons/gi";
import './style.css';

import phoneModels from '../../models/Models';
import { useNotification } from '../Notification/NotificationToast';
import partNames from '../../models/PartNames';
import { brends } from '../../models/Brends';
import { PiTableDuotone } from "react-icons/pi";
import { BiSolidCard } from "react-icons/bi";
import SotishModal from "./SellModal";
import { MdOutlineDomain } from "react-icons/md";
import { LuHistory } from "react-icons/lu";
import SalesPage from "./SalesPage";

const PartsWarehouse = () => {
    const { data: parts = [], isLoading, refetch } = useGetPartsQuery();
    const [addPart, { isLoading: isAdding }] = useAddPartMutation();
    const [updatePart, { isLoading: isUpdating }] = useUpdatePartMutation();
    const [deletePart] = useDeletePartMutation();
    const { showNotification } = useNotification();
    // Yangi state'lar modal uchun
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);
    const [dollarRate, setDollarRate] = useState(12500);
    const [showForm, setShowForm] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    const [salePart, setSalePart] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('card');
    const [sortByType, setSortByType] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        customName: '',
        brand: '',
        customBrand: '',
        model: '',
        customModel: '',
        buyPrice: '',
        sellPrice: '',
        currency: 'UZS',
        quantity: 1,
        color: '',
        size: '',
        type: 'Extiyot qismlar',
    });

    console.log(editingPart);


    useEffect(() => {
        fetch("https://api.exchangerate-api.com/v4/latest/USD")
            .then(res => res.json())
            .then(data => setDollarRate(data.rates.UZS || 12500))
            .catch(err => console.error("API error:", err));
    }, []);

    const getModelsForBrand = (brand) => {
        if (brand === 'Boshqa') return [];
        const cleanBrand = brand.replace('(iPhone)', '').trim();
        if (phoneModels[cleanBrand]) return phoneModels[cleanBrand].models;
        if (cleanBrand.startsWith('Xiaomi') && phoneModels.Redmi) return phoneModels.Redmi.models;
        return [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);

        if (!formData.name.trim() || !formData.brand.trim() || !formData.model.trim() || !formData.buyPrice || !formData.sellPrice || !formData.quantity) {
            showNotification("Barcha maydonlarni to'g'ri to'ldiring!", "error");
            return;
        }

        const submitData = {
            name: formData.name === 'Boshqa' ? formData.customName.trim() : formData.name,
            brand: formData.brand === 'Boshqa' ? formData.customBrand.trim() : formData.brand,
            model: formData.model === 'Boshqa' ? formData.customModel.trim() : formData.model,
            buyPrice: Number(formData.buyPrice),
            sellPrice: Number(formData.sellPrice),
            currency: formData.currency,
            quantity: Number(formData.quantity),
            type: formData.type,
            color: formData.color || '',
            size: formData.size || ''
        };

        try {
            if (editingPart) {
                await updatePart({ ...submitData, id: editingPart?._id }).unwrap();
            } else {
                await addPart(submitData).unwrap(); // <--- unwrap() bilan kutamiz
            }

            // Faqat muvaffaqiyatli bo‘lganda yopamiz
            resetForm();
            refetch(); // yangi ma'lumotlar yuklansin
        } catch (error) {
            console.error("Xato yuz berdi:", error);
            alert("Saqlashda xatolik yuz berdi. Qaytadan urinib ko‘ring.");
            // Xato bo‘lsa forma ochiq qolsin
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            customName: '',
            brand: '',
            customBrand: '',
            model: '',
            customModel: '',
            buyPrice: '',
            sellPrice: '',
            currency: 'UZS',
            quantity: 1,
            color: '',
            size: '',
            type: 'Extiyot qismlar',
        });
        setEditingPart(null);
        setShowForm(false);
    };

    const handleEdit = (part) => {

        setEditingPart(part);
        setFormData({
            name: part.name,
            brand: part.brand,
            model: part.model,
            buyPrice: part.buyPrice,
            sellPrice: part.sellPrice,
            currency: part.currency,
            quantity: part.quantity,
            color: part.color,
            size: part.size,
            type: part.type
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Haqiqatan ham o\'chirmoqchimisiz?')) {
            deletePart(id);
            refetch();
        }
    };

    const handleSellClick = (part) => {
        setSelectedPart(part);
        setShowSellModal(true);
    };

    // Modalni yopish
    const closeSellModal = () => {
        setShowSellModal(false);
        setSelectedPart(null);
    };
    const formatPrice = (price, currency) => {
        if (currency === 'USD') {
            return (
                <span className="prc" >
                    <span className="prcm">${price.toLocaleString()}</span>
                    <span className="prcs">≈ {(price * dollarRate).toLocaleString()} so'm</span>
                </span>
            );
        }
        return <span className="prcm">{price.toLocaleString()} so'm</span>;
    };
    const calculateProfit = (part) => {
        const buy = part.currency === 'USD' ? part.buyPrice * dollarRate : part.buyPrice;
        const sell = part.currency === 'USD' ? part.sellPrice * dollarRate : part.sellPrice;
        return sell - buy;
    };

    const filteredParts = parts?.message?.filter(part =>
        (part.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.model || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const nameOptions = [
        { value: '', label: 'Tanlang', isDisabled: true },
        { value: 'Boshqa', label: 'Boshqa (Другое)' },
        ...partNames.map(name => ({ value: name, label: name }))
    ];
    useEffect(() => {
        const savedView = localStorage.getItem('partsViewMode');
        if (savedView === 'card' || savedView === 'table') {
            setViewMode(savedView);
        }
    }, []);

    const modelOptions = getModelsForBrand(formData.brand).map(m => ({ value: m, label: m }));
    const toggleViewMode = () => {
        const newMode = viewMode === 'card' ? 'table' : 'card';
        setViewMode(newMode);
        localStorage.setItem('partsViewMode', newMode);
    };
    return (
        <div className="app-hdr">
            <div className="ctr">
                <div className="srch">
                    <input
                        type="text"
                        placeholder="Qidirish (nom, brend, model)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="inp"
                    />

                    <Select
                        value={sortByType}
                        onChange={(selected) => {
                            setSortByType(selected.value);
                        }}
                        options={[
                            { value: '', label: 'Tanlang', isDisabled: true },
                            { value: 'all', label: 'Barchasi' },
                            { value: 'Extiyot qismlar', label: 'Extiyot qismlar' },
                            { value: 'Aksessuarlar', label: 'Aksessuarlar' },
                        ]}
                        placeholder="Tanlang"
                    />
                    <button onClick={toggleViewMode} className="btn-tabl btnp" title="Ko'rinishni o'zgartirish">
                        {viewMode === 'card' ? <PiTableDuotone /> : <BiSolidCard />}
                    </button>
                    <button onClick={
                        () => {
                            setSalePart(!salePart);
                        }
                    } className="btn-tabl btnp" title="Ko'rinishni o'zgartirish">
                        {!salePart ? <LuHistory /> : <MdOutlineDomain />}
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className="btn-wer btnp">
                        {showForm ? 'Yopish' : '+ Yangi Ehtiyot Qo\'shish'}
                    </button>
                </div>

                {showForm && (
                    <div className="frmdiv" onClick={resetForm}>
                        <div className="frm" onClick={(e) => e.stopPropagation()}>
                            <h2 className="frmttl">{editingPart ? 'Tahrirlash' : 'Yangi Ehtiyot Qo\'shish'}</h2>
                            <div className="frmwrp">
                                <div className="frmgrd">
                                    {/* Ehtiyot nomi */}
                                    <div className="fld">
                                        <label className="lbl">Ehtiyot nomi *</label>
                                        {formData.name === 'Boshqa' ? (
                                            <input
                                                type="text"
                                                placeholder="Qo'lda yozing (masalan: SIM-lotok, orqa qopqoq)"
                                                value={formData.customName || ''}  // alohida state ishlatamiz
                                                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                                                className="inp"
                                                autoFocus
                                            />
                                        ) : (
                                            <Select
                                                value={nameOptions.find(opt => opt.value === formData.name) || null}
                                                onChange={(selected) => {
                                                    if (selected?.value === 'Boshqa') {
                                                        setFormData({
                                                            ...formData,
                                                            name: 'Boshqa',
                                                            customName: ''
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            name: selected?.value || '',
                                                            customName: undefined
                                                        });
                                                    }
                                                }}
                                                options={[
                                                    { value: 'Boshqa', label: 'Boshqa (qo\'lda yozish)' },
                                                    { value: '', label: 'Tanlang', isDisabled: true },
                                                    ...partNames.map(name => ({ value: name, label: name })),
                                                ]}
                                                isSearchable
                                                isClearable
                                                placeholder="Ehtiyot nomini tanlang"
                                            />
                                        )}
                                    </div>

                                    {/* Brend */}
                                    <div className="fld">
                                        <label className="lbl">Brend *</label>
                                        {formData.brand === 'Boshqa' ? (
                                            <input
                                                type="text"
                                                placeholder="Brend nomi (masalan: Huawei)"
                                                value={formData.customBrand || ''}
                                                onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })}
                                                className="inp"
                                                autoFocus
                                            />
                                        ) : (
                                            <Select
                                                value={brends.find(opt => opt.value === formData.brand) || null}
                                                onChange={(selected) => {
                                                    if (selected?.value === 'Boshqa') {
                                                        setFormData({
                                                            ...formData,
                                                            brand: 'Boshqa',
                                                            customBrand: ''  // yangi custom maydonni tozalaymiz
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            brand: selected?.value || '',
                                                            customBrand: undefined
                                                        });
                                                    }
                                                }}
                                                options={[
                                                    { value: 'Boshqa', label: 'Boshqa (qo\'lda yozish)' },
                                                    { value: '', label: 'Tanlang', isDisabled: true },
                                                    ...brends.filter(opt => opt.value !== 'Boshqa' && opt.value !== '') // agar brends ro'yxatida allaqachon Boshqa bo'lmasa
                                                ]}
                                                isSearchable
                                                isClearable
                                                placeholder="Brendni tanlang"
                                            />
                                        )}
                                    </div>

                                    {/* Model */}
                                    <div className="fld">
                                        <label className="lbl">Model *</label>
                                        {formData.model === 'Boshqa' ? (
                                            <input
                                                type="text"
                                                placeholder="Modelni qo'lda yozing (masalan: P30 Pro)"
                                                value={formData.customModel || ''}
                                                onChange={(e) => setFormData({ ...formData, customModel: e.target.value })}
                                                className="inp"
                                                autoFocus
                                            />
                                        ) : (
                                            <Select
                                                value={modelOptions.find(opt => opt.value === formData.model) || null}
                                                onChange={(selected) => {
                                                    if (selected?.value === 'Boshqa') {
                                                        setFormData({
                                                            ...formData,
                                                            model: 'Boshqa',
                                                            customModel: ''
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            model: selected?.value || '',
                                                            customModel: undefined
                                                        });
                                                    }
                                                }}
                                                options={[
                                                    { value: 'Boshqa', label: 'Boshqa model (qo\'lda yozish)' },
                                                    { value: '', label: 'Tanlang', isDisabled: true },
                                                    ...modelOptions
                                                ]}
                                                isSearchable
                                                isClearable
                                                placeholder="Modelni tanlang"
                                            />
                                        )}
                                    </div>

                                    {/* Narxlar va boshqalar */}
                                    <div className="fld">
                                        <label className="lbl">Sotib olish narxi *</label>
                                        <input type="number" placeholder="0" value={formData.buyPrice}
                                            onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                                            required className="inp" />
                                    </div>

                                    <div className="fld">
                                        <label className="lbl">Sotish narxi *</label>
                                        <input type="number" placeholder="0" value={formData.sellPrice}
                                            onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                                            required className="inp" />
                                    </div>

                                    <div className="fld">
                                        <label className="lbl">Valyuta *</label>
                                        <select value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="inp">
                                            <option value="UZS">So'm (UZS)</option>
                                            <option value="USD">Dollar (USD)</option>
                                        </select>
                                    </div>

                                    <div className="fld">
                                        <label className="lbl">Miqdor</label>
                                        <input type="number" placeholder="0" value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            className="inp" />
                                    </div>

                                    {/* Color */}
                                    <div className="fld">
                                        <label className="lbl">Rangi</label>
                                        {formData.color !== 'Boshqa' ? (
                                            <Select
                                                value={
                                                    formData.color === ''
                                                        ? { value: '', label: 'Tanlang', isDisabled: true }
                                                        : { value: formData.color, label: formData.color }
                                                }
                                                onChange={(selected) => setFormData({ ...formData, color: selected.value })}
                                                options={[
                                                    { value: '', label: 'Tanlang', isDisabled: true },
                                                    { value: 'Qora', label: 'Qora (Чёрный)' },
                                                    { value: 'Oq', label: 'Oq (Белый)' },
                                                    { value: 'Moviy', label: 'Movий (Синий)' },
                                                    { value: 'Qizil', label: 'Qizil (Красный)' },
                                                    { value: 'Yashil', label: 'Yashil (Зелёный)' },
                                                    { value: 'Sariq', label: 'Sariq (Жёлтый)' },
                                                    { value: 'To‘q qizil', label: 'To‘q qizil (Тёмно-красный)' },
                                                    { value: 'To‘q moviy', label: 'To‘q movий (Тёмно-синий)' },
                                                    { value: 'Apelsin', label: 'Apelsin (Оранжевый)' },
                                                    { value: 'Kumush', label: 'Kumush (Серебряный)' },
                                                    { value: 'Oltin', label: 'Oltin (Золотой)' },
                                                    { value: 'Pushti', label: 'Pushti (Розовый)' },
                                                    { value: 'Bej', label: 'Bej (Бежевый)' },
                                                    { value: 'Ko‘k-yashil', label: 'Ko‘k-yashil (Бирюзовый)' },
                                                    { value: 'Sariq-yashil', label: 'Sariq-yashil (Лаймовый)' }
                                                ]}

                                                isSearchable
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="Rangni qo'lda yozing"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="inp"
                                            />
                                        )}
                                    </div>

                                    <div className="fld">
                                        <label className="lbl">Razmeri</label>
                                        <input type="text" placeholder="0" value={formData.size}
                                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            required className="inp" />
                                    </div>
                                    <div className="fld">
                                        <label className="lbl">Maxsulot turi *</label>
                                        <div className="button-group">
                                            <button
                                                type="button"
                                                className={`toggle-btn ${formData.type === 'Extiyot qismlar' ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, type: 'Extiyot qismlar' })}
                                            >
                                                Extiyot qismlar
                                            </button>

                                            <button
                                                type="button"
                                                className={`toggle-btn ${formData.type === 'Aksessuarlar' ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, type: 'Aksessuarlar' })}
                                            >
                                                Aksessuarlar
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                <div className="frmact" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={resetForm} className="btn-wer btns">
                                        Bekor qilish
                                    </button>
                                    <button
                                        onClick={(e) => handleSubmit(e)}
                                        className="btn-wer btnp"
                                        disabled={isAdding || isUpdating}
                                    >
                                        {isAdding || isUpdating ? 'Saqlanmoqda...' : (editingPart ? 'Saqlash' : 'Qo\'shish')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {
                    !salePart ?
                        <>
                            {isLoading ? (
                                <div className="ld">Yuklanmoqda...</div>
                            ) : filteredParts.length === 0 ? (
                                <div className="empt">Ma'lumot topilmadi</div>
                            ) : viewMode === 'card' ? (
                                <div className="lst">{
                                    filteredParts?.filter(part => sortByType === "all" || part.type.includes(sortByType)).map((part) => (
                                        <div key={part._id} className="crd">
                                            <p>{part.type}</p>
                                            <div className="crdhdr">
                                                <div>
                                                    <h3 className="crdttl">{part.name}</h3>
                                                </div>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className={`bdg ${part.quantity > 0 ? 'bdgs' : 'bdgd'}`}>
                                                        {part.quantity} dona
                                                    </span>

                                                    <div className="crdact">
                                                        <button onClick={() => handleEdit(part)} className="btn-wer btne">
                                                            <FaEdit />
                                                        </button>
                                                        <button onClick={() => handleDelete(part._id)} className="btn-wer btnd">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </span>
                                            </div>

                                            <div className="crdbdy">
                                                <div className="prcgrp">
                                                    <div className="prcitm">
                                                        <p className="crdsub">{part.brand} • {part.model}</p>
                                                    </div>
                                                    <div className="prcitm">
                                                        <span className="prclbl">Sotib olish:</span>
                                                        {formatPrice(part.buyPrice, part.currency)}
                                                    </div>
                                                    <div className="prcitm">
                                                        <span className="prclbl">Sotish:</span>
                                                        {formatPrice(part.sellPrice, part.currency)}
                                                    </div>
                                                    <div className="prcitm">
                                                        <span className="prclbl">Rang:</span>
                                                        <span className="prclbl">{part.color}</span>
                                                    </div>
                                                    <div className="prcitm">
                                                        <span className="prclbl">Razmer:</span>
                                                        <span className="prclbl">{part.size}</span>
                                                    </div>
                                                </div>

                                                <div className="prft">
                                                    <span className="prftlbl">Foyda:</span>
                                                    <span className="prftv">
                                                        +{calculateProfit(part).toLocaleString()} so'm
                                                        <button className="bayproduct"
                                                            onClick={() => handleSellClick(part)}
                                                            title="Sotish"
                                                            disabled={part.quantity === 0}
                                                        >
                                                            <GiShoppingCart />
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}</div>
                            ) : (
                                // Jadval ko'rinishi
                                <table className="parts-table">
                                    <thead>
                                        <tr>
                                            <th>Turi</th>
                                            <th>Nomi</th>
                                            <th>Brend • Model</th>
                                            <th>Rang</th>
                                            <th>Razmer</th>
                                            <th>Miqdor</th>
                                            <th>Sotib olish</th>
                                            <th>Sotish</th>
                                            <th>Foyda</th>
                                            <th>Sotish</th>
                                            <th>Amallar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredParts.map((part) => (
                                            <tr key={part._id}>
                                                <td>{part.type}</td>
                                                <td><strong>{part.name}</strong></td>
                                                <td>{part.brand} • {part.model}</td>
                                                <td>{part.color || '-'}</td>
                                                <td>{part.size || '-'}</td>
                                                <td>
                                                    <span className={`Tbbdg ${part.quantity > 0 ? 'bdgs' : 'bdgd'}`}>
                                                        {part.quantity} dona
                                                    </span>
                                                </td>
                                                <td>{formatPrice(part.buyPrice, part.currency)}</td>
                                                <td>{formatPrice(part.sellPrice, part.currency)}</td>
                                                <td>+{calculateProfit(part).toLocaleString()} so'm</td>
                                                <td>
                                                    <button className="bayproduct"
                                                        onClick={() => handleSellClick(part)}
                                                        title="Sotish"
                                                        disabled={part.quantity === 0}
                                                    >
                                                        <GiShoppingCart />
                                                    </button>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleEdit(part)} className="btn-wer btne" title="Tahrirlash">
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => handleDelete(part._id)} className="btn-wer btnd" title="O'chirish">
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                        :
                        <SalesPage />

                }
                {/* </div> */}
            </div>
            {showSellModal && selectedPart && (
                <SotishModal
                    selectedPart={selectedPart}
                    onClose={closeSellModal}
                    dollarRate={dollarRate}
                    formatPrice={formatPrice}
                    calculateProfit={calculateProfit}
                />
            )}
        </div >
    );
};

export default PartsWarehouse;