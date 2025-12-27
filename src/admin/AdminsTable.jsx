import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Save, User, Lock, FileText, Loader2 } from 'lucide-react';
import { useCreateAdminMutation, useGetAdminsQuery, useUpdateAdminMutation, useDeleteAdminMutation } from '../context/adminApi';
import './css/admin.css';

// Translation object
const translations = {
    en: {
        title: 'Admin Management',
        addAdmin: 'Add Admin',
        loading: 'Loading data...',
        error: 'Error: ',
        retry: 'Retry',
        noAdmins: 'No admins yet',
        username: 'Username',
        fullname: 'Full Name',
        createdAt: 'Created Date',
        actions: 'Actions',
        edit: 'Edit',
        delete: 'Delete',
        editAdmin: 'Edit Admin',
        addNewAdmin: 'Add New Admin',
        usernameRequired: 'Username is required',
        fullnameRequired: 'Full Name is required',
        passwordRequired: 'Password is required',
        passwordLength: 'Password must be at least 6 characters',
        createError: 'Error creating admin',
        updateError: 'Error updating admin',
        deleteConfirm: 'Are you sure you want to delete this admin?',
        passwordPlaceholder: 'Enter password (leave blank to keep unchanged)',
        cancel: 'Cancel',
        save: 'Save',
        add: 'Add',
        usernamePlaceholder: 'Enter username',
        fullnamePlaceholder: 'Enter full name',
        passwordInputPlaceholder: 'Enter password'
    },
    ru: {
        title: 'Управление администраторами',
        addAdmin: 'Добавить администратора',
        loading: 'Загрузка данных...',
        error: 'Ошибка: ',
        retry: 'Повторить',
        noAdmins: 'Администраторов пока нет',
        username: 'Имя пользователя',
        fullname: 'Полное имя',
        createdAt: 'Дата создания',
        actions: 'Действия',
        edit: 'Редактировать',
        delete: 'Удалить',
        editAdmin: 'Редактировать администратора',
        addNewAdmin: 'Добавить нового администратора',
        usernameRequired: 'Имя пользователя обязательно',
        fullnameRequired: 'Полное имя обязательно',
        passwordRequired: 'Пароль обязателен',
        passwordLength: 'Пароль должен содержать не менее 6 символов',
        createError: 'Ошибка при создании администратора',
        updateError: 'Ошибка при обновлении администратора',
        deleteConfirm: 'Вы уверены, что хотите удалить этого администратора?',
        passwordPlaceholder: 'Введите пароль (оставьте пустым, чтобы не менять)',
        cancel: 'Отмена',
        save: 'Сохранить',
        add: 'Добавить',
        usernamePlaceholder: 'Введите имя пользователя',
        fullnamePlaceholder: 'Введите полное имя',
        passwordInputPlaceholder: 'Введите пароль'
    },
    uz: {
        title: 'Adminlar Boshqaruvi',
        addAdmin: 'Admin Qo\'shish',
        loading: 'Ma\'lumotlar yuklanmoqda...',
        error: 'Xatolik: ',
        retry: 'Qayta urinish',
        noAdmins: 'Hozircha adminlar yo\'q',
        username: 'Username',
        fullname: 'To\'liq Ism',
        createdAt: 'Yaratilgan Sana',
        actions: 'Amallar',
        edit: 'Tahrirlash',
        delete: 'O\'chirish',
        editAdmin: 'Adminni Tahrirlash',
        addNewAdmin: 'Yangi Admin Qo\'shish',
        usernameRequired: 'Username majburiy',
        fullnameRequired: 'To\'liq ism majburiy',
        passwordRequired: 'Parol majburiy',
        passwordLength: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
        createError: 'Admin yaratishda xatolik yuz berdi',
        updateError: 'Admin yangilashda xatolik yuz berdi',
        deleteConfirm: 'Adminni o\'chirishga ishonchingiz komilmi?',
        passwordPlaceholder: 'Parol kiriting (o\'zgartirmaslik uchun bo\'sh qoldiring)',
        cancel: 'Bekor qilish',
        save: 'Saqlash',
        add: 'Qo\'shish',
        usernamePlaceholder: 'Username kiriting',
        fullnamePlaceholder: 'To\'liq ismni kiriting',
        passwordInputPlaceholder: 'Parol kiriting'
    }
};

