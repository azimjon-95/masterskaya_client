import axios from "axios";

const mainURL = axios.create({
  // baseUrl: "http://localhost:4070/api/v1",
  baseURL: "https://masterskaya-api.medme.uz/api/v1",
});

export default mainURL;
