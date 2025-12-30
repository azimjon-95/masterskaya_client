import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

export const logoutEvent = new Event("forceLogout");

const rawBaseQuery = fetchBaseQuery({
  // baseUrl: "http://localhost:4070/api/v1",
  baseUrl: "https://masterskaya-api.medme.uz/api/v1",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.data?.message) {
    const msg = result.error.data.message;

    if (msg === "invalid signature" || msg === "jwt expired") {
      localStorage.clear();
      window.dispatchEvent(logoutEvent);   // 🔥 App.jsx ga signal yuboradi
    }
  }
  return result;
};

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 3 });

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Admins", "Orders", "Finance", "Balance", "Sales"],
  endpoints: () => ({}),
});
