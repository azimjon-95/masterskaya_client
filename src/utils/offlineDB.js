import { openDB } from 'idb';

export const dbPromise = openDB('repairCRM', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('offline_orders')) {
            db.createObjectStore('offline_orders', { keyPath: 'id', autoIncrement: true });
        }
    }
});

// OFFLINE saqlash
export async function saveOfflineOrder(data) {
    const db = await dbPromise;
    await db.add('offline_orders', { ...data, synced: false, date: new Date() });
}

// Hammasini olish
export async function getOfflineOrders() {
    const db = await dbPromise;
    return await db.getAll('offline_orders');
}

// Sync bo‘lgandan keyin o‘chirish
export async function deleteOfflineOrder(id) {
    const db = await dbPromise;
    await db.delete('offline_orders', id);
}
