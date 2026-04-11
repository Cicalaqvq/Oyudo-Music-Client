import {useCookies} from '@vueuse/integrations/useCookies'

const cookie = useCookies()

const tokenKey = 'token'

export function setCookies(value) {
    return cookie.set(tokenKey, value)
}

export function getCookies() {
    return cookie.get(tokenKey)
}

export function removeCookies() {
    return cookie.remove(tokenKey)
}

export function checkLogin(store) {
    if (!store.state.USER_INFO) {
        return false
    }
    return true
}

export function removeLoginState(store) {
    store.commit('SET_USER_INFO', null)
    store.commit('SET_IS_LOGIN', false)
}