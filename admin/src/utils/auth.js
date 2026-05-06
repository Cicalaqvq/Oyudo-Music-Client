import store from "../store/index.js";

export function removeLoginState() {
    store.commit("SET_TOKEN", null);
    store.commit("SET_ADMIN_INFO", null);
    store.commit("SET_IS_LOGIN", false);
}