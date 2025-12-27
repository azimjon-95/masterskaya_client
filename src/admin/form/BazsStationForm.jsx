import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { IoImageOutline } from "react-icons/io5";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { TiDropbox } from "react-icons/ti";
import {
    useGetBazsStationsQuery,
    useCreateBazsStationMutation,
    useUpdateBazsStationMutation,
    useDeleteBazsStationMutation,
} from '../../context/productionApi';
import './style.css';

const BazsStationForm = ({ lang = 'uz', onSubmit, initialData = null, onClose }) => {
    const [currentLang, setCurrentLang] = useState(lang);
    const [loading, setLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState({ ru: null, en: null, uz: null });
    const [imagePreviews, setImagePreviews] = useState({
        ru: initialData?.ru?.img || '',
        en: initialData?.en?.img || '',
        uz: initialData?.uz?.img || '',
    });

    const initialFormData = {
        ru: {
            title: '', img: '',
            labels: { canopy: '', ceiling: '', logo: '', neon: '', panel: '', pump: '', safety: '', security: '', portal: '', tanks: '' },
            intro: '', usage: '', volumeDesc: '',
            fuelVariants: [''], additionalList: [''],
            safetyDesc: '', lowLevel: '', automationNote: '',
            servicesDesc: '', desc: '',
            advantagesList: [''], documentsList: [''],
        },
        en: {
            title: '', img: '',
            labels: { canopy: '', ceiling: '', logo: '', neon: '', panel: '', pump: '', safety: '', security: '', portal: '', tanks: '' },
            intro: '', usage: '', volumeDesc: '',
            fuelVariants: [''], additionalList: [''],
            safetyDesc: '', lowLevel: '', automationNote: '',
            servicesDesc: '', desc: '',
            advantagesList: [''], documentsList: [''],
        },
        uz: {
            title: '', img: '',
            labels: { canopy: '', ceiling: '', logo: '', neon: '', panel: '', pump: '', safety: '', security: '', portal: '', tanks: '' },
            intro: '', usage: '', volumeDesc: '',
            fuelVariants: [''], additionalList: [''],
            safetyDesc: '', lowLevel: '', automationNote: '',
            servicesDesc: '', desc: '',
            advantagesList: [''], documentsList: [''],
        },
    };

    const [formData, setFormData] = useState(initialData || initialFormData);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setImagePreviews({
                ru: initialData.ru?.img || '',
                en: initialData.en?.img || '',
                uz: initialData.uz?.img || '',
            });
        }
    }, [initialData]);

    const languages = { ru: 'Русский', en: 'English', uz: "O'zbek" };

    const uiLabels = {
        ru: {
            formTitle: initialData ? 'Редактировать станцию BAZS' : 'Регистрация станции BAZS',
            imageSection: 'Изображение станции',
            basicInfo: 'Основная информация',
            labelsSection: 'Метки',
            specsSection: 'Технические характеристики',
            volumeFuel: 'Объем и топливо',
            additionalInfo: 'Дополнительная информация',
            safetyAutomation: 'Системы безопасности',
            servicesSection: 'Дополнительные услуги',
            descAdvantages: 'Блочная АЗС, БАЗС',
            documentsSection: 'Документы',
            submitBtn: initialData ? 'Обновить станцию' : 'Зарегистрировать станцию',
            submitting: initialData ? 'Обновление...' : 'Регистрация...',
            add: 'Добавить',
            close: 'Закрыть',
        },
        en: {
            formTitle: initialData ? 'Edit BAZS Station' : 'BAZS Station Registration',
            imageSection: 'Station Image',
            basicInfo: 'Basic Information',
            labelsSection: 'Labels',
            specsSection: 'Technical Specifications',
            volumeFuel: 'Volume and Fuel',
            additionalInfo: 'Additional Information',
            safetyAutomation: 'Safety Systems',
            servicesSection: 'Additional Services',
            descAdvantages: 'Block Fuel Station (BAZS)',
            documentsSection: 'Documents',
            submitBtn: initialData ? 'Update Station' : 'Register Station',
            submitting: initialData ? 'Updating...' : 'Registering...',
            add: 'Add',
            close: 'Close',
        },
        uz: {
            formTitle: initialData ? "BAZS stansiyasini tahrirlash" : "BAZS stansiyasini ro'yxatdan o'tkazish",
            imageSection: 'Stansiya rasmi',
            basicInfo: 'Asosiy maʼlumotlar',
            labelsSection: 'Yorliqlar',
            specsSection: 'Texnik xususiyatlar',
            volumeFuel: 'Hajm va yoqilg‘i',
            additionalInfo: "Qo'shimcha maʼlumotlar",
            safetyAutomation: 'Xavfsizlik tizimlari',
            servicesSection: "Qo'shimcha xizmatlar",
            descAdvantages: 'Blok avtoyukilg‘i stansiyasi (BAZS)',
            documentsSection: 'Hujjatlar',
            submitBtn: initialData ? "Stansiyani yangilash" : "Stansiyani ro'yxatdan o'tkazish",
            submitting: initialData ? "Yangilanmoqda..." : "Ro'yxatdan o'tkazilmoqda...",
            add: "Qo'shish",
            close: 'Yopish',
        },
    };

    const fieldLabels = {
        ru: {
            title: 'Название', caption: 'Подпись', alt: 'Alt текст',
            canopy: 'Навес', ceiling: 'Потолок', logo: 'Зона навеса', neon: 'Неоновая подсветка',
            panel: 'Электронное табло цены топлива', pump: 'Манипуляторы насоса',
            safety: 'Блок приёма платежей', security: 'Неразмещающие оборонение островка безопасности',
            portal: 'Портал', tanks: 'Отсеки АИ-95, АИ-92, ДТ',
            specsTitle: 'Технические характеристики', intro: 'Технические характеристики', usage: 'Использование',
            volumeTitle: 'Объём МАЗС, м³', volumeDesc: 'Объём МАЗС, м³', fuelTitle: 'Вариант топлива',
            fuelVariants: 'Вариант топлива', additional: 'Дополнительные возможности', additionalList: 'Дополнительные возможности',
            safetyDesc: 'Описание безопасности', lowLevel: 'Контроль уровня низкого', automationNote: 'Заметка об автоматизации',
            services: 'Дополнительные услуги', servicesDesc: 'Дополнительные услуги', descTitle: 'Заголовок описания',
            desc: 'Описание', advantages: 'Преимущества', advantagesList: 'Список преимуществ',
            documents: 'Документы', documentsList: 'Список документов',
        },
        en: {
            title: 'Title',
            caption: 'Caption',
            alt: 'Alt Text',
            canopy: 'Canopy',
            ceiling: 'Ceiling',
            logo: 'Canopy Zone',
            neon: 'Neon Lighting',
            panel: 'Fuel Price Electronic Display',
            pump: 'Pump Manipulators',
            safety: 'Payment Acceptance Unit',
            security: 'Non-Displaceable Safety Island Protection',
            portal: 'Portal',
            tanks: 'AI-95, AI-92, DT Compartments',
            specsTitle: 'Technical Specifications',
            intro: 'Technical Specifications',
            usage: 'Usage',
            volumeTitle: 'BAZS Volume, m³',
            volumeDesc: 'BAZS Volume, m³',
            fuelTitle: 'Fuel Variant',
            fuelVariants: 'Fuel Variant',
            additional: 'Additional Features',
            additionalList: 'Additional Features',
            safetyDesc: 'Safety Description',
            lowLevel: 'Low Level Control',
            automationNote: 'Automation Note',
            services: 'Additional Services',
            servicesDesc: 'Additional Services',
            descTitle: 'Description Title',
            desc: 'Description',
            advantages: 'Advantages',
            advantagesList: 'List of Advantages',
            documents: 'Documents',
            documentsList: 'List of Documents'
        },
        uz: {
            title: 'Nomi',
            caption: 'Sarlavha',
            alt: 'Alt matn',
            canopy: 'Soyabon',
            ceiling: 'Shift',
            logo: 'Soyabon zonasi',
            neon: 'Neon yoritgichi',
            panel: 'Yoqilg‘i narxi elektron displeyi',
            pump: 'Nasos manipulyatorlari',
            safety: 'To‘lov qabul qilish bloki',
            security: 'Xavfsizlik orolchasi himoyasi',
            portal: 'Portal',
            tanks: 'AI-95, AI-92, DT bo‘linmalari',
            specsTitle: 'Texnik xususiyatlar',
            intro: 'Texnik xususiyatlar',
            usage: 'Foydalanish',
            volumeTitle: 'BAZS hajmi, m³',
            volumeDesc: 'BAZS hajmi, m³',
            fuelTitle: 'Yoqilg‘i turi',
            fuelVariants: 'Yoqilg‘i turi',
            additional: "Qo'shimcha imkoniyatlar",
            additionalList: "Qo'shimcha imkoniyatlar",
            safetyDesc: 'Xavfsizlik tavsifi',
            lowLevel: 'Past daraja nazorati',
            automationNote: 'Avtomatlashtirish eslatmasi',
            services: "Qo'shimcha xizmatlar",
            servicesDesc: "Qo'shimcha xizmatlar",
            descTitle: 'Tavsif sarlavhasi',
            desc: 'Tavsif',
            advantages: 'Afzalliklar',
            advantagesList: 'Afzalliklar ro‘yxati',
            documents: 'Hujjatlar',
            documentsList: 'Hujjatlar ro‘yxati'
        }
    };

    const handleInputChange = (field, value, isArray = false, index = null) => {
        setFormData(prev => {
            const newData = { ...prev };
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                if (isArray && index !== null) {
                    newData[currentLang][parent][child][index] = value;
                } else {
                    newData[currentLang][parent][child] = value;
                }
            } else {
                if (isArray && index !== null) {
                    newData[currentLang][field][index] = value;
                } else {
                    newData[currentLang][field] = value;
                }
            }
            return newData;
        });
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [currentLang]: {
                ...prev[currentLang],
                [field]: [...prev[currentLang][field], '']
            }
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [currentLang]: {
                ...prev[currentLang],
                [field]: prev[currentLang][field].filter((_, i) => i !== index)
            }
        }));
    };

    const handleImageUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await fetch('https://api.imgbb.com/1/upload?key=37423bbbccb5ae70b43a07dfe04bc38c', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                return data.data.url;
            }
            toast.error(fieldLabels[currentLang]?.imageUploadError || 'Rasm yuklash muvaffaqiyatsiz yakunlandi');
            return null;
        } catch (error) {
            toast.error(fieldLabels[currentLang]?.imageUploadError || 'Rasm yuklashda xatolik yuz berdi');
            return null;
        }
    };

    const handleFileChange = (e, langCode) => {
        const file = e.target.files[0];
        if (file) {
            setImageFiles(prev => ({ ...prev, [langCode]: file }));
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => ({ ...prev, [langCode]: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const submitData = { ...formData };
            for (const langCode of Object.keys(languages)) {
                if (imageFiles[langCode]) {
                    const imageUrl = await handleImageUpload(imageFiles[langCode]);
                    if (!imageUrl) {
                        toast.error(fieldLabels[currentLang]?.imageUploadError || 'Rasm yuklash muvaffaqiyatsiz yakunlandi');
                        setLoading(false);
                        return;
                    }
                    submitData[langCode].img = imageUrl;
                } else {
                    submitData[langCode].img = imagePreviews[langCode] || '';
                }
            }
            await onSubmit(submitData);
            setFormData(initialFormData);
            setImageFiles({ ru: null, en: null, uz: null });
            setImagePreviews({ ru: '', en: '', uz: '' });
            onClose();
        } catch (error) {
            toast.error(fieldLabels[currentLang]?.submitError || 'Xatolik yuz berdi');
        }
        setLoading(false);
    };

    const renderInput = (field, label, type = 'text', isTextarea = false) => {
        const value = field.includes('.') ?
            formData[currentLang][field.split('.')[0]][field.split('.')[1]] :
            formData[currentLang][field];
        return (
            <div className="regu-form-group" key={field}>
                <label className="regu-label">{label}</label>
                {isTextarea ? (
                    <textarea
                        className="regu-textarea"
                        value={value}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        rows={4}
                    />
                ) : (
                    <input
                        className="regu-input"
                        type={type}
                        value={value}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                    />
                )}
            </div>
        );
    };

    const renderArrayInput = (field, label) => {
        const items = formData[currentLang][field];
        return (
            <div className="regu-form-group" key={field}>
                <label className="regu-label">{label}</label>
                {items.map((item, index) => (
                    <div key={index} className="regu-array-item">
                        <input
                            className="regu-input"
                            value={item}
                            onChange={(e) => handleInputChange(field, e.target.value, true, index)}
                            placeholder={`${label} ${index + 1}`}
                        />
                        {items.length > 1 && (
                            <button
                                type="button"
                                className="regu-remove-btn"
                                onClick={() => removeArrayItem(field, index)}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    className="regu-add-btn"
                    onClick={() => addArrayItem(field)}
                >
                    {uiLabels[currentLang]?.add} {label}
                </button>
            </div>
        );
    };

    return (
        <div className="regu-container">
            <div className="regu-header">
                <h1 className="regu-title">{uiLabels[currentLang]?.formTitle}</h1>
                <div className="regu-lang-buttons">
                    {Object.entries(languages).map(([code, name]) => (
                        <button
                            key={code}
                            className={`regu-lang-btn ${currentLang === code ? 'regu-active' : ''}`}
                            onClick={() => setCurrentLang(code)}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="regu-form">
                <div className="regu-section">
                    <h3 className="regu-section-title">{uiLabels[currentLang]?.imageSection}</h3>
                    <div className="regu-section-box">
                        {Object.keys(languages).map(langCode => (
                            <div key={langCode} className="regu-lang-image-section">
                                <label className="regu-labelimg">{`${uiLabels[currentLang]?.imageSection} (${languages[langCode]})`}
                                    <br />
                                    {!imagePreviews[langCode] && (
                                        <IoImageOutline />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, langCode)}
                                        className="regu-file-input"
                                    />
                                </label>
                                {imagePreviews[langCode] && (
                                    <div className="regu-image-preview">
                                        <img src={imagePreviews[langCode]} alt={`Preview ${langCode}`} className="regu-preview-img" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="regu-section">
                    <h3 className="regu-section-title">{uiLabels[currentLang]?.basicInfo}</h3>
                    {renderInput('title', fieldLabels[currentLang]?.title)}
                </div>
                <div className="regu-section">
                    <h3 className="regu-section-title">{uiLabels[currentLang]?.labelsSection}</h3>
                    <div className="regu-grid">
                        {Object.keys(formData[currentLang]?.labels).map(labelKey =>
                            renderInput(`labels.${labelKey}`, fieldLabels[currentLang][labelKey])
                        )}
                    </div>
                </div>
                <div className="regu-section">
                    <h3 className="regu-section-title">{uiLabels[currentLang]?.specsSection}</h3>
                    {renderInput('intro', fieldLabels[currentLang]?.intro, 'text', true)}
                    {renderInput('usage', fieldLabels[currentLang]?.usage, 'text', true)}
                </div>
                <div className="regu-section">
                    <h3 className="regu-section-title">{uiLabels[currentLang]?.volumeFuel}</h3>
                    {renderInput('volumeDesc', fieldLabels[currentLang]?.volumeDesc, 'text', true)}
                    {renderArrayInput('fuelVariants', fieldLabels[currentLang]?.fuelVariants)}
                </div>
                <div className="regu-section">
                    <h3 className="regu-section-title">{uiLabels[currentLang]?.additionalInfo}</h3>
                    {renderArrayInput('additionalList', fieldLabels[currentLang]?.additionalList)}
                </div>
                <div className="regu-section">
                    <h3 className="regu-section-title">{uiLabels[currentLang]?.safetyAutomation}</h3>
                    {renderInput('safetyDesc', fieldLabels[currentLang]?.safetyDesc, 'text', true)}
                    {renderInput('lowLevel', fieldLabels[currentLang]?.lowLevel)}
                    {renderInput('automationNote', fieldLabels[currentLang]?.automationNote, 'text', true)}
                    {renderInput('servicesDesc', fieldLabels[currentLang]?.servicesDesc, 'text', true)}
                </div>
                <div className="regu-section">
                    <h3 className="regu-section-title">{uiLabels[currentLang]?.descAdvantages}</h3>
                    {renderInput('desc', fieldLabels[currentLang]?.desc, 'text', true)}
                    {renderArrayInput('advantagesList', fieldLabels[currentLang]?.advantagesList)}
                </div>
                <div className="regu-section">
                    <h3 className="regu-section-title">{uiLabels[currentLang]?.documentsSection}</h3>
                    {renderArrayInput('documentsList', fieldLabels[currentLang]?.documentsList)}
                </div>
                <div className="flex gap-4">
                    <button
                        type="button"
                        className="regu-submit-btn"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? uiLabels[currentLang]?.submitting : uiLabels[currentLang]?.submitBtn}
                    </button>
                    <button
                        type="button"
                        className="regu-close-btn"
                        onClick={onClose}
                    >

                        <HiOutlineArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

const BazsStationManager = ({ lang = "ru" }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const { data: stations, isLoading, refetch } = useGetBazsStationsQuery();
    const [createStation, { isLoading: isCreating }] = useCreateBazsStationMutation();
    const [updateStation, { isLoading: isUpdating }] = useUpdateBazsStationMutation();
    const [deleteStation, { isLoading: isDeleting }] = useDeleteBazsStationMutation();

    const handleCreate = () => {
        setEditingStation(null);
        setIsDrawerOpen(true);
    };

    const handleEdit = (station) => {
        setEditingStation(station);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ushbu stansiyani o'chirishga ishonchingiz komilmi?")) {
            try {
                await deleteStation(id).unwrap();
                refetch()
                toast.success("Stansiya muvaffaqiyatli o'chirildi!");
            } catch (error) {
                toast.error("Stansiyani o'chirishda xatolik yuz berdi");
            }
        }
    };

    const handleSubmit = async (data) => {
        try {
            if (editingStation) {
                await updateStation({ id: editingStation.id, ...data }).unwrap();
                toast.success("Stansiya muvaffaqiyatli yangilandi!");
            } else {
                await createStation(data).unwrap();
                toast.success("Stansiya muvaffaqiyatli yaratildi!");
            }
            refetch()
            setIsDrawerOpen(false);
            setEditingStation(null);
        } catch (error) {
            toast.error("Stansiyani saqlashda xatolik yuz berdi");
        }
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setEditingStation(null);
    };
    // Log language-specific data for each station
    const data = stations?.innerData?.map((station) => {
        return {
            ...station[lang], // Spread the language-specific data (e.g., en, ru, uz)
            _id: station._id  // Add the _id from the station
        };
    });

    // Oxirgi yaratilgan ma'lumotni obyekt sifatida olish
    const content = data && data.length > 0 ? data[data.length - 1] : null;

    return (
        <div className="fgl-container">


            {isLoading ? (
                <div className="fgl-loading">Yuklanmoqda...</div>
            ) : (

                <div className="azs-container">
                    {stations?.innerData?.length === 0
                        ?
                        (
                            <div className="azs-station-overview">
                                <TiDropbox style={{ fontSize: "70px", marginTop: "10px" }} />
                            </div>
                        )
                        :
                        (
                            <>
                                {/* Station Images */}
                                <section className="azs-images">
                                    <div className="azs-station-overview">
                                        <p className="azs-image-caption">{content?.title}</p>
                                        <img
                                            src={content?.img}
                                            alt="No img"
                                            className="azs-main-image"
                                        />
                                    </div>

                                    <div className="azs-component-labels">
                                        <div className="azs-label azs-label-canopy">{content?.labels?.canopy}</div>
                                        <div className="azs-label azs-label-ceiling">{content?.labels?.ceiling}</div>
                                        <div className="azs-label azs-label-logo">{content?.labels?.logo}</div>
                                        <div className="azs-label azs-label-neon">{content?.labels?.neon}</div>
                                        <div className="azs-label azs-label-panel">{content?.labels?.panel}</div>
                                        <div className="azs-label azs-label-pump">{content?.labels?.pump}</div>
                                        <div className="azs-label azs-label-safety">{content?.labels?.safety}</div>
                                        <div className="azs-label azs-label-security">{content?.labels?.security}</div>
                                        <div className="azs-label azs-label-portal">{content?.labels?.portal}</div>
                                        <div className="azs-label azs-label-tanks">{content?.labels?.tanks}</div>
                                    </div>
                                </section>

                                {/* Technical Specifications */}
                                <section className="azs-specifications">
                                    <h3>Технические характеристики</h3>
                                    <p className="azs-intro">{content?.intro}</p>
                                    <p className="azs-usage"><strong>{content?.usage}</strong></p>

                                    <div className="azs-fuel-types">
                                        <div className="azs-fuel-item">
                                            <h4>Объём МАЗС, м³:</h4>
                                            <p>{content?.volumeDesc}</p>
                                        </div>

                                        <div className="azs-fuel-variants">
                                            <div className="azs-variant">
                                                <h4>Вариант топлива:</h4>
                                                <ul>
                                                    {content?.fuelVariants.map((variant, index) => (
                                                        <li key={index}>{variant}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="azs-features">
                                        <h4>Дополнительные возможности:</h4>
                                        <ul>
                                            {content?.additionalList.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="azs-safety">
                                        <h4>Системы безопасности:</h4>
                                        <p>{content?.safetyDesc}</p>
                                        <p><strong>{content?.lowLevel}</strong></p>
                                        <p className="azs-automation-note">
                                            <em>{content?.automationNote}</em>
                                        </p>
                                    </div>

                                    <div className="azs-services">
                                        <h4>Дополнительные услуги:</h4>
                                        <p>{content?.servicesDesc}</p>
                                    </div>
                                </section>

                                {/* Detailed Description */}
                                <section className="azs-description">
                                    <h3>БЛОЧНАЯ АВТОЗАПРАВОЧНАЯ СТАНЦИЯ (Блочная АЗС, БАЗС)</h3>
                                    <p>
                                        {content?.desc}
                                    </p>

                                    <div className="azs-advantages">
                                        <h4>Преимущества</h4>
                                        <ol>
                                            {content?.advantagesList.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </section>

                                {/* Documents */}
                                <section className="azs-documents">
                                    <h3>Документы:</h3>
                                    <ul>
                                        {content?.documentsList.map((doc, index) => (
                                            <li key={index}>{doc}</li>
                                        ))}
                                    </ul>
                                </section>
                            </>
                        )
                    }
                    <div className="fgl-card-actions">
                        <button
                            className="fgl-add-btn"
                            onClick={handleCreate}
                        >
                            Yangi Stansiya Qo'shish
                        </button>
                        <div className="box-container">
                            {/* <button
                                className="fgl-edit-btn"
                                onClick={() => handleEdit(content)}
                            >
                                Tahrirlash
                            </button> */}
                            <button
                                className="fgl-delete-btn"
                                onDoubleClick={() => handleDelete(content._id)}
                                disabled={isDeleting}
                            >
                                O'chirish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`fgl-drawer-overlay ${isDrawerOpen ? 'fgl-drawer-overlay-open' : ''}`} onClick={handleCloseDrawer}></div>
            <div className={`fgl-drawer ${isDrawerOpen ? 'fgl-drawer-open' : ''}`}>
                {isDrawerOpen && (
                    <BazsStationForm
                        lang="uz"
                        onSubmit={handleSubmit}
                        initialData={editingStation}
                        onClose={handleCloseDrawer}
                    />
                )}
            </div>
        </div>



    );
};


export default BazsStationManager;