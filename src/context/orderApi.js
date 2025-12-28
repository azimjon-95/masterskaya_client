import { api } from "./api";
import { saveOfflineOrder, getOfflineOrders, deleteOfflineOrder } from "../utils/offlineDB";

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({ month, filter }) => ({
        url: "/orders",
        params: { month, filter }, // avtomatik ?month=YYYY.MM
      }),
      providesTags: ["Orders"],
    }),

    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ["Orders"],
    }),

    createOrder: builder.mutation({
      async queryFn(formData, _queryApi, _extraOptions, baseQuery) {

        // Internet yo‘q bo‘lsa — IndexedDB ga saqlaymiz
        if (!navigator.onLine) {
          await saveOfflineOrder(Object.fromEntries(formData));
          return { data: { offline: true, message: "Offline saqlandi, internet bo‘lsa yuboriladi" } };
        }

        // Online bo‘lsa serverga yuboriladi
        const result = await baseQuery({
          url: "/orders",
          method: "POST",
          body: formData,
        });

        return result;
      },
      invalidatesTags: ["Orders"],
    }),
    // createOrder: builder.mutation({
    //   query: (formData) => ({
    //     url: "/orders",
    //     method: "POST",
    //     body: formData,
    //   }),
    //   invalidatesTags: ["Orders"],
    // }),

    updateOrder: builder.mutation({
      query: ({ id, data }) => (
        {
          url: `/orders/${id}`,
          method: "PUT",
          body: data,
        }),
      invalidatesTags: ["Orders"],
    }),

    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),

    // patch("/orders/:id/status",
    updateStatus: builder.mutation({
      query: ({ id, body }
      ) => (
        {
          url: `/status/${id}`,
          method: "PUT",
          body
        }),
      invalidatesTags: ["Orders"],
    }),

    updateWaiting: builder.mutation({
      query: ({ id, body }) => (
        {
          url: `/waiting/${id}`,
          method: "PUT",
          body
        }),
      invalidatesTags: ["Orders"],
    }),

    // get("/waiting-orders"
    getWaitingOrders: builder.query({
      query: () => "/waiting-orders",
      providesTags: ["Orders"],
    })
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useUpdateStatusMutation,
  useUpdateWaitingMutation,
  useGetWaitingOrdersQuery
} = orderApi;
