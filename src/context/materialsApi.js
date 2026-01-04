import { api } from "./api";

export const materialsApi = api.injectEndpoints({
    endpoints: (builder) => ({

        // 🔹 Barcha detallarni olish
        getParts: builder.query({
            query: () => "/port",
            providesTags: ["Parts"]
        }),

        // 🔹 Yangi zapchast qo'shish
        addPart: builder.mutation({
            query: (body) => ({
                url: "/port",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Parts"]
        }),

        // 🔹 Zapchastni yangilash
        updatePart: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/port/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Parts"]
        }),

        // 🔹 Zapchastni o'chirish
        deletePart: builder.mutation({
            query: (id) => ({
                url: `/port/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Parts"]
        }),
        // 🔹 Zapchast sotish (YANGI)
        sellPart: builder.mutation({
            query: ({ id, quantity, salePrice }) => ({
                url: `/port/sell/${id}`,
                method: "POST",
                body: { quantity, salePrice },
            }),
            invalidatesTags: ["Parts"] // quantity yangilansin
        }),

        getSales: builder.query({
            query: (month) => `/port/sales?month=${month}`,
            providesTags: ["Sales"]
        }),

        // 🔹 Barcha detallarni olish
        getExtiyotParts: builder.query({
            query: () => "/port/extiyot-parts",
            providesTags: ["Parts"]
        }),

    }),

    overrideExisting: false,
});

export const {
    useGetPartsQuery,
    useAddPartMutation,
    useUpdatePartMutation,
    useDeletePartMutation,
    useSellPartMutation,
    useGetSalesQuery,
    useGetExtiyotPartsQuery,
} = materialsApi;
