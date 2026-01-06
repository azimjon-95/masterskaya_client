import { api } from "./api";

export const noteApi = api.injectEndpoints({
    endpoints: (builder) => ({

        // ✅ CREATE (image support)
        createNote: builder.mutation({
            query: (formData) => ({
                url: "/note",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Note"],
        }),

        // ✅ GET MY NOTES
        getMyNotes: builder.query({
            query: (id) => `/note?master=${id}`,
            providesTags: ["Note"],
        }),

        // ✅ GET ONE
        getNoteById: builder.query({
            query: (id) => `/note/${id}`,
        }),

        // ✅ UPDATE (image support)
        updateNote: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/note/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Note"],
        }),

        // ✅ DELETE ONE
        deleteNote: builder.mutation({
            query: (id) => ({
                url: `/note/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Note"],
        }),

        // 🚨 DELETE ALL BY MASTER
        deleteAllNotes: builder.mutation({
            query: () => ({
                url: "/note",
                method: "DELETE",
            }),
            invalidatesTags: ["Note"],
        }),

        // 📌 PIN / UNPIN
        togglePin: builder.mutation({
            query: ({ id, master }) => ({
                url: `/note/${id}/pin?master=${master}`,
                method: "PATCH",
            }),
            invalidatesTags: ["Note"],
        }),

        // 🔢 DRAG & DROP REORDER
        reorderNotes: builder.mutation({
            query: (orders) => ({
                url: "/reorder",
                method: "PATCH",
                body: { orders },
            }),
            invalidatesTags: ["Note"],
        }),
    }),
});

export const {
    useCreateNoteMutation,
    useGetMyNotesQuery,
    useGetNoteByIdQuery,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
    useDeleteAllNotesMutation,
    useTogglePinMutation,
    useReorderNotesMutation,
} = noteApi;
