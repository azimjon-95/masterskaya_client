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
} = deviceApi;