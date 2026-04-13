import axios from "axios";
import {message, notification} from "./message.js";
import {getCookies, removeCookies, removeLoginState} from "./auth.js";
import store from "../store/index.js";

const request = axios.create({
    baseURL: "/api", // 配置baseURL
    headers: {
        "Content-Type": "application/json;charset=utf-8",
    },
});

// 请求拦截器
request.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么
        const token = getCookies();
        if (token) {
            config.headers["token"] = token;
        }
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    },
);

// 响应拦截器
request.interceptors.response.use(
    function (response) {
        // 2xx 范围内的状态码都会触发该函数。
        const code = response.data.code;

        if (code !== 200) {
            if (code === 401) {
                message("登录已过期", "warning");
                removeCookies();
                removeLoginState(store);
            } else if (code === 500) {
                message(response.data.msg || "请求失败", "error");
            } else if (code === 404) {
                message("未找到后端请求地址，请检查后端服务器", "error");
            } else {
                notification("错误", response.data.msg || "请求失败", "error");
                Promise.reject(response.data.msg);
            }
        }
        // 对响应数据做点什么
        return response;
    },
    function (error) {
        notification("错误", error.message, "error");
        return Promise.reject(error);
    },
);

export default request;
