import {createStore} from 'vuex'
import {getInfo, login, logout} from "../api/manage.js";
import {notification} from "../utils/message.js";
import createPersistedState from 'vuex-persistedstate';

// 创建一个新的 store 实例
const store = createStore({
    state() {
        return {
            IS_LOGIN: false,
            ADMIN_INFO: {},
            ADMIN_TOKEN: null
        }
    },
    mutations: {
        SET_ADMIN_INFO(state, adminInfo) {
            state.ADMIN_INFO = adminInfo
        },
        SET_IS_LOGIN(state, isLogin) {
            state.IS_LOGIN = isLogin
        },
        SET_ADMIN_TOKEN(state, token) {
            state.ADMIN_TOKEN = token
        },

    },
    actions: {
        async adminLogin({commit}, formData) {
            const res = await login(formData.username, formData.password);
            if (res.data.code === 200) {
                notification("登录成功", "欢迎回来！", "success")
                commit("SET_ADMIN_TOKEN", res.data.data);
                commit("SET_IS_LOGIN", true);
            }
        },
        async getAdminInfo({commit}) {
            const res = await getInfo();
            if (res.data.code === 200) {
                commit('SET_ADMIN_INFO', res.data.data);
            }
        },
        async adminLogout({commit}) {
            const res = await logout();
            if (res.data.code === 200) {
                commit('SET_IS_LOGIN', false);
                commit('SET_ADMIN_INFO', null);
                commit('SET_ADMIN_TOKEN', null);

            }
        },
    },
    plugins: [
        createPersistedState({
            // 自定义存储方式
            storage: window.localStorage,
            // 指定需要持久化的状态
            reducer(state) {
                return {
                    ADMIN_INFO: state.ADMIN_INFO,
                    IS_LOGIN: state.IS_LOGIN,
                    ADMIN_TOKEN: state.ADMIN_TOKEN
                }
            },
            // 自定义存储的key
            key: 'AdminStore',
        })
    ]
})

export default store