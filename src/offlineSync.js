import { getOfflineOrders, deleteOfflineOrder } from "./utils/offlineDB";

export async function syncOrdersToServer() {
    if (!navigator.onLine) return;

    const orders = await getOfflineOrders();

    for (let order of orders) {
        const formData = new FormData();
        for (let key in order) {
            if (key !== "id") formData.append(key, order[key]);
        }

        try {
            await fetch("http://localhost:5000/api/v1/orders", {
                method: "POST",
                body: formData,
            });

            await deleteOfflineOrder(order.id); // serverga ketdi — o‘chiramiz
            console.log("Offline buyurtma sync qilindi:", order.id);

        } catch (err) {
            console.log("Sync xatosi, keyin uriniladi");
            return;
        }
    }
}
