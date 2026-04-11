import { useCookies } from '@vueuse/integrations/useCookies'

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