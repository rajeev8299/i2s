import axios from "axios";
const API_BASE_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
});

export default api 