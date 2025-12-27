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
    }),
    overrideExisting: false,
});

export const {
    useLoginMutation,
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useDeleteUserMutation,
} = adminApi;
