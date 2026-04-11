import {createStore} from 'vuex'
import {getInfo, getUserList, login} from "../api/manage.js";
import {removeCookies, setCookies} from "../utils/auth.js";
import {notification} from "../utils/message.js";
import createPersistedState from 'vuex-persistedstate';

// 创建一个新的 store 实例
const store = createStore({
    state() {
        return {
            adminInfo: {},

        }
    },
    mutations: {
        setAdminInfo(state, adminInfo) {
            state.adminInfo = adminInfo
        },

    },
    actions: {
        login(state, formData) {
            return new Promise((resolve, reject) => {
                login(formData.username, formData.password).then(res => {
                    if(res.data.code === 200)
                    {
                        setCookies(res.data.data)
                        store.dispatch("getAdminInfo")
                        notification("登录成功", "欢迎回来！", "success")
                        resolve(res.data)
                    }
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getAdminInfo(state) {
            return new Promise((resolve, reject) => {
                getInfo().then(res => {
                    store.commit('setAdminInfo', res.data.data)
                    resolve(res.data)
                }).catch(err => {
                    removeCookies()
                    reject(err)
                })
            })
        },
    },
    plugins: [
        createPersistedState({
            // 自定义存储方式
            storage: window.sessionStorage,
            // 指定需要持久化的状态
            reducer(state) {
                return {
                    adminInfo: state.adminInfo,
                }
            },
            // 自定义存储的key
            key: 'oyudo-music-state',
            // 只在特定mutation后持久化
            filter(mutation) {
                return ['setAdminInfo'].includes(mutation.type)
            },
        })
    ]
})

export default store