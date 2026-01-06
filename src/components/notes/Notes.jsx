import React, { useState, useEffect, useMemo } from 'react';
import {
    useCreateNoteMutation,
    useGetMyNotesQuery,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
    useDeleteAllNotesMutation,
    useTogglePinMutation,
} from '../../context/noteApi';
import { HiDotsVertical } from "react-icons/hi";
import { SlPin } from "react-icons/sl";
import './style.css';

const Eslatma = () => {
    // API dan ma'lumotlar
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const { data: serverNotes = [], isLoading, refetch } = useGetMyNotesQuery(user?.id);
    const [createNote] = useCreateNoteMutation();
    const [updateNote] = useUpdateNoteMutation();
    const [deleteNote] = useDeleteNoteMutation();
    const [deleteAllNotes] = useDeleteAllNotesMutation();
    const [togglePin] = useTogglePinMutation();

    // Local UI state
    const [headerPopoverOpen, setHeaderPopoverOpen] = useState(false);
    const [notePopovers, setNotePopovers] = useState({}); // { [noteId]: true/false }
    const [showModal, setShowModal] = useState(false);
    const [listInput, setListInput] = useState("");

    const [newNote, setNewNote] = useState({
        title: "",
        type: "text",
        content: "",
        amount: "",
        list: [],
        image: null,
        description: "",
        link: "",
        deadlineDate: "",
        deadlineTime: "",
        hasReminder: false,
        reminderDate: "",
        reminderTime: "",
    });
    const notes = serverNotes?.innerData ?? [];
    // Pinned eslatmalar yuqorida chiqishi uchun sort

    const sortedNotes = useMemo(() => {
        return [...notes].sort(
            (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
        );
    }, [notes]);
    // Notification ruxsati va reminder tekshiruvi
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const checkReminders = () => {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const currentTime = now.toTimeString().slice(0, 5);

            serverNotes?.innerData?.forEach(async (note) => {
                if (note?.reminder &&
                    note?.reminder.date === today &&
                    note?.reminder.time <= currentTime) {

                    if (Notification.permission === "granted") {
                        new Notification("🔔 " + note?.title, {
                            body: note?.description || "Eslatma vaqti keldi!"
                        });
                    }

                    // Reminder ni backenddan o'chirish
                    await updateNote({ id: note?.id, reminder: null });
                }
            });
        };

        const interval = setInterval(checkReminders, 60000); // har minut
        return () => clearInterval(interval);
    }, [serverNotes, updateNote]);

    // Click outside → popoverlarni yopish
    useEffect(() => {
        const handleClickOutside = () => {
            setHeaderPopoverOpen(false);
            setNotePopovers({});
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleNotePopover = (noteId) => {
        setNotePopovers(prev => ({
            ...prev,
            [noteId]: !prev[noteId]
        }));
    };

    const handleTogglePin = async (noteId) => {
        try {
            await togglePin({ id: noteId, master: user?.id });
            refetch();
            setNotePopovers(prev => ({ ...prev, [noteId]: false }));
        } catch (error) {
            console.error("Pinni almashtirishda xatolik:", error);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await deleteNote(noteId);
            refetch();
            setNotePopovers(prev => ({ ...prev, [noteId]: false }));
        } catch (error) {
            console.error("Eslatma o‘chirishda xatolik:", error);
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm("Barcha eslatmalarni o‘chirishni xohlaysizmi?")) {
            try {
                await deleteAllNotes();
                refetch();
                setHeaderPopoverOpen(false);
            } catch (error) {
                console.error("Barcha eslatmalarni o‘chirishda xatolik:", error);

            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewNote(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addToList = () => {
        if (listInput.trim()) {
            setNewNote(prev => ({
                ...prev,
                list: [...prev.list, listInput.trim()]
            }));
            setListInput("");
        }
    };

    const removeFromList = (index) => {
        setNewNote(prev => ({
            ...prev,
            list: prev.list.filter((_, i) => i !== index)
        }));
    };

    const resetNewNote = () => {
        setNewNote({
            title: "", type: "text", content: "", amount: "", list: [], image: null,
            description: "", link: "", deadlineDate: "", deadlineTime: "",
            hasReminder: false, reminderDate: "", reminderTime: ""
        });
        setListInput("");
    };

    const saveNote = async () => {
        if (!newNote?.title.trim()) return;

        const noteData = {
            title: newNote?.title.trim(),
            type: newNote?.type,
            description: newNote?.description.trim(),
            isPinned: false,
            master: user?.id
        };

        // Turga qarab maxsus maydonlar
        if (["text", "idea", "goal", "location", "deadline"].includes(newNote?.type)) {
            noteData.content = newNote?.content;
        }
        if (newNote?.type === "amount") {
            noteData.amount = newNote?.amount || "$0.00";
        }
        if (["list", "shopping"].includes(newNote?.type)) {
            noteData.list = newNote?.list;
        }
        if (newNote?.type === "image") {
            noteData.image = newNote?.image;
        }
        if (newNote?.type === "link") {
            noteData.link = newNote?.link;
        }
        if (newNote?.type === "deadline") {
            noteData.deadlineDate = newNote?.deadlineDate;
            noteData.deadlineTime = newNote?.deadlineTime;
        }

        // Reminder
        if (newNote?.hasReminder && newNote?.reminderDate && newNote?.reminderTime) {
            noteData.reminder = {
                date: newNote?.reminderDate,
                time: newNote?.reminderTime
            };
        }

        await createNote(noteData);
        refetch();
        setShowModal(false);
        resetNewNote();
    };

    // Tur bo'yicha rang
    const getTypeColor = (type) => {
        const colors = {
            text: "#fff9c4",
            list: "#e0f7fa",
            shopping: "#f1f8e9",
            amount: "#e8f5e8",
            image: "#fce4ec",
            deadline: "#ffebee",
            goal: "#e8eaf6",
            link: "#e3f2fd",
            idea: "#fff3e0",
            location: "#e8f5e9",
        };
        return colors[type] || "#ffffff";
    };

    // Eslatma ichidagi kontentni render qilish
    const renderNoteContent = (note) => {
        switch (note?.type) {
            case "amount":
                return (<div className="zam_amount">{note?.amount}</div>);

            case "list":
            case "shopping":
                return (
                    <ul className="zam_list">
                        {note?.list?.map((item, i) => (
                            <li key={i}>
                                {note?.type === "shopping" ? <span className="check">○</span> : `${i + 1}. `}
                                {item}
                            </li>
                        ))}
                    </ul>
                );

            case "image":
                return note?.image ? <img src={note?.image} alt={note?.title} className="zam_note_image" /> : null;

            case "link":
                return note?.link ? (
                    <a
                        href={note?.link.startsWith('http') ? note?.link : 'https://' + note?.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="zam_link"
                    >
                        🔗 {note?.link}
                    </a>
                ) : null;

            case "deadline":
                return (
                    <div className="zam_deadline">
                        <strong>⏰ Muddat:</strong> {note?.deadlineDate}
                        {note?.deadlineTime && ` | ${note?.deadlineTime}`}
                        {note?.content && <p className="zam_deadline_desc">{note?.content}</p>}
                    </div>
                );

            case "goal":
                return <div className="zam_goal">🎯 {note?.content || "Maqsad belgilandi"}</div>;

            case "idea":
                return <div className="zam_idea">💡 {note?.content}</div>;

            case "location":
                return <div className="zam_location">📍 {note?.content || "Joy eslatmasi"}</div>;

            default:
                return (
                    <div className="zam_content">
                        {(note?.content || "").split('\n').map((line, i) => (
                            <div key={i}>{line || <br />}</div>
                        ))}
                    </div>
                );
        }
    };
    const getSizeClass = (note) => {
        if (note?.type === "image") return "has-image";
        if (note?.type === "amount") return "tall";
        if (["list", "shopping"].includes(note?.type)) {
            const len = note?.list?.length || 0;
            if (len > 8) return "long";
            if (len > 4) return "medium";
            return "short";
        }
        if (note?.type === "deadline") return "medium";
        if (note?.content) {
            const lines = note?.content.split('\n').filter(l => l.trim()).length;
            if (lines > 8) return "long";
            if (lines > 4) return "medium";
        }
        return "medium";
    };

    if (isLoading) {
        return <div className="zam_loading">Yuklanmoqda...</div>;
    }

    return (
        <div className="zam_app">
            {/* Header */}
            <header className="zam_header">
                <h1 className="zam_logo">Eslatma</h1>
                <div className="zam_header_actions">
                    <button
                        className="zam_action_button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setHeaderPopoverOpen(prev => !prev);
                        }}
                    >
                        <HiDotsVertical />
                    </button>

                    {headerPopoverOpen && (
                        <div className="zam_popover zam_header_popover" onClick={e => e.stopPropagation()}>
                            <button
                                className="zam_popover_item"
                                onClick={() => {
                                    setShowModal(true);
                                    setHeaderPopoverOpen(false);
                                }}
                            >
                                ➕ Yangi eslatma
                            </button>
                            {serverNotes?.innerData?.length > 0 && (
                                <button className="zam_popover_item danger" onClick={handleDeleteAll}>
                                    🗑️ Barchasini o‘chirish
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Main content - Masonry grid */}
            <main className="zam_main">
                <div className="zam_notes_grid">
                    {sortedNotes.map((note, inx) => (
                        <div
                            key={inx}
                            className={`zam_note_card ${getSizeClass(note)}`}
                            style={{ backgroundColor: getTypeColor(note?.type) }}
                        >
                            <div className="zam_note_box">
                                <h3 className="zam_note_title">
                                    {note?.isPinned && <SlPin className="pinned_icon" title="Zakrepitlangan" />}
                                    {note?.type === "shopping" && "🛒 "}
                                    {note?.type === "deadline" && "⏰ "}
                                    {note?.type === "goal" && "🎯 "}
                                    {note?.type === "idea" && "💡 "}
                                    {note?.title}
                                </h3>

                                <div className="zam_note_actions">
                                    <button
                                        className="zam_action_button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleNotePopover(note?._id);
                                        }}
                                    >
                                        <HiDotsVertical />
                                    </button>

                                    {notePopovers[note?._id] && (
                                        <div className="zam_popover note_popover" onClick={e => e.stopPropagation()}>
                                            <button
                                                className="zam_popover_item"
                                                onClick={() => handleTogglePin(note?._id)}
                                            >
                                                {note?.isPinned ? "📌 Pinni olib tashlash" : "📌 Zakrepit qilish"}
                                            </button>
                                            <button
                                                className="zam_popover_item danger"
                                                onClick={() => handleDeleteNote(note?._id)}
                                            >
                                                🗑️ O‘chirish
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {note?.description && <p className="zam_note_description">{note?.description}</p>}
                            {renderNoteContent(note)}

                            <div className="zam_note_footer">
                                <div className="zam_note_date">
                                    {new Date(note?.createdAt || Date.now()).toLocaleDateString('en-GB', {
                                        day: '2-digit', month: '2-digit', year: '2-digit'
                                    })}, {new Date(note?.createdAt || Date.now()).toLocaleTimeString('en-GB', {
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </div>
                                {note?.reminder && (
                                    <div className="zam_reminder_bell">
                                        🔔 {note?.reminder.date} {note?.reminder.time}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* FAB */}
            <button className="zam_fab" onClick={() => setShowModal(true)}>
                +
            </button>

            {/* Modal - Yangi eslatma */}
            {showModal && (
                <div className="zam_modal_overlay" onClick={() => setShowModal(false)}>
                    <div className="zam_modal" onClick={e => e.stopPropagation()}>
                        <h2>Yangi eslatma</h2>

                        <input
                            type="text"
                            placeholder="Sarlavha*"
                            value={newNote?.title}
                            onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                            className="zam_input"
                            autoFocus
                        />

                        <textarea
                            placeholder="Izoh (tavsiya etiladi)"
                            value={newNote?.description}
                            onChange={e => setNewNote(prev => ({ ...prev, description: e.target.value }))}
                            className="zam_textarea"
                            rows="3"
                        />

                        {/* Tur tanlash */}
                        <div className="zam_type_selector">
                            {[
                                { type: "text", icon: "📝", label: "Oddiy matn" },
                                { type: "list", icon: "✓", label: "Ro'yxat" },
                                { type: "amount", icon: "💰", label: "Pul miqdori" },
                                { type: "image", icon: "🖼", label: "Rasm" },
                                { type: "deadline", icon: "⏰", label: "Muddatli vazifa" },
                                { type: "goal", icon: "🎯", label: "Maqsad" },
                                { type: "shopping", icon: "🛒", label: "Xarid ro'yxati" },
                                { type: "link", icon: "🔗", label: "Havola" },
                                { type: "idea", icon: "💡", label: "Fikr / G'oya" },
                                { type: "location", icon: "📍", label: "Joy eslatmasi" },
                            ].map(item => (
                                <button
                                    key={item.type}
                                    className={`zam_type_btn ${newNote?.type === item.type ? 'active' : ''}`}
                                    onClick={() => setNewNote(prev => ({
                                        ...prev,
                                        type: item.type,
                                        content: ["text", "idea", "goal", "location", "deadline"].includes(item.type) ? prev.content : "",
                                        amount: item.type === "amount" ? prev.amount : "",
                                        list: ["list", "shopping"].includes(item.type) ? prev.list : [],
                                        image: item.type === "image" ? prev.image : null,
                                        link: item.type === "link" ? prev.link : "",
                                    }))}
                                >
                                    <span className="zam_type_icon">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Turga mos inputlar */}
                        {["text", "idea", "goal", "location", "deadline"].includes(newNote?.type) && (
                            <textarea
                                placeholder={newNote?.type === "idea" ? "Yangi g'oyangizni yozing..." : "Matn kiriting..."}
                                value={newNote?.content}
                                onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                                className="zam_textarea"
                                rows="6"
                            />
                        )}

                        {newNote?.type === "amount" && (
                            <input
                                type="text"
                                placeholder="Masalan: $1,250.00"
                                value={newNote?.amount}
                                onChange={e => setNewNote(prev => ({ ...prev, amount: e.target.value }))}
                                className="zam_input"
                            />
                        )}

                        {["list", "shopping"].includes(newNote?.type) && (
                            <div className="zam_list_input">
                                <div className="zam_list_add">
                                    <input
                                        type="text"
                                        placeholder="Yangi band qo'shish..."
                                        value={listInput}
                                        onChange={e => setListInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && addToList()}
                                    />
                                    <button type="button" onClick={addToList}>+</button>
                                </div>
                                <ul className="zam_preview_list">
                                    {newNote?.list.map((item, i) => (
                                        <li key={i}>
                                            {newNote?.type === "shopping" ? "○" : `${i + 1}.`} {item}
                                            <span onClick={() => removeFromList(i)}>✕</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {newNote?.type === "image" && (
                            <div className="zam_image_upload">
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                                {newNote?.image && <img src={newNote?.image} alt="Preview" className="zam_image_preview" />}
                            </div>
                        )}

                        {newNote?.type === "link" && (
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={newNote?.link}
                                onChange={e => setNewNote(prev => ({ ...prev, link: e.target.value }))}
                                className="zam_input"
                            />
                        )}

                        {newNote?.type === "deadline" && (
                            <div className="zam_deadline_inputs">
                                <input
                                    type="date"
                                    value={newNote?.deadlineDate}
                                    onChange={e => setNewNote(prev => ({ ...prev, deadlineDate: e.target.value }))}
                                />
                                <input
                                    type="time"
                                    value={newNote?.deadlineTime}
                                    onChange={e => setNewNote(prev => ({ ...prev, deadlineTime: e.target.value }))}
                                />
                            </div>
                        )}

                        {/* Reminder */}
                        <div className="zam_reminder_section">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={newNote?.hasReminder}
                                    onChange={e => setNewNote(prev => ({ ...prev, hasReminder: e.target.checked }))}
                                />
                                Eslatma qo'yish
                            </label>
                            {newNote?.hasReminder && (
                                <div className="zam_reminder_inputs">
                                    <input
                                        type="date"
                                        value={newNote?.reminderDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setNewNote(prev => ({ ...prev, reminderDate: e.target.value }))}
                                    />
                                    <input
                                        type="time"
                                        value={newNote?.reminderTime}
                                        onChange={e => setNewNote(prev => ({ ...prev, reminderTime: e.target.value }))}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal tugmalari */}
                        <div className="zam_modal_buttons">
                            <button onClick={() => setShowModal(false)}>Bekor qilish</button>
                            <button onClick={saveNote} className="zam_save_btn">
                                Saqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Eslatma;













// import React, { useState, useEffect } from 'react';
// import {
//     useCreateNoteMutation,
//     useGetMyNotesQuery,
//     useGetNoteByIdQuery,
//     useUpdateNoteMutation,
//     useDeleteNoteMutation,
//     useDeleteAllNotesMutation,
//     useTogglePinMutation,
//     useReorderNotesMutation,
// } from '../../context/noteApi';
// import { HiDotsVertical } from "react-icons/hi";
// import { SlPin } from "react-icons/sl";
// import './style.css';

// const Eslatma = () => {
//     // const [notes, setNotes] = useState([]);
//     const [headerPopoverOpen, setHeaderPopoverOpen] = useState(false);
//     const [notePopovers, setNotePopovers] = useState({}); // { [noteId]: true/false }
//     const [showModal, setShowModal] = useState(false);
//     const [newNote, setNewNote] = useState({
//         title: "",
//         type: "text",
//         content: "",
//         amount: "",
//         list: [],
//         image: null,
//         description: "",
//         link: "",
//         deadlineDate: "",
//         deadlineTime: "",
//         hasReminder: false,
//         reminderDate: "",
//         reminderTime: "",
//     });

//     // const toggleHeaderPopover = () => {
//     //     setHeaderPopoverOpen(prev => !prev);
//     // };
//     // console.log(headerPopoverOpen);


//     const toggleNotePopover = (noteId) => {
//         setNotePopovers(prev => ({
//             ...prev,
//             [noteId]: !prev[noteId]
//         }));
//     };

//     const deleteNote = (noteId) => {
//         setNotes(prev => prev.filter(note => note?.id !== noteId));
//         setNotePopovers(prev => ({ ...prev, [noteId]: false }));
//     };

//     const deleteAllNotes = () => {
//         if (window.confirm("Barcha eslatmalarni o‘chirishni xohlaysizmi?")) {
//             setNotes([]);
//         }
//         setHeaderPopoverOpen(false);
//     };

//     const togglePin = (noteId) => {
//         setNotes(prev => prev.map(note =>
//             note?.id === noteId ? { ...note, isPinned: !note?.isPinned } : note
//         ));
//         setNotePopovers(prev => ({ ...prev, [noteId]: false }));
//     };
//     const [notes, setNotes] = useState([
//         {
//             id: 1,
//             title: "Kunlik motivatsiya",
//             type: "text",
//             content: "Bugun yangi imkoniyatlar kuni.\nHar bir qadam muhim.\nO‘zingga ishon va harakat qil!",
//             description: "Har kuni ertalab o‘qib turish uchun",
//             date: "06/01/26, 07:00",
//             reminder: { date: "2026-01-07", time: "07:00" }
//         },
//         {
//             id: 2,
//             title: "Haftalik vazifalar",
//             type: "list",
//             list: ["Dushanba: Sport zal", "Seshanba: Ingliz tili", "Chorshanba: Loyiha tugallash", "Payshanba: Oilaviy uchrashuv", "Juma: Dam olish"],
//             description: "Hafta rejalari",
//             date: "06/01/26, 09:15",
//             reminder: null
//         },
//         {
//             id: 3,
//             title: "Oylik byudjet",
//             type: "amount",
//             amount: "$2,450.00",
//             description: "Yanvar oyi uchun ajratilgan byudjet",
//             date: "06/01/26, 10:30",
//             reminder: { date: "2026-01-31", time: "18:00" }
//         },
//         {
//             id: 4,
//             title: "Oilaviy sayohat suratlari",
//             type: "image",
//             image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
//             description: "O‘tgan yozda Alpomish daryosida",
//             date: "05/01/26, 20:45",
//             reminder: null
//         },
//         {
//             id: 5,
//             title: "Loyiha topshirig‘i",
//             type: "deadline",
//             content: "Mijozga yangi veb-sayt dizaynini taqdim etish va tasdiqlash",
//             deadlineDate: "2026-01-20",
//             deadlineTime: "15:00",
//             description: "Muhim mijoz loyihasi – kechiktirib bo‘lmaydi!",
//             date: "06/01/26, 11:20",
//             reminder: { date: "2026-01-19", time: "10:00" }
//         },
//         {
//             id: 6,
//             title: "Yillik maqsadlar",
//             type: "goal",
//             content: "2026 yilda:\n• 30 ta kitob o‘qish\n• 10 kg vazn tashlash\n• Yangi til o‘rganish (ispancha)\n• $5000 jamg‘arma yig‘ish",
//             description: "Yillik shaxsiy rivojlanish maqsadlari",
//             date: "01/01/26, 00:01",
//             reminder: { date: "2026-07-01", time: "09:00" }
//         },
//         {
//             id: 7,
//             title: "Bugungi xarid ro‘yxati",
//             type: "shopping",
//             list: ["Sut (2 litr)", "Non (qora va oq)", "Tuxum (10 dona)", "Go‘sht (1 kg)", "Sabzi", "Kartoshka", "Piyoz", "Olma", "Yog‘ (1 litr)"],
//             description: "Kechki ovqat uchun kerakli mahsulotlar",
//             date: "06/01/26, 16:40",
//             reminder: { date: "2026-01-06", time: "18:00" }
//         },
//         {
//             id: 8,
//             title: "Foydali React kursi",
//             type: "link",
//             link: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
//             description: "React + Redux – Maximilian Schwarzmüller (Yuqori baholangan kurs)",
//             date: "05/01/26, 22:10",
//             reminder: null
//         },
//         {
//             id: 9,
//             title: "Yangi ilova g‘oyasi",
//             type: "idea",
//             content: "Mahalliy hunarmandlar va mijozlarni bog‘lovchi mobil platforma:\n• Ustalar o‘z xizmatlarini joylashtiradi\n• Mijozlar yaqin atrofdagi ustalarni topadi\n• Reyting va sharhlar tizimi\n• To‘lov integratsiyasi",
//             description: "Potentsial startup loyihasi",
//             date: "06/01/26, 01:30",
//             reminder: { date: "2026-01-10", time: "11:00" }
//         },
//         {
//             id: 10,
//             title: "Do‘stlar uchrashuvi",
//             type: "location",
//             content: "Toshkent shahri, Chilanzar tumani, 'Friends Cafe' da eski sinfdoshlar bilan uchrashuv",
//             description: "5 yildan keyin ilk uchrashuv – kech qolmaslik kerak!",
//             date: "04/01/26, 19:55",
//             reminder: { date: "2026-01-11", time: "17:00" }
//         }
//     ]);
//     const [listInput, setListInput] = useState("");

//     // Notification va reminder tekshiruvi
//     useEffect(() => {
//         if ("Notification" in window && Notification.permission === "default") {
//             Notification.requestPermission();
//         }

//         const interval = setInterval(checkReminders, 60000); // har minutda
//         return () => clearInterval(interval);
//     }, [notes]);

//     useEffect(() => {
//         const handleClickOutside = () => {
//             setHeaderPopoverOpen(false);
//             setNotePopovers({});
//         };

//         document.addEventListener('click', handleClickOutside);
//         return () => document.removeEventListener('click', handleClickOutside);
//     }, []);

//     const checkReminders = () => {
//         const now = new Date();
//         const today = now.toISOString().split('T')[0];
//         const currentTime = now.toTimeString().slice(0, 5);

//         notes.forEach(note => {
//             if (note?.reminder && note?.reminder.date === today && note?.reminder.time <= currentTime) {
//                 showNotification(note?.title, note?.description || "Eslatma vaqti keldi!");
//                 setNotes(prev => prev.map(n => n.id === note?.id ? { ...n, reminder: null } : n));
//             }
//         });
//     };

//     const showNotification = (title, body) => {
//         if (Notification.permission === "granted") {
//             new Notification("🔔 " + title, { body });
//         }
//     };

//     const handleImageUpload = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => setNewNote({ ...newNote, image: reader.result });
//             reader.readAsDataURL(file);
//         }
//     };

//     const addToList = () => {
//         if (listInput.trim()) {
//             setNewNote({ ...newNote, list: [...newNote?.list, listInput.trim()] });
//             setListInput("");
//         }
//     };

//     const removeFromList = (index) => {
//         setNewNote({ ...newNote, list: newNote?.list.filter((_, i) => i !== index) });
//     };

//     const saveNote = () => {
//         if (!newNote?.title.trim()) return;

//         const noteToAdd = {
//             id: Date.now(),
//             title: newNote?.title,
//             type: newNote?.type,
//             description: newNote?.description,
//             date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
//                 ", " + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
//         };

//         // Turga qarab ma'lumot qo'shish
//         switch (newNote?.type) {
//             case "text":
//             case "idea":
//             case "goal":
//             case "location":
//                 noteToAdd.content = newNote?.content;
//                 break;
//             case "amount":
//                 noteToAdd.amount = newNote?.amount || "$0.00";
//                 break;
//             case "list":
//             case "shopping":
//                 noteToAdd.list = newNote?.list;
//                 break;
//             case "image":
//                 noteToAdd.image = newNote?.image;
//                 break;
//             case "link":
//                 noteToAdd.link = newNote?.link;
//                 break;
//             case "deadline":
//                 noteToAdd.deadlineDate = newNote?.deadlineDate;
//                 noteToAdd.deadlineTime = newNote?.deadlineTime;
//                 noteToAdd.content = newNote?.content;
//                 break;
//         }

//         if (newNote?.hasReminder && newNote?.reminderDate && newNote?.reminderTime) {
//             noteToAdd.reminder = { date: newNote?.reminderDate, time: newNote?.reminderTime };
//         }

//         setNotes([noteToAdd, ...notes]);
//         setShowModal(false);
//         resetNewNote();
//     };

//     const resetNewNote = () => {
//         setNewNote({
//             title: "", type: "text", content: "", amount: "", list: [], image: null,
//             description: "", link: "", deadlineDate: "", deadlineTime: "",
//             hasReminder: false, reminderDate: "", reminderTime: ""
//         });
//         setListInput("");
//     };

//     const renderNoteContent = (note) => {
//         switch (note?.type) {
//             case "amount":
//                 return <div className="zam_amount">{note?.amount}</div>;

//             case "list":
//             case "shopping":
//                 return (
//                     <ul className="zam_list">
//                         {note?.list?.map((item, i) => (
//                             <li key={i}>
//                                 {note?.type === "shopping" ? <span className="check">○</span> : `${i + 1}. `}
//                                 {item}
//                             </li>
//                         ))}
//                     </ul>
//                 );

//             case "image":
//                 return note?.image ? <img src={note?.image} alt={note?.title} className="zam_note_image" /> : null;

//             case "link":
//                 return note?.link ? (
//                     <a href={note?.link.startsWith('http') ? note?.link : 'https://' + note?.link}
//                         target="_blank" rel="noopener noreferrer" className="zam_link">
//                         🔗 {note?.link}
//                     </a>
//                 ) : null;

//             case "deadline":
//                 return (
//                     <div className="zam_deadline">
//                         <strong>⏰ Muddat:</strong> {note?.deadlineDate}
//                         {note?.deadlineTime && ` | ${note?.deadlineTime}`}
//                         {note?.content && <p className="zam_deadline_desc">{note?.content}</p>}
//                     </div>
//                 );

//             case "goal":
//                 return <div className="zam_goal">🎯 {note?.content || "Maqsad belgilandi"}</div>;

//             case "idea":
//                 return <div className="zam_idea">💡 {note?.content}</div>;

//             case "location":
//                 return <div className="zam_location">📍 {note?.content || "Joy eslatmasi"}</div>;

//             default:
//                 return (
//                     <div className="zam_content">
//                         {(note?.content || "").split('\n').map((line, i) => (
//                             <div key={i}>{line || <br />}</div>
//                         ))}
//                     </div>
//                 );
//         }
//     };

//     const getSizeClass = (note) => {
//         if (note?.type === "image") return "has-image";
//         if (note?.type === "amount") return "tall";
//         if (["list", "shopping"].includes(note?.type)) {
//             const len = note?.list?.length || 0;
//             if (len > 8) return "long";
//             if (len > 4) return "medium";
//             return "short";
//         }
//         if (note?.type === "deadline") return "medium";
//         if (note?.content) {
//             const lines = note?.content.split('\n').filter(l => l.trim()).length;
//             if (lines > 8) return "long";
//             if (lines > 4) return "medium";
//         }
//         return "medium";
//     };

//     return (
//         <div className="zam_app">
//             <header className="zam_header">
//                 <h1 className="zam_logo">Eslatma</h1>
//                 <div className="zam_header_actions">
//                     <button
//                         className="zam_action_button"
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             setHeaderPopoverOpen(!headerPopoverOpen);
//                         }}
//                     >
//                         <HiDotsVertical />
//                     </button>

//                     {headerPopoverOpen && (
//                         <div className="zam_popover zam_header_popover" onClick={(e) => e.stopPropagation()}>
//                             <button
//                                 className="zam_popover_item"
//                                 onClick={() => {
//                                     setShowModal(true);
//                                     setHeaderPopoverOpen(false);
//                                 }}
//                             >
//                                 ➕ Yangi eslatma
//                             </button>
//                             {notes.length > 0 && (
//                                 <button
//                                     className="zam_popover_item danger"
//                                     onClick={deleteAllNotes}
//                                 >
//                                     🗑️ Barchasini o‘chirish
//                                 </button>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </header>

//             <main className="zam_main">
//                 <div className="zam_notes_grid">
//                     {notes.map((note) => (
//                         <div key={note?.id} className={`zam_note_card ${getSizeClass(note)}`}>
//                             <div className="zam_note_box">
//                                 <h3 className="zam_note_title">
//                                     {note?.type === "shopping" && "🛒 "}
//                                     {note?.type === "deadline" && "⏰ "}
//                                     {note?.type === "goal" && "🎯 "}
//                                     {note?.type === "idea" && "💡 "}
//                                     {note?.title}
//                                 </h3>
//                                 <div className="actions_nots_menu">
//                                     {!note?.isPinned && <SlPin className="pinned_icon" title="Zakrepitlangan eslatma" />}
//                                     <div className="zam_note_actions">
//                                         <button
//                                             className="zam_action_button"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 toggleNotePopover(note?.id);
//                                             }}
//                                         >
//                                             <HiDotsVertical />
//                                         </button>

//                                         {notePopovers[note?.id] && (
//                                             <div className="zam_popover note_popover" onClick={(e) => e.stopPropagation()}>
//                                                 <button
//                                                     className="zam_popover_item"
//                                                     onClick={() => togglePin(note?.id)}
//                                                 >
//                                                     {note?.isPinned ? "📌 Pinni olib tashlash" : "📌 Zakrepit qilish"}
//                                                 </button>
//                                                 <button
//                                                     className="zam_popover_item danger"
//                                                     onClick={() => deleteNote(note?.id)}
//                                                 >
//                                                     🗑️ O‘chirish
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                             {note?.description && <p className="zam_note_description">{note?.description}</p>}
//                             {renderNoteContent(note)}

//                             <div className="zam_note_footer">
//                                 <div className="zam_note_date">{note?.date}</div>
//                                 {note?.reminder && (
//                                     <div className="zam_reminder_bell">{note?.reminder.date} {note?.reminder.time} 🔔</div>
//                                 )}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </main>

//             <button className="zam_fab" onClick={() => setShowModal(true)}>+</button>

//             {/* Modal */}
//             {showModal && (
//                 <div className="zam_modal_overlay" onClick={() => setShowModal(false)}>
//                     <div className="zam_modal" onClick={e => e.stopPropagation()}>
//                         <h2>Yangi eslatma</h2>

//                         <input
//                             type="text"
//                             placeholder="Sarlavha"
//                             value={newNote?.title}
//                             onChange={e => setNewNote({ ...newNote, title: e.target.value })}
//                             className="zam_input"
//                         />

//                         <textarea
//                             placeholder="Izoh (tavsiya etiladi)"
//                             value={newNote?.description}
//                             onChange={e => setNewNote({ ...newNote, description: e.target.value })}
//                             className="zam_textarea"
//                             rows="3"
//                         />

//                         {/* 10 ta tur buttonlari */}
//                         <div className="zam_type_selector">
//                             {[
//                                 { type: "text", icon: "📝", label: "Oddiy matn" },
//                                 { type: "list", icon: "✓", label: "Ro'yxat" },
//                                 { type: "amount", icon: "💰", label: "Pul miqdori" },
//                                 { type: "image", icon: "🖼", label: "Rasm" },
//                                 { type: "deadline", icon: "⏰", label: "Muddatli vazifa" },
//                                 { type: "goal", icon: "🎯", label: "Maqsad" },
//                                 { type: "shopping", icon: "🛒", label: "Xarid ro'yxati" },
//                                 { type: "link", icon: "🔗", label: "Havola" },
//                                 { type: "idea", icon: "💡", label: "Fikr / G'oya" },
//                                 { type: "location", icon: "📍", label: "Joy eslatmasi" },
//                             ].map(item => (
//                                 <button
//                                     key={item.type}
//                                     type="button"
//                                     className={`zam_type_btn ${newNote?.type === item.type ? 'active' : ''}`}
//                                     onClick={() => setNewNote({
//                                         ...newNote,
//                                         type: item.type,
//                                         content: ["text", "idea", "goal", "location", "deadline"].includes(item.type) ? newNote?.content : "",
//                                         amount: item.type === "amount" ? newNote?.amount : "",
//                                         list: ["list", "shopping"].includes(item.type) ? newNote?.list : [],
//                                         image: item.type === "image" ? newNote?.image : null,
//                                         link: item.type === "link" ? newNote?.link : "",
//                                     })}
//                                 >
//                                     <span className="zam_type_icon">{item.icon}</span>
//                                     {item.label}
//                                 </button>
//                             ))}
//                         </div>

//                         {/* Turga mos inputlar */}
//                         {["text", "idea", "goal", "location", "deadline"].includes(newNote?.type) && (
//                             <textarea
//                                 placeholder={newNote?.type === "idea" ? "Yangi g'oyangizni yozing..." : "Matn kiriting..."}
//                                 value={newNote?.content}
//                                 onChange={e => setNewNote({ ...newNote, content: e.target.value })}
//                                 className="zam_textarea"
//                                 rows="6"
//                             />
//                         )}

//                         {newNote?.type === "amount" && (
//                             <input
//                                 type="text"
//                                 placeholder="Masalan: $1,250.00"
//                                 value={newNote?.amount}
//                                 onChange={e => setNewNote({ ...newNote, amount: e.target.value })}
//                                 className="zam_input"
//                             />
//                         )}

//                         {["list", "shopping"].includes(newNote?.type) && (
//                             <div className="zam_list_input">
//                                 <div className="zam_list_add">
//                                     <input
//                                         type="text"
//                                         placeholder="Yangi band qo'shish..."
//                                         value={listInput}
//                                         onChange={e => setListInput(e.target.value)}
//                                         onKeyPress={e => e.key === 'Enter' && addToList()}
//                                     />
//                                     <button onClick={addToList}>+</button>
//                                 </div>
//                                 <ul className="zam_preview_list">
//                                     {newNote?.list.map((item, i) => (
//                                         <li key={i}>
//                                             {newNote?.type === "shopping" ? "○" : `${i + 1}.`} {item}
//                                             <span onClick={() => removeFromList(i)}>✕</span>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         )}

//                         {newNote?.type === "image" && (
//                             <div className="zam_image_upload">
//                                 <input type="file" accept="image/*" onChange={handleImageUpload} />
//                                 {newNote?.image && <img src={newNote?.image} alt="Preview" className="zam_image_preview" />}
//                             </div>
//                         )}

//                         {newNote?.type === "link" && (
//                             <input
//                                 type="url"
//                                 placeholder="https://example.com"
//                                 value={newNote.link}
//                                 onChange={e => setNewNote({ ...newNote, link: e.target.value })}
//                                 className="zam_input"
//                             />
//                         )}

//                         {newNote.type === "deadline" && (
//                             <div className="zam_deadline_inputs">
//                                 <input
//                                     type="date"
//                                     value={newNote.deadlineDate}
//                                     onChange={e => setNewNote({ ...newNote, deadlineDate: e.target.value })}
//                                 />
//                                 <input
//                                     type="time"
//                                     value={newNote.deadlineTime}
//                                     onChange={e => setNewNote({ ...newNote, deadlineTime: e.target.value })}
//                                 />
//                             </div>
//                         )}

//                         {/* Reminder */}
//                         <div className="zam_reminder_section">
//                             <label>
//                                 <input
//                                     type="checkbox"
//                                     checked={newNote.hasReminder}
//                                     onChange={e => setNewNote({ ...newNote, hasReminder: e.target.checked })}
//                                 />
//                                 Eslatma qo'yish
//                             </label>
//                             {newNote.hasReminder && (
//                                 <div className="zam_reminder_inputs">
//                                     <input type="date" value={newNote.reminderDate} min={new Date().toISOString().split('T')[0]}
//                                         onChange={e => setNewNote({ ...newNote, reminderDate: e.target.value })} />
//                                     <input type="time" value={newNote.reminderTime}
//                                         onChange={e => setNewNote({ ...newNote, reminderTime: e.target.value })} />
//                                 </div>
//                             )}
//                         </div>

//                         <div className="zam_modal_buttons">
//                             <button onClick={() => setShowModal(false)}>Bekor qilish</button>
//                             <button onClick={saveNote} className="zam_save_btn">Saqlash</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Eslatma;