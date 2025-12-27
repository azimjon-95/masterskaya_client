import React, { useEffect } from "react";
import {
    // Oddiy queries (avto-fetch)
    useGetAndroidFullInfoQuery,
    useGetAndroidPowerQuery,
    useGetIosDeviceInfoQuery,
    useGetIosBatteryQuery,
    useGetIosLogsQuery,

    // Lazy queries (qo'lda chaqirish uchun)
    useLazyGetAndroidFullInfoQuery,
    useLazyGetAndroidPowerQuery,
    useLazyGetIosDeviceInfoQuery,
    useLazyGetIosBatteryQuery,
    useLazyGetIosLogsQuery,
} from "../../context/deviceApi"; // o'zingizning yo'lingizga moslashtiring

const DebugDeviceApi = () => {
    // ================= ODDIY QUERIES =================
    const androidFull = useGetAndroidFullInfoQuery();
    const androidPower = useGetAndroidPowerQuery();
    const iosDevice = useGetIosDeviceInfoQuery();
    const iosBattery = useGetIosBatteryQuery();
    const iosLogs = useGetIosLogsQuery();

    // ================= LAZY QUERIES =================
    const [triggerAndroidFull, lazyAndroidFull] = useLazyGetAndroidFullInfoQuery();
    const [triggerAndroidPower, lazyAndroidPower] = useLazyGetAndroidPowerQuery();
    const [triggerIosDevice, lazyIosDevice] = useLazyGetIosDeviceInfoQuery();
    const [triggerIosBattery, lazyIosBattery] = useLazyGetIosBatteryQuery();
    const [triggerIosLogs, lazyIosLogs] = useLazyGetIosLogsQuery();

    // Lazy query'larni komponent yuklanganda bir marta chaqiramiz
    useEffect(() => {
        triggerAndroidFull();
        triggerAndroidPower();
        triggerIosDevice();
        triggerIosBattery();
        triggerIosLogs();
    }, [
        triggerAndroidFull,
        triggerAndroidPower,
        triggerIosDevice,
        triggerIosBattery,
        triggerIosLogs,
    ]);

    // ================= BITTA LOGGA HAMMASI =================
    useEffect(() => {
        const debugData = {
            timestamp: new Date().toISOString(),

            // Oddiy queries
            getAndroidFullInfo: {
                data: androidFull.data,
                isLoading: androidFull.isLoading,
                isFetching: androidFull.isFetching,
                isSuccess: androidFull.isSuccess,
                isError: androidFull.isError,
                error: androidFull.error,
            },
            getAndroidPower: {
                data: androidPower.data,
                isLoading: androidPower.isLoading,
                isFetching: androidPower.isFetching,
                isSuccess: androidPower.isSuccess,
                isError: androidPower.isError,
                error: androidPower.error,
            },
            getIosDeviceInfo: {
                data: iosDevice.data,
                isLoading: iosDevice.isLoading,
                isFetching: iosDevice.isFetching,
                isSuccess: iosDevice.isSuccess,
                isError: iosDevice.isError,
                error: iosDevice.error,
            },
            getIosBattery: {
                data: iosBattery.data,
                isLoading: iosBattery.isLoading,
                isFetching: iosBattery.isFetching,
                isSuccess: iosBattery.isSuccess,
                isError: iosBattery.isError,
                error: iosBattery.error,
            },
            getIosLogs: {
                data: iosLogs.data,
                isLoading: iosLogs.isLoading,
                isFetching: iosLogs.isFetching,
                isSuccess: iosLogs.isSuccess,
                isError: iosLogs.isError,
                error: iosLogs.error,
            },

            // Lazy queries
            lazyAndroidFull: {
                data: lazyAndroidFull.data,
                isLoading: lazyAndroidFull.isLoading,
                isFetching: lazyAndroidFull.isFetching,
                isSuccess: lazyAndroidFull.isSuccess,
                isError: lazyAndroidFull.isError,
                error: lazyAndroidFull.error,
            },
            lazyAndroidPower: {
                data: lazyAndroidPower.data,
                isLoading: lazyAndroidPower.isLoading,
                isFetching: lazyAndroidPower.isFetching,
                isSuccess: lazyAndroidPower.isSuccess,
                isError: lazyAndroidPower.isError,
                error: lazyAndroidPower.error,
            },
            lazyIosDevice: {
                data: lazyIosDevice.data,
                isLoading: lazyIosDevice.isLoading,
                isFetching: lazyIosDevice.isFetching,
                isSuccess: lazyIosDevice.isSuccess,
                isError: lazyIosDevice.isError,
                error: lazyIosDevice.error,
            },
            lazyIosBattery: {
                data: lazyIosBattery.data,
                isLoading: lazyIosBattery.isLoading,
                isFetching: lazyIosBattery.isFetching,
                isSuccess: lazyIosBattery.isSuccess,
                isError: lazyIosBattery.isError,
                error: lazyIosBattery.error,
            },
            lazyIosLogs: {
                data: lazyIosLogs.data,
                isLoading: lazyIosLogs.isLoading,
                isFetching: lazyIosLogs.isFetching,
                isSuccess: lazyIosLogs.isSuccess,
                isError: lazyIosLogs.isError,
                error: lazyIosLogs.error,
            },
        };

        console.log("%c=== DEVICE API FULL DEBUG (All Queries + Lazy) ===",
            "font-weight: bold; font-size: 18px; color: #FF5722; background: #000; padding: 10px; border-radius: 8px;"
        );
        console.log(debugData);
        console.table(debugData); // Jadval ko'rinishida ham
    }, [
        // Har bir o'zgarishda yangilanish uchun barcha statedan bog'lanamiz
        androidFull, androidPower, iosDevice, iosBattery, iosLogs,
        lazyAndroidFull, lazyAndroidPower, lazyIosDevice, lazyIosBattery, lazyIosLogs,
    ]);

    return (
        <div style={{
            padding: "20px",
            background: "#fff3e0",
            border: "2px solid #FF5722",
            borderRadius: "12px",
            margin: "20px",
            fontFamily: "monospace"
        }}>
            <h2 style={{ color: "#D84315" }}>🔧 Device API Debug Panel</h2>
            <p><strong>Konsolni oching (F12 → Console)</strong></p>
            <p>Barcha query va lazy query natijalari bitta logga yig'ildi!</p>
            <ul>
                <li>Oddiy query'lar avtomatik ishlaydi</li>
                <li>Lazy query'lar komponent yuklanganda bir marta chaqiriladi</li>
                <li>Har yangilanishda console yangilanadi</li>
            </ul>
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