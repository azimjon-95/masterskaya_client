import { api } from "./api";

export const FinanceApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Barcha tranzaksiyalar + statistika + balans
        getFinanceData: builder.query({
            query: (month) => (
                {
                    url: "/finance",
                    params: { month }, // bu avtomatik ?month=2025.12 qilib jo'natadi (xavfsizroq)
                }),
            providesTags: ["Finance", "Balance"], // cache taglari
        }),

        // Faqat joriy balansni olish (tez-tez ishlatilganda foydali)
        getBalance: builder.query({
            query: () => "/balance",
            providesTags: ["Balance"],
        }),

        // Yangi tranzaksiya qo'shish
        createTransaction: builder.mutation({
            query: (newTransaction) => ({
                url: "/finance",
                method: "POST",
                body: newTransaction,
            }),
            invalidatesTags: ["Finance", "Balance"], // create bo'lganda cache ni tozalaydi
        }),

        // Tranzaksiyani o'chirish
        deleteTransaction: builder.mutation({
            query: (id) => ({
                url: `/finance/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Finance", "Balance"], // delete bo'lganda cache ni tozalaydi
        }),

        // Bizga qarzdorlar (given)
        getDebtors: builder.query({
            query: () => "/finance/debtors",
            providesTags: ["Debt"],
        }),

        // Telefon bo‘yicha qarzni to‘liq yopish
        payDebtByPhone: builder.mutation({
            query: (body) => {
                return {
                    url: "/debt/pay",
                    method: "POST",
                    body,
                };
            },
            invalidatesTags: ["Finance", "Balance", "Debt"],
        }),
    }),
});

// Hook'larni eksport qilamiz
export const {
    useGetFinanceDataQuery,
    useGetBalanceQuery,
    useCreateTransactionMutation,
    useDeleteTransactionMutation,

    // debt hooks
    useGetDebtorsQuery,
    usePayDebtByPhoneMutation,
} = FinanceApi;