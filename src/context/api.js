import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

// Bazaviy query — token bilan avtomatik headerga qo‘shiladi
const baseQuery = fetchBaseQuery({
  baseUrl: "https://masterskaya-api.medme.uz/api/v1", // yoki sizning server manzilingiz
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Retry bilan o‘rash — 3 marta qayta urinish imkoniyati
const baseQueryWithRetry = retry(baseQuery, { maxRetries: 3 });

// RTK Query API obyektini yaratish
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Admins", "Orders", "Finance", "Balance", "Sales"], // kerakli taglar
  endpoints: () => ({}), // endpointlar keyinchalik qo‘shiladi
});
