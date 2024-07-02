import axios from "axios";
import { BACKEND_URL } from "../config";

const request = axios.create({ withCredentials: true, baseURL: BACKEND_URL });
export { request };
