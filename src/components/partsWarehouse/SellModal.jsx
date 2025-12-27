import React from 'react';
import { useNotification } from '../Notification/NotificationToast';
import { useSellPartMutation } from '../../context/materialsApi';
import './sell.css';

const SotishModal = ({ selectedPart, onClose, formatPrice, calculateProfit, dollarRate }) => {
    const { showNotification } = useNotification();
    const [sellPart, { isLoading }] = useSellPartMutation();
    const handleSell = async () => {
        if (!selectedPart) return;
        const qty = parseInt(document.getElementById('sell-quantity').value);

        if (!qty || qty < 1 || qty > selectedPart.quantity) {
            return showNotification("Noto'g'ri miqdor!", "error");
        }

        let price;
        if (selectedPart.currency === "USD") {
            price = Math.floor(dollarRate * (qty * selectedPart.sellPrice));
        } else {
            price = (qty * selectedPart.sellPrice);
        }

        try {
            const res = await sellPart({ id: selectedPart._id, quantity: qty, salePrice: price }).unwrap();
            showNotification(
                `✔ ${qty} dona sotildi • Foyda: +${res?.message?.sale.profit.toLocaleString()} so'm`,
                "success"
            );

            onClose();

        } catch (err) {
            showNotification("Xatolik yuz berdi!", "error");
        }
    };
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="sell-modal-overlay" onClick={handleOverlayClick}>
            <div className="sell-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="sell-modal__title">Ehtiyot qismni sotish</h2>

                <div className="sell-modal__content">
                    {/* Mahsulot ma'lumotlari */}
                    <div className="sell-modal__info">
                        <p><strong>Nomi:</strong> {selectedPart.name}</p>
                        <p><strong>Brend • Model:</strong> {selectedPart.brand} • {selectedPart.model}</p>
                        <p><strong>Rang:</strong> {selectedPart.color || '—'}</p>
                        <p><strong>Razmer:</strong> {selectedPart.size || '—'}</p>
                        <p><strong>Hozirgi miqdor:</strong>
                            <span className="sell-modal__badge">{selectedPart.quantity} dona</span>
                        </p>
                        <p><strong>Sotish narxi:</strong> {formatPrice(selectedPart.sellPrice, selectedPart.currency)}</p>
                        <p><strong>Foyda (1 dona uchun):</strong>
                            <span className="sell-modal__profit">
                                +{calculateProfit(selectedPart).toLocaleString()} so'm
                            </span>
                        </p>
                    </div>

                    {/* Miqdor kiritish */}
                    <div className="sell-modal__field">
                        <label className="sell-modal__label">Sotilayotgan miqdor</label>
                        <input
                            type="number"
                            min="1"
                            max={selectedPart.quantity}
                            defaultValue="1"
                            className="sell-modal__input"
                            id="sell-quantity"
                            autoFocus
                        />
                    </div>

                    {/* Tugmalar */}
                    <div className="sell-modal__actions">
                        <button onClick={onClose} className="sell-modal__button sell-modal__button--cancel">
                            Bekor qilish
                        </button>
                        <button disabled={isLoading} onClick={handleSell} className="sell-modal__button sell-modal__button--primary">
                            Sotish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SotishModal;