import axios from "axios";
const stateObj = localStorage.getItem("election-auth-app-storage");
const state = stateObj ? JSON.parse(stateObj) : "";
const token = state?.state?.token;

export const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