const AdminManagement = ({ lang = 'uz', searchTerm = '' }) => {
    // RTK Query hooks
    const { data: admins = [], isLoading, isError, error, refetch } = useGetAdminsQuery();
    const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
    const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
    const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullname: ''
    });
    const [errors, setErrors] = useState({});

    // Get translations based on lang prop
    const t = translations[lang] || translations.uz;

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = t.usernameRequired;
        if (!formData.fullname.trim()) newErrors.fullname = t.fullnameRequired;
        if (!currentAdmin && !formData.password.trim()) newErrors.password = t.passwordRequired;
        if (formData.password && formData.password.length < 6) newErrors.password = t.passwordLength;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Open modal for create/edit
    const openModal = (admin = null) => {
        setCurrentAdmin(admin);
        setFormData(admin ? {
            username: admin.username,
            fullname: admin.fullname,
            password: ''
        } : {
            username: '',
            password: '',
            fullname: ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentAdmin(null);
        setFormData({ username: '', password: '', fullname: '' });
        setErrors({});
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Create new admin
    const handleCreateAdmin = async () => {
        if (!validateForm()) return;

        try {
            await createAdmin({
                username: formData.username.trim(),
                password: formData.password,
                fullname: formData.fullname.trim()
            }).unwrap();
            closeModal();
            refetch();
        } catch (error) {
            console.error('Error creating admin:', error);
            setErrors({ submit: t.createError });
        }
    };

    // Update existing admin
    const handleUpdateAdmin = async () => {
        if (!validateForm()) return;

        try {
            const updateData = {
                username: formData.username.trim(),
                fullname: formData.fullname.trim()
            };

            // Include password if provided
            if (formData.password.trim()) {
                updateData.password = formData.password;
            }

            await updateAdmin({
                id: currentAdmin._id,
                ...updateData
            }).unwrap();
            closeModal();
            refetch();
        } catch (error) {
            console.error('Error updating admin:', error);
            setErrors({ submit: t.updateError });
        }
    };

    // Delete admin
    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm(t.deleteConfirm)) return;

        try {
            await deleteAdmin(adminId).unwrap();
            refetch();
        } catch (error) {
            console.error('Error deleting admin:', error);
        }
    };

    // Handle form submit
    const handleSubmit = () => {
        if (currentAdmin) {
            handleUpdateAdmin();
        } else {
            handleCreateAdmin();
        }
    };

    // Filter admins based on searchTerm
    const filteredAdmins = admins?.innerData?.filter(admin =>
        admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="tfu-admin-container">
            {/* Header */}
            <div className="tfu-header">
                <h2 className="tfu-title">{t.title}</h2>
                <button
                    className="tfu-btn tfu-btn-primary"
                    onClick={() => openModal()}
                    disabled={isLoading}
                >
                    <Plus size={16} />
                    {t.addAdmin}
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="tfu-loading">
                    <Loader2 size={24} className="tfu-spinner" />
                    <span>{t.loading}</span>
                </div>
            )}

            {/* Error State */}
            {isError && (
                <div className="tfu-error-banner">
                    <p>{t.error}{error?.data?.message || 'Error loading data'}</p>
                    <button className="tfu-btn tfu-btn-primary tfu-btn-sm" onClick={refetch}>
                        {t.retry}
                    </button>
                </div>
            )}

            {/* Table */}
            {!isLoading && !isError && (
                <div className="tfu-table-wrapper">
                    <table className="tfu-table">
                        <thead>
                            <tr>
                                <th>{t.username}</th>
                                <th>{t.fullname}</th>
                                <th>{t.createdAt}</th>
                                <th>{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdmins.map(admin => (
                                <tr key={admin._id}>
                                    <td>
                                        <div className="tfu-username">
                                            <User size={14} />
                                            {admin.username}
                                        </div>
                                    </td>
                                    <td>{admin.fullname}</td>
                                    <td>{new Date(admin.createdAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ')}</td>
                                    <td>
                                        <div className="tfu-actions">
                                            <button
                                                className="tfu-btn tfu-btn-edit tfu-btn-sm"
                                                onClick={() => openModal(admin)}
                                                disabled={isDeleting || isUpdating}
                                                title={t.edit}
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                className="tfu-btn tfu-btn-delete tfu-btn-sm"
                                                onClick={() => handleDeleteAdmin(admin._id)}
                                                disabled={isDeleting || isUpdating}
                                                title={t.delete}
                                            >
                                                {isDeleting ? <Loader2 size={14} className="tfu-spinner" /> : <Trash2 size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAdmins.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="tfu-empty">
                                        {t.noAdmins}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="tfu-modal-overlay" onClick={closeModal}>
                    <div className="tfu-modal" onClick={e => e.stopPropagation()}>
                        <div className="tfu-modal-header">
                            <h3>{currentAdmin ? t.editAdmin : t.addNewAdmin}</h3>
                            <button className="tfu-modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="tfu-form">
                            <div className="tfu-form-group">
                                <label className="tfu-label">
                                    <User size={16} />
                                    {t.username}
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`tfu-input ${errors.username ? 'tfu-input-error' : ''}`}
                                    placeholder={t.usernamePlaceholder}
                                />
                                {errors.username && <span className="tfu-error">{errors.username}</span>}
                            </div>

                            <div className="tfu-form-group">
                                <label className="tfu-label">
                                    <Lock size={16} />
                                    {currentAdmin ? t.passwordPlaceholder : t.password}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`tfu-input ${errors.password ? 'tfu-input-error' : ''}`}
                                    placeholder={t.passwordInputPlaceholder}
                                />
                                {errors.password && <span className="tfu-error">{errors.password}</span>}
                            </div>

                            <div className="tfu-form-group">
                                <label className="tfu-label">
                                    <FileText size={16} />
                                    {t.fullname}
                                </label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    className={`tfu-input ${errors.fullname ? 'tfu-input-error' : ''}`}
                                    placeholder={t.fullnamePlaceholder}
                                />
                                {errors.fullname && <span className="tfu-error">{errors.fullname}</span>}
                            </div>

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="tfu-error-message">
                                    {errors.submit}
                                </div>
                            )}

                            <div className="tfu-form-actions">
                                <button
                                    type="button"
                                    className="tfu-btn tfu-btn-cancel"
                                    onClick={closeModal}
                                    disabled={isCreating || isUpdating}
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="button"
                                    className="tfu-btn tfu-btn-success"
                                    onClick={handleSubmit}
                                    disabled={isCreating || isUpdating}
                                >
                                    {(isCreating || isUpdating) ? (
                                        <Loader2 size={16} className="tfu-spinner" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {currentAdmin ? t.save : t.add}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;