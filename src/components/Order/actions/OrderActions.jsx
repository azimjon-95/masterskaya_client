import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import './style.css';

export default function OrderActions({ phoneNumber, status, onClose, fullName }) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState(''); // 'success', 'error', 'no-tg'

    if (!phoneNumber || (status !== "ready" && status !== "failed")) return null;

    const cleanPhone = phoneNumber?.replace(/\D/g, '');

    // Tayyor xabarlar
    const readyMessage = `Assalomu alaykum ${fullName}! 

Biz ustaxonadan chiqmoqdamiz. 📱 Telefoningiz muvaffaqiyatli tuzatildi! 

Kelib olib ketishingiz mumkin. 
Ish vaqtimiz: 09:00 dan 17:00 gacha. 

Rahmat va yaxshi kun tilaymiz! 😊`;

    const failedMessage = `Assalomu alaykum ${fullName}! 

Afsuski, telefoningizni tuzatib bo'lmadi. 😔 

Iltimos, kelib olib ketishingiz mumkin. 
Ish vaqtimiz: 09:00 dan 17:00 gacha. 

Rahmat!`;

    const defaultMessage = status === 'ready' ? readyMessage : failedMessage;

    // Modal ochilganda default message set qilamiz
    useEffect(() => {
        setMessage(defaultMessage);
    }, [defaultMessage]);

    const closeModal = () => {
        setIsSending(false);
        setSendStatus('');
        onClose?.();
    };

    const handleSend = () => {
        if (!message.trim()) {
            alert("Xabar bo'sh bo'lishi mumkin emas");
            return;
        }

        setIsSending(true);
        setSendStatus('');

        const encodedMessage = encodeURIComponent(message.trim());
        const tgLink = `https://t.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(tgLink, '_blank');

        setSendStatus('success');
        setTimeout(() => {
            closeModal();
        }, 1500);
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Telegram orqali xabar yuborish</h3>
                <p><strong>Telefon:</strong>{cleanPhone}</p>
                <p><strong>Holati:</strong> {status === 'ready' ? 'Tuzaldi ✅' : 'Tuzalmadi ❌'}</p>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={12}
                    placeholder="Xabar matnini tahrirlashingiz mumkin..."
                />

                <div className="modal-actions">
                    <button onClick={closeModal} disabled={isSending} className="cancel-btn">
                        Bekor qilish
                    </button>
                    <button onClick={handleSend} disabled={isSending} className="send-btn">
                        <Send size={18} />
                        {isSending ? 'Ochilmoqda...' : 'Telegramda yuborish'}
                    </button>
                </div>

                {sendStatus === 'success' && <p className="success">Telegram ochildi ✔</p>}
            </div>
        </div>
    );
}
