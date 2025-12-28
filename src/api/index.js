import axios from "axios";

const mainURL = axios.create({
  baseURL: "https://masterskaya-api.medme.uz/api/v1",
});

export default mainURL;
