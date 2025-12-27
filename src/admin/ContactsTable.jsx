import React, { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import {
  useCreateContactMutation,
  useGetContactsQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from "../context/contactApi";
import "./css/contact.css";

// Translation object
const translations = {
  en: {
    title: "Contacts",
    addContact: "Add Contact",
    loading: "Loading...",
    error: "An error occurred!",
    noContacts: "No contacts found",
    salesDepartment: "Sales Department Head", // Translated from Uzbek "Sotuv Bo'limi Boshlig'i"
    exportDepartment: "Export Department",
    purchaseDepartment: "Sales Department Operator", // Translated from Uzbek "Sotuv Bo'limi Operatori"
    hrDepartment: "HR Department",
    infoDesk: "Service Department", // Translated from Uzbek "Servis Hizmat Bo'limi"
    reception: "Reception",
    telegramLink: "Telegram Link",
    whatsappLink: "WhatsApp Link",
    wechatLink: "WeChat Link",
    instagramLink1: "Instagram Link 1",
    instagramLink2: "Instagram Link 2",
    youtubeLink: "YouTube Link",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    editContact: "Edit Contact",
    newContact: "New Contact",
    cancel: "Cancel",
    save: "Save",
    update: "Update",
    deleteConfirm: "Are you sure you want to delete this contact?",
    salesDepartmentRequired: "Sales Department Head is required", // Added for consistency
    exportDepartmentRequired: "Export Department is required",
    purchaseDepartmentRequired: "Sales Department Operator is required", // Added for consistency
    hrDepartmentRequired: "HR Department is required",
    infoDeskRequired: "Service Department is required", // Added for consistency
    receptionRequired: "Reception is required",
    telegramPlaceholder: "https://t.me/username",
    whatsappPlaceholder: "https://wa.me/998901234567",
    wechatPlaceholder: "https://weixin.qq.com/r/username",
    instagramPlaceholder: "https://www.instagram.com/username",
    youtubePlaceholder: "https://www.youtube.com/@username",
    submitError: "Error saving contact",
  },
  ru: {
    title: "Контакты",
    addContact: "Добавить контакт",
    loading: "Загрузка...",
    error: "Произошла ошибка!",
    noContacts: "Контакты не найдены",
    salesDepartment: "Руководитель отдела продаж", // Translated from Uzbek "Sotuv Bo'limi Boshlig'i"
    exportDepartment: "Отдел экспорта",
    purchaseDepartment: "Оператор отдела продаж", // Translated from Uzbek "Sotuv Bo'limi Operatori"
    hrDepartment: "Отдел кадров",
    infoDesk: "Служба сервиса", // Translated from Uzbek "Servis Hizmat Bo'limi"
    reception: "Ресепшн",
    telegramLink: "Ссылка на Telegram",
    whatsappLink: "Ссылка на WhatsApp",
    wechatLink: "Ссылка на WeChat",
    instagramLink1: "Ссылка на Instagram 1",
    instagramLink2: "Ссылка на Instagram 2",
    youtubeLink: "Ссылка на YouTube",
    actions: "Действия",
    edit: "Редактировать",
    delete: "Удалить",
    editContact: "Редактировать контакт",
    newContact: "Новый контакт",
    cancel: "Отмена",
    save: "Сохранить",
    update: "Обновить",
    deleteConfirm: "Вы уверены, что хотите удалить этот контакт?",
    salesDepartmentRequired: "Руководитель отдела продаж обязателен", // Added for consistency
    exportDepartmentRequired: "Отдел экспорта обязателен",
    purchaseDepartmentRequired: "Оператор отдела продаж обязателен", // Added for consistency
    hrDepartmentRequired: "Отдел кадров обязателен",
    infoDeskRequired: "Служба сервиса обязательна", // Added for consistency
    receptionRequired: "Ресепшн обязателен",
    telegramPlaceholder: "https://t.me/username",
    whatsappPlaceholder: "https://wa.me/998901234567",
    wechatPlaceholder: "https://weixin.qq.com/r/username",
    instagramPlaceholder: "https://www.instagram.com/username",
    youtubePlaceholder: "https://www.youtube.com/@username",
    submitError: "Ошибка при сохранении контакта",
  },
  uz: {
    title: "Kontaktlar",
    addContact: "Kontakt Qo'shish",
    loading: "Yuklanmoqda...",
    error: "Xatolik yuz berdi!",
    noContacts: "Kontaktlar topilmadi",
    salesDepartment: "Sotuv Bo'limi Boshlig'i",
    exportDepartment: "Eksport Bo'limi",
    purchaseDepartment: "Sotuv Bo'limi Operatori",
    hrDepartment: "HR Bo'limi",
    infoDesk: "Servis Hizmat Bo'limi",
    reception: "Qabulxona",
    telegramLink: "Telegram Havolasi",
    whatsappLink: "WhatsApp Havolasi",
    wechatLink: "WeChat Havolasi",
    instagramLink1: "Instagram Havolasi 1",
    instagramLink2: "Instagram Havolasi 2",
    youtubeLink: "YouTube Havolasi",
    actions: "Amallar",
    edit: "Tahrirlash",
    delete: "O'chirish",
    editContact: "Kontaktni Tahrirlash",
    newContact: "Yangi Kontakt",
    cancel: "Bekor qilish",
    save: "Saqlash",
    update: "Yangilash",
    deleteConfirm: "Kontaktni o'chirishni xohlaysizmi?",
    salesDepartmentRequired: "Sotuv Bo'limi Boshlig'i majburiy", // Added for consistency
    exportDepartmentRequired: "Eksport Bo'limi majburiy",
    purchaseDepartmentRequired: "Sotuv Bo'limi Operatori majburiy", // Added for consistency
    hrDepartmentRequired: "HR Bo'limi majburiy",
    infoDeskRequired: "Servis Hizmat Bo'limi majburiy", // Added for consistency
    receptionRequired: "Qabulxona majburiy",
    telegramPlaceholder: "https://t.me/username",
    whatsappPlaceholder: "https://wa.me/998901234567",
    wechatPlaceholder: "https://weixin.qq.com/r/username",
    instagramPlaceholder: "https://www.instagram.com/username",
    youtubePlaceholder: "https://www.youtube.com/@username",
    submitError: "Kontaktni saqlashda xatolik yuz berdi",
  },
};

const ContactsTable = ({ lang = "uz", searchTerm = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    salesDepartment: "",
    exportDepartment: "",
    purchaseDepartment: "",
    hrDepartment: "",
    infoDesk: "",
    reception: "",
    telegramLink: "",
    telegramLink2: "",
    whatsappLink: "",
    wechatLink: "",
    instagramLink1: "",
    instagramLink2: "",
    youtubeLink: "",
  });
  const [errors, setErrors] = useState({});

  // RTK Query hooks
  const {
    data: contacts = [],
    isLoading,
    error,
    refetch,
  } = useGetContactsQuery();
  const [createContact, { isLoading: isCreating }] = useCreateContactMutation();
  const [updateContact, { isLoading: isUpdating }] = useUpdateContactMutation();
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

  // Get translations based on lang prop
  const t = translations[lang] || translations.uz;

  // Form validation for required fields
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      { key: "salesDepartment", message: t.salesDepartmentRequired },
      { key: "exportDepartment", message: t.exportDepartmentRequired },
      { key: "purchaseDepartment", message: t.purchaseDepartmentRequired },
      { key: "hrDepartment", message: t.hrDepartmentRequired },
      { key: "infoDesk", message: t.infoDeskRequired },
      { key: "reception", message: t.receptionRequired },
    ];

    requiredFields.forEach(({ key, message }) => {
      if (!formData[key].trim()) {
        newErrors[key] = message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open modal for adding or editing a contact
  const openModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData(contact);
    } else {
      setEditingContact(null);
      setFormData({
        salesDepartment: "",
        exportDepartment: "",
        purchaseDepartment: "",
        hrDepartment: "",
        infoDesk: "",
        reception: "",
        telegramLink: "",
        telegramLink2: "",
        whatsappLink: "",
        wechatLink: "",
        instagramLink1: "",
        instagramLink2: "",
        youtubeLink: "",
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
    setFormData({
      salesDepartment: "",
      exportDepartment: "",
      purchaseDepartment: "",
      hrDepartment: "",
      infoDesk: "",
      reception: "",
      telegramLink: "",
      telegramLink2: "",
      whatsappLink: "",
      wechatLink: "",
      instagramLink1: "",
      instagramLink2: "",
      youtubeLink: "",
    });
    setErrors({});
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingContact) {
        await updateContact({ id: editingContact._id, ...formData }).unwrap();
      } else {
        await createContact(formData).unwrap();
      }
      closeModal();
      refetch();
    } catch (error) {
      console.error("Error saving contact:", error);
      setErrors({ submit: t.submitError });
    }
  };

  // Handle contact deletion
  const handleDelete = async (contactId) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      await deleteContact(contactId).unwrap();
      refetch();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // Filter contacts based on searchTerm
  const filteredContacts =
    contacts?.innerData?.filter((contact) =>
      [
        "salesDepartment",
        "exportDepartment",
        "purchaseDepartment",
        "hrDepartment",
        "infoDesk",
        "reception",
        "telegramLink",
        "telegramLink2",
        "whatsappLink",
        "wechatLink",
        "instagramLink1",
        "instagramLink2",
        "youtubeLink",
      ].some((field) =>
        contact[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) || [];

  return (
    <div className="vfo-contacts-container">
      {/* Header */}
      <div className="vfo-header">
        <h2 className="vfo-title">{t.title}</h2>
        <button
          className="vfo-btn vfo-btn-primary"
          onClick={() => openModal()}
          disabled={isLoading}
        >
          <Plus size={16} />
          {t.addContact}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="vfo-loading">
          <Loader2 size={24} className="vfo-spinner" />
          <span>{t.loading}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="vfo-error">
          {t.error} {error?.data?.message || "Error loading contacts"}
          <button
            className="vfo-btn vfo-btn-primary vfo-btn-sm"
            onClick={refetch}
          >
            {t.retry || "Retry"}
          </button>
        </div>
      )}

      {/* Contacts Table */}
      {!isLoading && !error && (
        <div className="vfo-table-wrapper">
          <table className="vfo-table">
            <thead>
              <tr>
                <th>{t.salesDepartment}</th>
                <th>{t.exportDepartment}</th>
                <th>{t.purchaseDepartment}</th>
                <th>{t.hrDepartment}</th>
                <th>{t.infoDesk}</th>
                <th>{t.reception}</th>
                <th>{t.telegramLink}</th>
                <th>{t.telegramLink}</th>
                <th>{t.whatsappLink}</th>
                <th>{t.wechatLink}</th>
                <th>{t.instagramLink1}</th>
                <th>{t.instagramLink2}</th>
                <th>{t.youtubeLink}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="13" className="vfo-empty">
                    {t.noContacts}
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>{contact.salesDepartment}</td>
                    <td>{contact.exportDepartment}</td>
                    <td>{contact.purchaseDepartment}</td>
                    <td>{contact.hrDepartment}</td>
                    <td>{contact.infoDesk}</td>
                    <td>{contact.reception}</td>
                    <td>
                      {contact.telegramLink ? (
                        <a
                          href={contact.telegramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.telegramLink}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {contact.instagramLink2 ? (
                        <a
                          href={contact.instagramLink2}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.instagramLink2}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {contact.whatsappLink ? (
                        <a
                          href={contact.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.whatsappLink}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {contact.wechatLink ? (
                        <a
                          href={contact.wechatLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.wechatLink}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {contact.instagramLink1 ? (
                        <a
                          href={contact.instagramLink1}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.instagramLink1}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {contact.instagramLink2 ? (
                        <a
                          href={contact.instagramLink2}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.instagramLink2}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {contact.youtubeLink ? (
                        <a
                          href={contact.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.youtubeLink}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <div className="vfo-actions">
                        <button
                          className="vfo-btn vfo-btn-edit"
                          onClick={() => openModal(contact)}
                          title={t.edit}
                          disabled={isDeleting || isUpdating}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="vfo-btn vfo-btn-delete"
                          onClick={() => handleDelete(contact._id)}
                          title={t.delete}
                          disabled={isDeleting || isUpdating}
                        >
                          {isDeleting ? (
                            <Loader2 size={14} className="vfo-spinner" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Adding/Editing Contact */}
      {isModalOpen && (
        <div className="vfo-modal-overlay" onClick={closeModal}>
          <div className="vfo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vfo-modal-header">
              <h3>{editingContact ? t.editContact : t.newContact}</h3>
              <button
                className="vfo-btn vfo-btn-close"
                onClick={closeModal}
                disabled={isCreating || isUpdating}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="vfo-form">
              <div className="vfo-form-grid">
                {/* Required Fields */}
                {[
                  { name: "salesDepartment", label: t.salesDepartment },
                  { name: "exportDepartment", label: t.exportDepartment },
                  { name: "purchaseDepartment", label: t.purchaseDepartment },
                  { name: "hrDepartment", label: t.hrDepartment },
                  { name: "infoDesk", label: t.infoDesk },
                  { name: "reception", label: t.reception },
                ].map(({ name, label }) => (
                  <div className="vfo-form-group" key={name}>
                    <label>{label} *</label>
                    <input
                      type="text"
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      className={`vfo-input ${errors[name] ? "vfo-input-error" : ""}`}
                      placeholder={label}
                    />
                    {errors[name] && <span className="vfo-error">{errors[name]}</span>}
                  </div>
                ))}

                {/* Optional URL Fields */}
                {[
                  { name: "telegramLink2", label: t.telegramLink, placeholder: t.telegramPlaceholder },
                  { name: "telegramLink", label: t.telegramLink, placeholder: t.telegramPlaceholder },
                  { name: "whatsappLink", label: t.whatsappLink, placeholder: t.whatsappPlaceholder },
                  { name: "wechatLink", label: t.wechatLink, placeholder: t.wechatPlaceholder },
                  { name: "instagramLink1", label: t.instagramLink1, placeholder: t.instagramPlaceholder },
                  { name: "instagramLink2", label: t.instagramLink2, placeholder: t.instagramPlaceholder },
                  { name: "youtubeLink", label: t.youtubeLink, placeholder: t.youtubePlaceholder },
                ].map(({ name, label, placeholder }) => (
                  <div className="vfo-form-group" key={name}>
                    <label>{label}</label>
                    <input
                      type="url"
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      placeholder={placeholder}
                      className="vfo-input"
                    />
                  </div>
                ))}
              </div>

              {errors.submit && <div className="vfo-error-message">{errors.submit}</div>}

              <div className="vfo-modal-footer">
                <button
                  type="button"
                  className="vfo-btn vfo-btn-secondary"
                  onClick={closeModal}
                  disabled={isCreating || isUpdating}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="vfo-btn vfo-btn-primary"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <Loader2 size={16} className="vfo-spinner" />
                  ) : (
                    <Save size={16} />
                  )}
                  {editingContact ? t.update : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsTable;