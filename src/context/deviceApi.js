import { api } from "./api"; // sizning asosiy api slicingiz

export const deviceApi = api.injectEndpoints({
    endpoints: (builder) => ({

        // ================= ANDROID =================
        getAndroidFullInfo: builder.query({
            query: () => "/android/full-info",
        }),

        getAndroidPower: builder.query({
            query: () => "/android/power",
        }),

        // ================= iOS =================
        getIosDeviceInfo: builder.query({
            query: () => "/ios/device",
        }),

        getIosBattery: builder.query({
            query: () => "/ios/battery",
        }),

        getIosLogs: builder.query({
            query: () => "/ios/logs",
        }),

        // get("/api/device-info"
        getFullDeviceInfo: builder.query({
            query: () => "/device_info",
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetAndroidFullInfoQuery,
    useGetAndroidPowerQuery,
    useGetIosDeviceInfoQuery,
    useGetIosBatteryQuery,
    useGetIosLogsQuery,

    // Lazy versiyalari (manual trigger uchun)
    useLazyGetAndroidFullInfoQuery,
    useLazyGetAndroidPowerQuery,
    useLazyGetIosDeviceInfoQuery,
    useLazyGetIosBatteryQuery,
    useLazyGetIosLogsQuery,

    // RTK Query fetch bo'lsin — server socket.trigger ishlaydi
    useLazyGetFullDeviceInfoQuery,
} = deviceApi;