import { useState } from 'react';
import {
    MessageCircleMore,
    Trash2,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { HiMiniWrenchScrewdriver } from 'react-icons/hi2';

import {
    useDeleteOrderMutation,
    useUpdateStatusMutation,
    useUpdateWaitingMutation,
} from '../../context/orderApi';
import { useNotification } from '../Notification/NotificationToast';
import { NumberFormat } from '../../hook/NumberFormat';

import OrderActions from './actions/OrderActions';
import OrderDetailsModal from './OrderDetailsModal';
import './OrderTable.css';

export default function OrderTable({ orders = [], t, refreshOrders }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deleteConfirmOrder, setDeleteConfirmOrder] = useState(null);

    // Modal state'lari
    const [readyModalOrder, setReadyModalOrder] = useState(null);
    const [failedModalOrder, setFailedModalOrder] = useState(null);
    const [waitingModalOrder, setWaitingModalOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(null);

    // Form maydonlari
    const [repairDetails, setRepairDetails] = useState('');
    const [repairCost, setRepairCost] = useState('');
    const [failReason, setFailReason] = useState('');
    const [waitingReason, setWaitingReason] = useState('');

    // API mutation'lari
    const [deleteOrder] = useDeleteOrderMutation();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateStatusMutation();
    const [updateWaiting, { isLoading: isUpdatingWaiting }] =
        useUpdateWaitingMutation();

    const { showNotification } = useNotification();
    const [loadingOrderId, setLoadingOrderId] = useState(null);

    // Status konfiguratsiyasi
    const statusConfig = {
        pending: { text: 'Kutilmoqda', color: 'status-pending' },
        inProgress: { text: 'Remont jarayonida', color: 'status-progress' },
        ready: { text: 'Tayyor', color: 'status-ready' },
        collected: { text: 'Olib ketildi', color: 'status-collected' },
        failed: { text: 'Tuzalmadi', color: 'status-failed' },
    };

    // Umumiy status o‘zgartirish
    const handleStatusButtonClick = async (order, newStatus, extraData = {}) => {
        setLoadingOrderId(order._id);
        try {
            await updateStatus({
                id: order._id,
                body: { status: newStatus, ...extraData },
            }).unwrap();

            refreshOrders();
            showNotification(
                `Status ${statusConfig[newStatus]?.text} ga o'zgartirildi`,
                'success'
            );
        } catch (err) {
            console.error('Status update error:', err);
            showNotification('Status yangilanmadi', 'error');
        } finally {
            setLoadingOrderId(null);
        }
    };

    // Buyurtma o‘chirish tasdiqlash
    const handleDeleteConfirm = async () => {
        if (!deleteConfirmOrder) return;

        try {
            const res = await deleteOrder(deleteConfirmOrder._id).unwrap();
            refreshOrders();
            showNotification(
                res?.message || 'Buyurtma muvaffaqiyatli o‘chirildi',
                'success'
            );
        } catch (err) {
            console.error('Delete error:', err);
            showNotification('Buyurtma o‘chirilmadi', 'error');
        } finally {
            setDeleteConfirmOrder(null);
        }
    };

    // Kutish holati
    const openWaitingModal = (order) => {
        setWaitingModalOrder(order);
        setWaitingReason(order.waiting?.reason || '');
    };

    const handleWaitingToggle = async (order) => {
        if (order.waiting?.isWaiting) {
            // Kutishni bekor qilish
            setLoadingOrderId(order._id);
            try {
                await updateWaiting({
                    id: order._id,
                    body: { isWaiting: false },
                }).unwrap();
                refreshOrders();
                showNotification('Kutish holati bekor qilindi', 'success');
            } catch (err) {
                showNotification('Xatolik', 'error');
            } finally {
                setLoadingOrderId(null);
            }
        } else {
            // Kutishni yoqish
            openWaitingModal(order);
        }
    };

    const handleWaitingSubmit = async () => {
        if (!waitingModalOrder || !waitingReason.trim()) {
            showNotification('Ehtiyot qism nomini yozing', 'error');
            return;
        }

        setLoadingOrderId(waitingModalOrder._id);
        try {
            await updateWaiting({
                id: waitingModalOrder._id,
                body: { isWaiting: true, reason: waitingReason.trim() },
            }).unwrap();

            refreshOrders();
            showNotification('Buyurtma ehtiyot qism kutish holatiga o‘tkazildi', 'success');
            setWaitingModalOrder(null);
            setWaitingReason('');
        } catch (err) {
            console.error('Waiting update error:', err);
            showNotification('Xatolik yuz berdi', 'error');
        } finally {
            setLoadingOrderId(null);
        }
    };

    // Tayyor modal
    const openReadyModal = (order) => {
        setReadyModalOrder(order);
        setRepairDetails('');
        setRepairCost('');
    };

    const handleReadySubmit = async () => {
        if (!readyModalOrder) return;

        const costValue = repairCost ? parseFloat(repairCost) : null;
        if (!repairCost || costValue < 0) {
            showNotification('Taʼmir narxini to‘g‘ri kiriting', 'error');
            return;
        }
        if (!repairDetails.trim()) {
            showNotification('Qilingan ishlarni yozing', 'error');
            return;
        }

        await handleStatusButtonClick(readyModalOrder, 'ready', {
            repairDetails: repairDetails.trim(),
            repairCost: costValue,
        });
        setReadyModalOrder(null);
    };

    // Tuzalmadi modal
    const openFailedModal = (order) => {
        setFailedModalOrder(order);
        setFailReason('');
    };

    const handleFailedSubmit = async () => {
        if (!failedModalOrder || !failReason.trim()) {
            showNotification('Tuzalmadi sababini yozing', 'error');
            return;
        }

        await handleStatusButtonClick(failedModalOrder, 'failed', {
            failReason: failReason.trim(),
        });
        setFailedModalOrder(null);
    };

    return (
        <>
            <div className="orders-grid">
                {orders?.length === 0 ? (
                    <div className="no-orders">Buyurtmalar mavjud emas</div>
                ) : (
                    orders?.map((order, inx) => (
                        <div
                            key={inx}
                            className="order-card"
                            style={{
                                border: order?.waiting?.isWaiting && '1px solid #001aff55',
                                backgroundColor: order?.waiting?.isWaiting && '#001aff15',
                            }}
                        >

                            {/* Hover tooltip - faqat kutish holatida ko‘rinadi */}
                            {order?.waiting?.isWaiting && (
                                <div className="waiting-tooltip">
                                    <span className="tooltip-arrow" /> {/* uchli strelka */}
                                    <div className="tooltip-content">
                                        <strong>⏳ Ehtiyot qism kutilyapti:</strong>
                                        <br />
                                        {order.waiting?.reason || 'Sabab ko‘rsatilmagan'}
                                    </div>
                                </div>
                            )}

                            {/* Card Header */}
                            <div className="card-header">
                                <div className="customer-info">
                                    <h3>{order.customerName}</h3>
                                    <p className="phone-number">{order.phoneNumber}</p>
                                </div>

                                <div className="customer-status">
                                    {order?.waiting?.isWaiting ? (
                                        <span className="waiting-badge">Ehtiyot qismni kutmoqda</span>
                                    ) : (
                                        <span className={`status-badge ${statusConfig[order.status]?.color}`}>
                                            {statusConfig[order.status]?.text}
                                        </span>
                                    )}

                                    {/* Delete button (pending holatida) */}
                                    {order.status === 'pending' && (
                                        <div className="relative">
                                            <button
                                                disabled={order?.waiting?.isWaiting}
                                                className="status-deleteBtn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirmOrder(order);
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            {deleteConfirmOrder?._id === order._id && (
                                                <div
                                                    className="delete-popover"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="popover-content">
                                                        <AlertTriangle size={19} className="text-red-600" />
                                                        <p>Buyurtmani o‘chirishga ishonchingiz komilmi?</p>
                                                        <div className="popover-actions">
                                                            <button
                                                                className="cancel-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteConfirmOrder(null);
                                                                }}
                                                            >
                                                                Yo‘q
                                                            </button>
                                                            <button
                                                                className="confirm-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteConfirm();
                                                                }}
                                                            >
                                                                Ha, o‘chirish
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Jami narx (ready yoki collected) */}
                                    {(order?.status === 'ready' || order?.status === 'collected') && (
                                        <p className="total-cost">
                                            {NumberFormat(order?.TotalCost || 0)} so'm
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Card Body - Tafsilotlar */}
                            <div className="card-body" onClick={() => setSelectedOrder(order)}>
                                <div className="info-rowse">
                                    <span className="label">Brend & Model:</span>
                                    <span className="value">{order.brand} {order.phoneModel}</span>
                                </div>
                                <div className="info-rowse">
                                    <span className="label">Muammo:</span>
                                    <span className="value">{order.problem}</span>
                                </div>
                                <div className="info-rowse">
                                    <span className="label">Holati:</span>
                                    <span className="value">{order.condition}</span>
                                </div>
                                <div className="info-rowse">
                                    <span className="label">Ta'mir:</span>
                                    <span className="value">{order.repairDays} kun</span>
                                </div>
                            </div>

                            {/* Card Footer - Tugmalar */}
                            <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                                <span className="date-text">
                                    {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                                </span>

                                {/* Telegram xabar */}
                                {(order.status === 'ready' || order.status === 'failed') && (
                                    <button className="call-btn tg" onClick={() => setIsModalOpen(order)}>
                                        <MessageCircleMore size={22} />
                                    </button>
                                )}

                                {/* Statusga qarab tugmalar */}
                                {order.status === 'pending' && (
                                    <button
                                        className="details-btn"
                                        disabled={loadingOrderId === order._id}
                                        style={{ padding: loadingOrderId === order._id ? '2px 8px' : '' }}
                                        onClick={() => handleStatusButtonClick(order, 'inProgress')}
                                    >
                                        {loadingOrderId === order._id ? (
                                            <Loader2 className="spinner-icon" size={19} />
                                        ) : (
                                            'Boshlash'
                                        )}
                                    </button>
                                )}

                                {order.status === 'inProgress' && (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {/* Kutish tugmasi */}
                                        <button
                                            className="details-btn status-failed"
                                            disabled={loadingOrderId === order._id}
                                            style={{
                                                background: order.waiting?.isWaiting ? '#ff3a3a' : '#00ddff',
                                                padding: loadingOrderId === order._id ? '2px 8px' : '',
                                            }}
                                            onClick={() => handleWaitingToggle(order)}
                                        >
                                            {loadingOrderId === order._id ? (
                                                <Loader2 className="spinner-icon" size={15} />
                                            ) : (
                                                <HiMiniWrenchScrewdriver size={15} />
                                            )}
                                            {order.waiting?.isWaiting && (
                                                <span style={{ fontSize: '14px', marginLeft: '4px' }}>✔</span>
                                            )}
                                        </button>

                                        {/* Tuzalmadi */}
                                        <button
                                            className="details-btn status-failed"
                                            disabled={loadingOrderId === order._id || order.waiting?.isWaiting}
                                            style={{
                                                background: '#ffd000',
                                                padding: loadingOrderId === order._id ? '2px 8px' : '',
                                            }}
                                            onClick={() => openFailedModal(order)}
                                        >
                                            {loadingOrderId === order._id ? (
                                                <Loader2 className="spinner-icon" size={19} />
                                            ) : (
                                                'Tuzalmadi'
                                            )}
                                        </button>

                                        {/* Tayyor */}
                                        <button
                                            className="details-btn status-ready"
                                            disabled={loadingOrderId === order._id || order.waiting?.isWaiting}
                                            style={{ padding: loadingOrderId === order._id ? '2px 8px' : '' }}
                                            onClick={() => openReadyModal(order)}
                                        >
                                            {loadingOrderId === order._id ? (
                                                <Loader2 className="spinner-icon" size={19} />
                                            ) : (
                                                'Tuzaldi'
                                            )}
                                        </button>
                                    </div>
                                )}

                                {order.status === 'ready' && (
                                    <button
                                        className="details-btn"
                                        disabled={loadingOrderId === order._id}
                                        style={{ padding: loadingOrderId === order._id ? '2px 8px' : '' }}
                                        onClick={() => handleStatusButtonClick(order, 'collected')}
                                    >
                                        {loadingOrderId === order._id ? (
                                            <Loader2 className="spinner-icon" size={19} />
                                        ) : (
                                            'Topshirish'
                                        )}
                                    </button>
                                )}

                                {(order.status === 'failed' || order.status === 'collected') && (
                                    <span className="details-btn disabled">
                                        {statusConfig[order.status]?.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete overlay */}
            {deleteConfirmOrder && (
                <div className="fixed inset-0 z-50" onClick={() => setDeleteConfirmOrder(null)} />
            )}

            {/* Buyurtma tafsilotlari modali */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    statusConfig={statusConfig}
                    refreshOrders={refreshOrders}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            {/* Telegram xabar modali */}
            {isModalOpen && (
                <OrderActions
                    phoneNumber={isModalOpen?.phoneNumber}
                    fullName={isModalOpen?.customerName}
                    status={isModalOpen?.status}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {/* Tayyor modal */}
            {readyModalOrder && (
                <div className="modal-overlay" onClick={() => setReadyModalOrder(null)}>
                    <div
                        className="modal-box ready-modal animated-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-top">
                            <h2>✅ Ta'mir yakunlandi</h2>
                            <button className="close-btn-modal" onClick={() => setReadyModalOrder(null)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body-content">
                            <p className="modal-subtitle">
                                <strong>{readyModalOrder.customerName}</strong> —{' '}
                                {readyModalOrder.brand} {readyModalOrder.phoneModel}
                            </p>

                            <div className="form-group_modal">
                                <label>Nima ishlar qildingiz?</label>
                                <textarea
                                    placeholder="Masalan: Ekran almashtirildi, batareya yangilandi, korpus tozalandi..."
                                    value={repairDetails}
                                    onChange={(e) => setRepairDetails(e.target.value)}
                                    rows="4"
                                />
                            </div>

                            <div className="form-group_modal">
                                <label>Jami qanchaga tuzaldi? (so'mda)</label>
                                <input
                                    type="number"
                                    placeholder="Masalan: 450000"
                                    value={repairCost}
                                    onChange={(e) => setRepairCost(e.target.value)}
                                    min="0"
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="cancel-btn" onClick={() => setReadyModalOrder(null)}>
                                    Bekor qilish
                                </button>
                                <button
                                    className="confirm-btn"
                                    onClick={handleReadySubmit}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="spinner-icon" size={19} />
                                    ) : (
                                        'Saqlash va Tayyor qilish'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tuzalmadi modal */}
            {failedModalOrder && (
                <div className="modal-overlay" onClick={() => setFailedModalOrder(null)}>
                    <div
                        className="modal-box failed-modal animated-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-top">
                            <h2>❌ Telefon tuzalmadi</h2>
                            <button className="close-btn-modal" onClick={() => setFailedModalOrder(null)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body-content">
                            <p className="modal-subtitle">
                                <strong>{failedModalOrder.customerName}</strong> —{' '}
                                {failedModalOrder.brand} {failedModalOrder.phoneModel}
                            </p>

                            <div className="form-group_modal">
                                <label>Sababini batafsil yozing</label>
                                <textarea
                                    placeholder="Masalan: Kerakli ehtiyot qism topilmadi, plata jiddiy shikastlangan..."
                                    value={failReason}
                                    onChange={(e) => setFailReason(e.target.value)}
                                    rows="5"
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="cancel-btn" onClick={() => setFailedModalOrder(null)}>
                                    Bekor qilish
                                </button>
                                <button
                                    className="confirm-btn failed-confirm"
                                    onClick={handleFailedSubmit}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="spinner-icon" size={19} />
                                    ) : (
                                        'Saqlash va Tuzalmadi qilish'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ehtiyot qism kutish modali */}
            {waitingModalOrder && (
                <div className="modal-overlay" onClick={() => setWaitingModalOrder(null)}>
                    <div
                        className="modal-box waiting-modal animated-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-top">
                            <h2>⏳ Ehtiyot qismni kutmoqda</h2>
                            <button className="close-btn-modal" onClick={() => setWaitingModalOrder(null)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body-content">
                            <p className="modal-subtitle">
                                <strong>{waitingModalOrder.customerName}</strong> —{' '}
                                {waitingModalOrder.brand} {waitingModalOrder.phoneModel}
                            </p>

                            <div className="form-group_modal">
                                <label>Qaysi ehtiyot qism kutilyapti? (batafsil yozing)</label>
                                <textarea
                                    placeholder="Masalan: Original ekran, batareya, plata, kamera moduli..."
                                    value={waitingReason}
                                    onChange={(e) => setWaitingReason(e.target.value)}
                                    rows="4"
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="cancel-btn" onClick={() => setWaitingModalOrder(null)}>
                                    Bekor qilish
                                </button>
                                <button
                                    className="confirm-btn waiting-confirm"
                                    onClick={handleWaitingSubmit}
                                    disabled={isUpdatingWaiting || !waitingReason.trim()}
                                >
                                    {isUpdatingWaiting ? (
                                        <Loader2 className="spinner-icon" size={19} />
                                    ) : (
                                        'Saqlash va Kutishga o‘tkazish'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}