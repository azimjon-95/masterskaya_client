// src/components/AddOrderModal.jsx
import { useState, useEffect, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import phoneModels from '../../models/Models';
import { namanganDistricts, popVillages } from '../../data/Data';
import { useCreateOrderMutation } from '../../context/orderApi';
import { useNotification } from '../Notification/NotificationToast';
import { brends } from '../../models/Brends';
// Spinner

import './style.css';

export default function AddOrderModal({ t, onClose, refreshOrders }) {
    // Telefon rasmi uchun state'lar
    const [newOrder, setNewOrder] = useState(
        {
            customerName: '',
            phoneNumber: '',
            brand: '',
            phoneModel: '',
            color: '',
            condition: '',
            conditionDetail: '',
            problem: '',
            initialDiagnosis: '',
            repairDays: '',
            pickupDate: '',
            district: '',
            village: '',
            street: '',
            phoneImage: null,
            clientImage: null,
            status: 'new'
        }
    );
    const [phonePreview, setPhonePreview] = useState(null);
    const [showPhonePopover, setShowPhonePopover] = useState(false);
    const [showPhoneCamera, setShowPhoneCamera] = useState(false);
    const { showNotification } = useNotification();

    // Mijoz rasmi uchun state'lar
    const [clientPreview, setClientPreview] = useState(null);
    const [showClientPopover, setShowClientPopover] = useState(false);
    const [showClientCamera, setShowClientCamera] = useState(false);

    // Brend va modellarga oid state'lar
    const [selectedBrand, setSelectedBrand] = useState(newOrder.brand || '');
    const [availableModels, setAvailableModels] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [district, setDistrict] = useState(newOrder.district || "Pop tumani");
    const [createOrder, { isLoading }] = useCreateOrderMutation();

    // Kamera uchun ref'lar
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const currentCameraTarget = useRef(''); // 'phone' yoki 'client'

    // Yangi: 50% Diagnostika uchun tayyor variantlar
    const diagnosisOptions = [
        "Ekran siniq / tasvir yo‘q",
        "Sensor ishlamaydi (touch)",
        "Batareya tez tugaydi / shishgan",
        "Zaryad olmaydi (port yoki kabel muammosi)",
        "Telefon yoqilmaydi",
        "Qizib ketadi",
        "Tarmoq yo‘q (IMEI / antenna muammosi)",
        "Wi-Fi yoki Bluetooth ishlamaydi",
        "Kamera ishlamaydi",
        "Ovoz yo‘q (speaker yoki mikrofon ishlamaydi)",
        "Vibratsiya ishlamaydi",
        "Face ID yoki barmoq izi ishlamaydi",
        "Suv kirgan (oksidlanish / korroziya)",
        "Xotira xatosi (UFS / EMMC)",
        "Power IC / PMIC muammosi",
        "Dasturiy nosozlik (bootloop, osilib qoladi)",
        "Tugmalar ishlamaydi (Power / Volume)",
        "SIM karta o‘qimaydi",
        "Display shleyfi ajralgan",
        "Boshqa (qo‘shimcha yoziladi)"
    ];
    // Telefon raqami formatlash funksiyasi
    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/\D/g, '').slice(0, 9); // faqat 9 raqam

        const part1 = numbers.slice(0, 2);
        const part2 = numbers.slice(2, 5);
        const part3 = numbers.slice(5, 7);
        const part4 = numbers.slice(7, 9);

        let formatted = part1;
        if (part2) formatted += ' ' + part2;
        if (part3) formatted += ' ' + part3;
        if (part4) formatted += ' ' + part4;

        return formatted;
    };


    const handlePhoneNumberChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);

        setNewOrder({
            ...newOrder,
            phoneNumber: formatted
                ? `+998${formatted.replace(/\s/g, '')}`
                : ''
        });
    };


    // Display uchun formatlangan raqam (inputda ko‘rinadigan)
    const displayPhoneNumber = () => {
        if (!newOrder.phoneNumber) return '';
        return formatPhoneNumber(newOrder.phoneNumber.replace('+998', ''));
    };
    // Brend o'zgarganda modellarni va ranglarni yuklash
    useEffect(() => {
        if (selectedBrand && selectedBrand !== 'Boshqa') {
            const brandData = phoneModels[selectedBrand];
            if (brandData) {
                setAvailableModels(brandData.models || []);
                setAvailableColors(brandData.colors || []);
            } else {
                setAvailableModels([]);
                setAvailableColors([]);
            }
        } else {
            setAvailableModels([]);
            setAvailableColors([]);
        }
    }, [selectedBrand]);

    const handleBrandChange = (value) => {
        setSelectedBrand(value);
        setNewOrder({
            ...newOrder,
            brand: value,
            phoneModel: '',
            color: ''
        });
    };

    // Kamera ochish
    const openCamera = async (target) => {
        currentCameraTarget.current = target;

        if (target === 'phone') {
            setShowPhoneCamera(true);
            setShowPhonePopover(false);
        } else {
            setShowClientCamera(true);
            setShowClientPopover(false);
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            alert("Kameraga kirishda xatolik. Ruxsatni tekshiring.");
            console.error(err);
            setShowPhoneCamera(false);
            setShowClientCamera(false);
        }
    };
    const dataURLtoFile = (dataUrl, filename) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    };

    // Suratga olish
    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/png');
        const imageFile = dataURLtoFile(
            imageData,
            `${currentCameraTarget.current}_${Date.now()}.png`
        );

        if (currentCameraTarget.current === 'phone') {
            setPhonePreview(imageData); // preview uchun
            setNewOrder({ ...newOrder, phoneImage: imageFile }); // serverga File
            setShowPhoneCamera(false);
        } else {
            setClientPreview(imageData);
            setNewOrder({ ...newOrder, clientImage: imageFile });
            setShowClientCamera(false);
        }

        const stream = video.srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());
    };


    // Fayldan rasm yuklash
    const handlePhoneImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPhonePreview(previewUrl);
            setNewOrder({ ...newOrder, phoneImage: file });
        }
    };

    const handleClientImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setClientPreview(previewUrl);
            setNewOrder({ ...newOrder, clientImage: file });
        }
    };

    // Saqlash
    const handleSave = async () => {
        const required = ['customerName', 'brand', 'phoneModel', 'condition', 'problem'];
        const missing = required.filter(field => !newOrder[field]?.toString().trim());
        const masterId = JSON.parse(localStorage.getItem('user')).id;

        if (missing.length > 0) {
            showNotification("Iltimos, barcha majburiy maydonlarni to‘ldiring!", "error");
            return;
        }

        const formData = new FormData();

        // Text ma’lumotlar
        formData.append('customerName', newOrder.customerName);
        formData.append('phoneNumber', newOrder.phoneNumber || '');
        formData.append('brand', newOrder.brand);
        formData.append('phoneModel', newOrder.phoneModel);
        formData.append('color', newOrder.color || '');
        formData.append('condition', newOrder.condition);
        formData.append('conditionDetail', newOrder.conditionDetail || '');
        formData.append('problem', newOrder.problem);
        formData.append('initialDiagnosis', newOrder.initialDiagnosis || '');
        formData.append('repairDays', newOrder.repairDays || '');
        formData.append('pickupDate', newOrder.pickupDate || '');
        formData.append('district', newOrder.district || '');
        formData.append('village', newOrder.village || '');
        formData.append('street', newOrder.street || '');
        formData.append('receivedBy', masterId);

        // Rasmlar
        if (newOrder.phoneImage instanceof File) {
            formData.append('phoneImage', newOrder.phoneImage);
        }

        if (newOrder.clientImage instanceof File) {
            formData.append('clientImage', newOrder.clientImage);
        }

        try {
            const res = await createOrder(formData);

            if (res?.offline) {
                showNotification("Internet yo‘q, buyurtma offline saqlandi ☑️", "success");
            } else {
                showNotification("Buyurtma serverga yuborildi ✅", "success");
            }
            refreshOrders();
            onClose();
        } catch (err) {
            console.error(err);
            showNotification("Saqlashda xatolik ❌", "error");
        }
    };


    // Kamera yopish
    const closeCamera = () => {
        setShowPhoneCamera(false);
        setShowClientCamera(false);
        const stream = videoRef.current?.srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());
    };

    return (
        <div className="modal animate-fade-in" onClick={onClose}>
            <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
                <h3>{t.addOrder || "Yangi buyurtma qo'shish"}</h3>

                {/* Mijoz ma'lumotlari */}
                <div className="form-grid-days">
                    <div className="form-group">
                        <label>{t.customerName || "Mijoz ismi familiyasi"} *</label>
                        <input
                            type="text"
                            value={newOrder.customerName || ''}
                            onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                            placeholder="Ahmadjon Aliyev"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>{t.phoneNumber || "Telefon raqami"}</label>
                        <div className="phone-input-wrapper">
                            <span className="phone-prefix">+998</span>
                            <input
                                type="text"
                                value={displayPhoneNumber()}
                                onChange={handlePhoneNumberChange}
                                placeholder="94 123 45 67"
                                maxLength="12" // 94 123 45 67 → 12 belgi (bo'shliqlar bilan)
                                className="phone-input"
                            />
                        </div>
                    </div>
                </div>


                {/* Manzil ma'lumotlari */}
                <div className="form-grid">
                    {/* Tuman */}
                    <div className="form-group">
                        <label>Tuman *</label>
                        <select
                            value={district}
                            onChange={(e) => {
                                setDistrict(e.target.value);
                                setNewOrder({
                                    ...newOrder,
                                    district: e.target.value,
                                    village: '',
                                    street: ''
                                });
                            }}
                        >
                            {namanganDistricts?.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Qishloq */}
                    <div className="form-group">
                        <label>Qishloq / Shahar *</label>

                        {district === "Pop tumani" ? (
                            <select
                                value={newOrder.village || ''}
                                onChange={(e) =>
                                    setNewOrder({ ...newOrder, village: e.target.value })
                                }
                            >
                                <option value="">Tanlang</option>
                                {popVillages?.map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                placeholder="Qishloq yoki shahar nomi"
                                value={newOrder.village || ''}
                                onChange={(e) =>
                                    setNewOrder({ ...newOrder, village: e.target.value })
                                }
                            />
                        )}
                    </div>

                    {/* Ko‘cha */}
                    <div className="form-group">
                        <label>Aniq ko‘cha manzili *</label>
                        <input
                            type="text"
                            placeholder="Masalan: Mustaqillik ko‘chasi, 15-uy"
                            value={newOrder.street || ''}
                            onChange={(e) =>
                                setNewOrder({ ...newOrder, street: e.target.value })
                            }
                        />
                    </div>
                </div>


                {/* Telefon brendi, modeli va rangi */}
                <div className="form-grid">
                    <div className="form-group">
                        <label>{t.phoneBrand || "Brend"} *</label>
                        <select
                            value={selectedBrand}
                            onChange={(e) => handleBrandChange(e.target.value)}
                        >
                            <option value="">Tanlang</option>
                            {brends?.map((brand, inx) => (
                                <option key={inx} value={brand}>{brand}</option>
                            ))}
                            <option value="Boshqa">Boshqa</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t.phoneModel || "Model"} *</label>
                        {selectedBrand && selectedBrand !== 'Boshqa' ? (
                            <select
                                value={newOrder.phoneModel || ''}
                                onChange={(e) => setNewOrder({ ...newOrder, phoneModel: e.target.value })}
                                disabled={!selectedBrand}
                            >
                                <option value="">Tanlang</option>
                                {availableModels?.map((model) => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={newOrder.phoneModel || ''}
                                onChange={(e) => setNewOrder({ ...newOrder, phoneModel: e.target.value })}
                                placeholder="Masalan: Honor 90, Vivo Y78..."
                                disabled={!selectedBrand}
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <label>{t.color || "Rang"}</label>
                        {selectedBrand && selectedBrand !== 'Boshqa' && availableColors?.length > 0 ? (
                            <select
                                value={newOrder.color || ''}
                                onChange={(e) => setNewOrder({ ...newOrder, color: e.target.value })}
                            >
                                <option value="">Tanlang</option>
                                {availableColors.map((color, index) => (
                                    <option key={index} value={color}>{color}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={newOrder.color || ''}
                                onChange={(e) => setNewOrder({ ...newOrder, color: e.target.value })}
                                placeholder="Qora, Ko'k, Oq..."
                            />
                        )}
                    </div>
                </div>

                {/* Kelgan holati */}
                <div className="form-group">
                    <label>{t.condition || "Kelgan holati"} *</label>
                    <select
                        value={newOrder.condition || ''}
                        onChange={(e) => setNewOrder({ ...newOrder, condition: e.target.value })}
                    >
                        <option value="">Tanlang</option>
                        <option value="ochiq-keldi">Ochiq keldi</option>
                        <option value="yoniq-keldi">Yoniq keldi</option>
                        <option value="boshqa">Boshqa</option>
                    </select>
                    {newOrder.condition === 'boshqa' && (
                        <input
                            type="text"
                            className="form-control mt-2"
                            placeholder="Batafsil yozing..."
                            value={newOrder.conditionDetail || ''}
                            onChange={(e) => setNewOrder({ ...newOrder, conditionDetail: e.target.value })}
                        />
                    )}
                </div>

                {/* Muammo tavsifi */}
                <div className="form-group">
                    <label>{t.problem || "Muammo tavsifi"} *</label>
                    <textarea
                        rows="3"
                        value={newOrder.problem || ''}
                        onChange={(e) => setNewOrder({ ...newOrder, problem: e.target.value })}
                        placeholder="Ekrani oq bo'lib qolgan, zaryad tutmaydi..."
                    />
                </div>

                {/* 50% Diagnostika - endi SELECT + qo'shimcha input */}
                <div className="form-group">
                    <label>{t.initialDiagnosis || "50% Diagnostika (taxminiy sabab)"}</label>
                    <select
                        value={newOrder.initialDiagnosis || ''}
                        onChange={(e) => setNewOrder({ ...newOrder, initialDiagnosis: e.target.value })}
                    >
                        <option value="">Tanlang yoki yozing</option>
                        {diagnosisOptions?.map((option, inx) => (
                            <option key={inx} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    {/* Agar "Boshqa" tanlansa yoki o'zi yozmoqchi bo'lsa */}
                    {(newOrder.initialDiagnosis === "Boshqa (qo'shimcha yozing)" ||
                        (!diagnosisOptions.includes(newOrder.initialDiagnosis) && newOrder.initialDiagnosis)) && (
                            <input
                                type="text"
                                className="mt-2"
                                placeholder="O'zingiz yozing..."
                                value={newOrder.initialDiagnosis || ''}
                                onChange={(e) => setNewOrder({ ...newOrder, initialDiagnosis: e.target.value })}
                            />
                        )}
                </div>

                {/* Muddatlar */}
                <div className="form-grid-days">
                    <div className="form-group">
                        <label>{t.repairDays || "Tuzatish muddati (kun)"}</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={newOrder.repairDays || ''}
                            onChange={(e) => setNewOrder({ ...newOrder, repairDays: e.target.value })}
                            placeholder="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t.pickupDate || "Olib ketish sanasi"}</label>
                        <input
                            type="date"
                            value={newOrder.pickupDate || ''}
                            onChange={(e) => setNewOrder({ ...newOrder, pickupDate: e.target.value })}
                        />
                    </div>
                </div>

                {/* Rasmlar yuklash bo'limi */}
                <div className="image-upload-section">
                    {/* Telefon rasmi */}
                    <div className="form-group relative">
                        <label className="flex items-center gap-2">
                            <Camera size={18} /> Telefon rasmi
                        </label>
                        <button
                            type="button"
                            className="upload-btn"
                            onClick={() => setShowPhonePopover(!showPhonePopover)}
                        >
                            <Upload size={18} /> Rasm qo‘shish
                        </button>

                        {showPhonePopover && (
                            <div className="popover">
                                <label className="popover-btn">
                                    🖼 Galereya
                                    <input type="file" accept="image/*" hidden onChange={handlePhoneImageChange} />
                                </label>
                                <button className="popover-btn" onClick={() => openCamera('phone')}>
                                    📷 Kamera
                                </button>
                            </div>
                        )}

                        {phonePreview && (
                            <img src={phonePreview} alt="Telefon rasmi" className="image-preview mt-2" />
                        )}
                    </div>

                    {/* Mijoz rasmi */}
                    <div className="form-group relative">
                        <label className="flex items-center gap-2">
                            <Camera size={18} /> Mijoz rasmi
                        </label>
                        <button
                            type="button"
                            className="upload-btn"
                            onClick={() => setShowClientPopover(!showClientPopover)}
                        >
                            <Upload size={18} /> Rasm qo‘shish
                        </button>

                        {showClientPopover && (
                            <div className="popover">
                                <label className="popover-btn">
                                    🖼 Galereya
                                    <input type="file" accept="image/*" hidden onChange={handleClientImageChange} />
                                </label>
                                <button className="popover-btn" onClick={() => openCamera('client')}>
                                    📷 Kamera
                                </button>
                            </div>
                        )}

                        {clientPreview && (
                            <img src={clientPreview} alt="Mijoz rasmi" className="image-preview mt-2" />
                        )}
                    </div>
                </div>

                {/* Kamera oynasi */}
                {(showPhoneCamera || showClientCamera) && (
                    <div className="camera-box">
                        <video ref={videoRef} autoPlay playsInline muted />
                        <canvas ref={canvasRef} hidden />

                        <div className="absolute-bottom">
                            <button onClick={closeCamera} className="close-camera-btn">
                                ✕
                            </button>
                            <button onClick={takePhoto} className="capture-btn">
                                📸
                            </button>
                        </div>
                    </div>
                )}

                {/* Tugmalar */}
                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">
                        {t.cancel || "Bekor qilish"}
                    </button>
                    <button disabled={isLoading} onClick={handleSave} className="save-btn">
                        {t.save || "Saqlash"}
                    </button>
                </div>
            </div>
        </div>
    );
}