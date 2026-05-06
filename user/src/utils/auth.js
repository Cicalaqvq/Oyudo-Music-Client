import store from "../store/index.js";

export function checkLogin() {
    return store.state.USER_TOKEN && store.state.IS_LOGIN && store.state.USER_INFO;

}

export function removeLoginState() {
    store.commit("SET_USER_TOKEN", null);
    store.commit("SET_USER_INFO", null);
    store.commit("SET_IS_LOGIN", false);
    store.commit("SET_USER_FAVORITE_PLAYLISTS", []);
}