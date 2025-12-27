import axios from "axios";

const mainURL = axios.create({
  baseURL: "https://technicalinvovatsion.medme.uz/api",
  // baseURL: "http://localhost:8000/api",
});

export default mainURL;
