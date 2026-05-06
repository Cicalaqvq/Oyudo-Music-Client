import axios from "axios";
import store from "../store/index.js";
import router from "../router/index.js";

import {message, notification} from "./message.js";
import {removeLoginState} from "./auth.js";


const request = axios.create({
    baseURL: "/api", // 配置baseURL
    headers: {
        "Content-Type": "application/json;charset=utf-8",
    },
    timeout: 10 * 1000 // 默认超时时间为10秒
});

// 请求拦截器
request.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么
        const token = store.state.ADMIN_TOKEN;
        if (!token) {
            config.headers["token-admin"] = token;
        }
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    function (response) {
        // 2xx 范围内的状态码都会触发该函数。
        const code = response.data.code;
        if (code !== 200) {
            if (code === 401) {
                message("未登录或登录已过期", "warning");
                removeLoginState();
                router.push("/login");
            } else if (code === 404) {
                message("未找到后端请求地址，请检查后端服务器", "error");
            } else if (code === 500) {
                message(response.data.msg, "error");
            }
            return Promise.reject(response.data.msg);
        }
        return response;
    },
    function (error) {
        const code = error.response.status;
        let msg;
        if (code === 500) {
            msg = "请检查后端服务器";
        } else if (code === 404) {
            msg = "未找到后端请求地址";
        } else {
            msg = error.response.statusText;
        }
        notification(`错误代码：${code}`, `${msg}`, "error")
        return Promise.reject(error);
    },
);
export default request;
