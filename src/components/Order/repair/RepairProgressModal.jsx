import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MdDownloadDone } from "react-icons/md";
import { useNotification } from '../../Notification/NotificationToast';
import { useGetExtiyotPartsQuery } from '../../../context/materialsApi';
import { useAddUsedPartMutation } from '../../../context/orderApi';
import './style.css';

export default function RepairProgressModal({
    order,
    onClose,
    onSave,
    isSaving = false,
}) {
    const { data: extiyotParts, isLoading: loadingExtiyotParts } = useGetExtiyotPartsQuery();
    const [addUsedPart] = useAddUsedPartMutation();
    const [quantities, setQuantities] = useState({});
    const [loadingParts, setLoadingParts] = useState({}); // part._id bo'yicha loading
    const { showNotification } = useNotification();

    if (loadingExtiyotParts) {
        return <div>Loading...</div>;
    }

    const handleInputChange = (partId, value) => {
        setQuantities((prev) => ({ ...prev, [partId]: value }));
    };

    const handleAddClick = async (part) => {
        const qty = quantities[part._id] || 0;
        if (qty <= 0) {
            showNotification("Miqdor 0 dan katta bo'lishi kerak", "error");
            return;
        }

        // loading holatini part._id bo'yicha true qilamiz
        setLoadingParts((prev) => ({ ...prev, [part._id]: true }));

        try {
            await addUsedPart({
                orderId: order._id,
                partId: part._id,
                quantity: Number(qty),
            }).unwrap();

            setQuantities((prev) => ({ ...prev, [part._id]: '' }));
            showNotification(`${part.name} qo'shildi`, 'success');
        } catch (err) {
            showNotification("Xatolik yuz berdi", 'error');
        } finally {
            setLoadingParts((prev) => ({ ...prev, [part._id]: false }));
        }
    };

    return (
        <div className="modal-overlay_lib" onClick={onClose}>
            <div
                className="modal-box_lib repair-progress-modal_lib animated-modal_lib"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-top_lib">
                    <h2>Ta'mir jarayoni</h2>
                    <button className="close-btn-modal_lib" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body-content_lib">
                    <p className="modal-subtitle_lib">
                        <strong>{order?.customerName}</strong> — {order?.brand} {order?.phoneModel}
                    </p>

                    <div className="form-group_modal_lib">
                        {extiyotParts?.innerData?.map((part, inx) => (
                            <div key={inx} className="part-item_lib">
                                <span>{part.name} ({part.brand} - {part.model}) | {part.sellPrice} {part.currency === "UZS" ? "so'm" : "$"}</span>
                                <div className="form-group_main_lib">
                                    <p>Miqdori: {part.quantity}</p>
                                    <input
                                        type="number"
                                        min={0}
                                        value={quantities[part._id] || ''}
                                        onChange={(e) => handleInputChange(part._id, e.target.value)}
                                        placeholder="Miqdor"
                                        className="part-input_lib"
                                    />
                                    <button
                                        className="add-btn_lib"
                                        onClick={() => handleAddClick(part)}
                                        disabled={loadingParts[part._id]} // loading bo'lsa disable
                                    >
                                        {loadingParts[part._id] ? (
                                            <Loader2 size={19} className="spinner-icon_lib" />
                                        ) : (
                                            <MdDownloadDone size={19} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="form-group_modal_lib">
                        {order?.usedParts?.map((part, inx) => (
                            <div key={inx} className="part-item_lib">
                                <span>{part?.part?.name} ({part?.part?.brand} - {part.quantity}) | {part.priceAtThatTime}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-actions_lib">
                    <button className="cancel-btn_lib" onClick={onClose}>
                        Yopish
                    </button>
                    <button
                        className="confirm-btn_lib"
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="spinner-icon_lib" size={19} />
                        ) : (
                            'Saqlash'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
