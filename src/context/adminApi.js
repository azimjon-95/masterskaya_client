import { api } from "./api";

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/login",
                method: "POST",
                body: credentials,
            }),
        }),

        getAllUsers: builder.query({
            query: () => "/users",
            providesTags: ["Admins"],
        }),

        getUserById: builder.query({
            query: (id) => `/users/${id}`,
            providesTags: ["Admins"],
        }),

        updateUser: builder.mutation({
            query: ({ id, ...updatedData }) => ({
                url: `/users/${id}`,
                method: "PUT",
                body: updatedData,
            }),
            invalidatesTags: ["Admins"],
        }),

        createUser: builder.mutation({
            query: (newUser) => ({
                url: "/users",
                method: "POST",
                body: newUser,
            }),
            invalidatesTags: ["Admins"],
        }),

        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Admins"],
        }),

        //router.get("/users/:id/full-details",
        getUserFullDetails: builder.query({
            query: (id) => `/users/${id}/full-details`,
            providesTags: ["Admins"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useLoginMutation,
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useGetUserFullDetailsQuery,
} = adminApi;
