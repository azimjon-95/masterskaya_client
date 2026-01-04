// DebugDeviceApi.jsx
import React, { useEffect, useState } from "react";
import {
    useGetAndroidFullInfoQuery,
    useGetAndroidPowerQuery,
    useGetIosDeviceInfoQuery,
    useGetIosBatteryQuery,
    useGetIosLogsQuery,
    useLazyGetFullDeviceInfoQuery
} from "../../context/deviceApi";

import { io } from "socket.io-client";
const socket = io("http://localhost:5000");  // backend URL

const DebugDeviceApi = () => {

    const token = localStorage.getItem('token');
    useEffect(() => {
        // token
        fetch("http://localhost:4070/api/v1/device_info", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(data => console.log(data));
    }, []);


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

    // console.log("📡 SOCKET REAL DATA:", {
    //     androidFullData, androidPowerData, iosDeviceData, iosBatteryData, iosLogsData
    // });

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

