import { api } from "./api";

export const dashboardApi = api.injectEndpoints({
    endpoints: (builder) => ({

        // 🔥 Dashboard statistikalarini olish
        getDashboard: builder.query({
            query: (month) => ({
                url: `/dashboard${month ? `?month=${month}` : ""}`,
                method: "GET",
            }),
            providesTags: ["Dashboard"],
        }),

        // 🔥 Agar kerak bo‘lsa real-time update uchun refetch
        refetchDashboard: builder.mutation({
            query: (month) => ({
                url: `/dashboard${month ? `?month=${month}` : ""}`,
                method: "GET",
            }),
            invalidatesTags: ["Dashboard"],
        }),
    }),
});

// Hooklar
export const {
    useGetDashboardQuery,
    useLazyGetDashboardQuery,
    useRefetchDashboardMutation
} = dashboardApi;
