// DebugDeviceApi.jsx
import React, { useEffect, useState } from "react";
import {
    useGetAndroidFullInfoQuery,
    useGetAndroidPowerQuery,
    useGetIosDeviceInfoQuery,
    useGetIosBatteryQuery,
    useGetIosLogsQuery,
} from "../../context/deviceApi";

import { io } from "socket.io-client";
const socket = io("http://localhost:5000");  // backend URL

const DebugDeviceApi = () => {

    // RTK Query fetch bo'lsin — server socket.trigger ishlaydi
    const androidFull = useGetAndroidFullInfoQuery();
    const androidPower = useGetAndroidPowerQuery();
    const iosDevice = useGetIosDeviceInfoQuery();
    const iosBattery = useGetIosBatteryQuery();
    const iosLogs = useGetIosLogsQuery();

    // socket orqali kelgan natijalarni saqlaymiz
    const [androidFullData, setAndroidFullData] = useState(null);
    const [androidPowerData, setAndroidPowerData] = useState(null);
    const [iosDeviceData, setIosDeviceData] = useState(null);
    const [iosBatteryData, setIosBatteryData] = useState(null);
    const [iosLogsData, setIosLogsData] = useState(null);

    useEffect(() => {
        // ANDROID LISTENERS
        socket.on("android:full-info", setAndroidFullData);
        socket.on("android:power-live", setAndroidPowerData);

        // IOS LISTENERS
        socket.on("ios:device-info", setIosDeviceData);
        socket.on("ios:battery", setIosBatteryData);
        socket.on("ios:logs", setIosLogsData);

        return () => {
            socket.off("android:full-info");
            socket.off("android:power-live");
            socket.off("ios:device-info");
            socket.off("ios:battery");
            socket.off("ios:logs");
        };
    }, []);

    console.log("📡 SOCKET REAL DATA:", {
        androidFullData, androidPowerData, iosDeviceData, iosBatteryData, iosLogsData
    });

    return (
        <div style={{ padding: 20 }}>
            <h2>📱 Device Debug Panel</h2>

            <pre>Android Full Info: {JSON.stringify(androidFullData, null, 2)}</pre>
            <pre>Android Power: {JSON.stringify(androidPowerData, null, 2)}</pre>
            <pre>iOS Device: {JSON.stringify(iosDeviceData, null, 2)}</pre>
            <pre>iOS Battery: {JSON.stringify(iosBatteryData, null, 2)}</pre>
            <pre>iOS Logs: {JSON.stringify(iosLogsData, null, 2)}</pre>
        </div>
    );
};

export default DebugDeviceApi;


// import { useEffect, useState } from "react";
// import jsPDF from "jspdf";
// import './style.css'

// /* ================= CONFIG ================= */
// const API = "http://localhost:3001";
// const endpoints = ["device", "battery", "usb", "camera", "sensors"];

// /* ================= HELPERS ================= */
// const fetchAll = async () => {
//     const res = await Promise.all(
//         endpoints.map(e =>
//             fetch(`${API}/${e}`)
//                 .then(r => r.json())
//                 .catch(() => ({ error: true }))
//         )
//     );
//     return {
//         device: res[0],
//         battery: res[1],
//         usb: res[2],
//         camera: res[3],
//         sensors: res[4],
//     };
// };

// const passFail = (ok) => ({
//     color: ok ? "#0a8f3c" : "#c62828",
//     text: ok ? "PASS" : "FAIL"
// });

// /* ================= MAIN ================= */
// export default function Diagnostic() {
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         load();
//         const t = setInterval(load, 15000);
//         return () => clearInterval(t);
//     }, []);

//     const load = async () => {
//         setLoading(true);
//         const d = await fetchAll();
//         setData(d);
//         setLoading(false);
//     };

//     if (loading)
//         return (
//             <div className="loading-container_diag">
//                 <div className="loading-spinner_diag"></div>
//                 <p className="loading-text_diag">⏳ Diagnostika qilinmoqda...</p>
//             </div>
//         );

//     if (!data)
//         return (
//             <div className="error-container_diag">
//                 <p className="error-text_diag">❌ Xatolik</p>
//             </div>
//         );

//     /* ================= ANALYZE ================= */
//     const batteryOk = data.battery?.data?.includes("level");
//     const usbOk = !data.usb?.error && data.usb?.data?.includes("device");
//     const cameraOk = data.camera?.data?.includes("Camera");
//     const sensorOk = data.sensors?.data?.includes("Sensor");

//     /* ================= PDF ================= */
//     const exportPDF = () => {
//         const pdf = new jsPDF();
//         pdf.text("ANDROID DIAGNOSTIKA HISOBOTI", 10, 10);
//         let y = 20;
//         Object.entries(data).forEach(([k, v]) => {
//             pdf.text(`--- ${k.toUpperCase()} ---`, 10, y);
//             y += 6;
//             const text = (v?.raw || v?.data || "N/A").toString().slice(0, 1500);
//             pdf.text(text, 10, y);
//             y += 20;
//         });
//         pdf.save("android-diagnostika.pdf");
//     };

//     /* ================= UI BLOCK ================= */
//     const Block = ({ title, status, body }) => (
//         <div className="diagnostic-block_diag">
//             <div className="block-header_diag">
//                 <h3 className="block-title_diag">{title}</h3>
//                 {status && (
//                     <span
//                         className="status-badge_diag"
//                         style={{ backgroundColor: status.color }}
//                     >
//                         {status.text}
//                     </span>
//                 )}
//             </div>
//             <pre className="block-content_diag">{body}</pre>
//         </div>
//     );

//     /* ================= RENDER ================= */
//     return (
//         <div className="app-container_diag">
//             <div className="header_diag">
//                 <h1 className="main-title_diag">📱 Android USB Diagnostika</h1>
//                 <div className="button-group_diag">
//                     <button onClick={load} className="btn_diag btn-refresh_diag">
//                         🔄 Qayta tekshirish
//                     </button>
//                     <button onClick={exportPDF} className="btn_diag btn-pdf_diag">
//                         📄 PDF chiqarish
//                     </button>
//                 </div>
//             </div>

//             <div className="diagnostics-grid_diag">
//                 <Block
//                     title="📱 QURILMA MA'LUMOTLARI"
//                     body={data.device?.data || "Ma'lumot yo'q"}
//                 />
//                 <Block
//                     title="🔋 BATAREYA"
//                     status={passFail(batteryOk)}
//                     body={data.battery?.data || "Ma'lumot yo'q"}
//                 />
//                 <Block
//                     title="🔌 USB ULANISH"
//                     status={passFail(usbOk)}
//                     body={data.usb?.data || "USB ulanmagan"}
//                 />
//                 <Block
//                     title="📷 KAMERA"
//                     status={passFail(cameraOk)}
//                     body={data.camera?.data || "Kamera topilmadi"}
//                 />
//                 <Block
//                     title="📡 SENSORLAR"
//                     status={passFail(sensorOk)}
//                     body={data.sensors?.data || "Sensor topilmadi"}
//                 />
//             </div>

//             <div className="warning-box_diag">
//                 <p className="warning-text_diag">
//                     ⚠️ <strong>Eslatma:</strong> Zamikaniya joyi, plata darajasidagi
//                     nosozliklar faqat servis uskunalari bilan aniqlanadi.
//                 </p>
//             </div>
//         </div>
//     );
// }