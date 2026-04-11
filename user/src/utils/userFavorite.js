// 切换收藏
import {checkLogin} from "./auth.js";
import {
    getPlaylistFavorite,
    getSongFavorite,
    likePlaylist,
    likeSong,
    unlikePlaylist,
    unlikeSong
} from "../api/manage.js";
import {message} from "./message.js";

export async function toggleFavoriteSong(store, songIds, isFavoriteOriginal) {
    if (!checkLogin(store)) {
        message("请先登录", "warning")
        store.commit('SET_SHOW_LOGIN_DIALOG', true)
        return
    }
    const isFavorite = !isFavoriteOriginal
    if (isFavorite) {
        const res = await likeSong(songIds)
        if (res.data.code === 200) {
            message('收藏成功')
            return true
        }
    } else {
        const res = await unlikeSong(songIds)
        if (res.data.code === 200) {
            message('取消收藏成功')
            return false
        }
    }

}

export async function toggleFavoritePlaylist(store, playlistIds, isFavoriteOriginal) {
    if (!checkLogin(store)) {
        message("请先登录", "warning")
        store.commit('SET_SHOW_LOGIN_DIALOG', true)
        return
    }
    const isFavorite = !isFavoriteOriginal
    if (isFavorite) {
        const res = await likePlaylist(playlistIds)
        if (res.data.code === 200) {
            message('收藏成功')
            await store.dispatch('getUserFavoritePlaylists')
            return true
        }
    } else {
        const res = await unlikePlaylist(playlistIds)
        if (res.data.code === 200) {
            message('取消收藏成功')
            await store.dispatch('getUserFavoritePlaylists')
            return false
        }
    }
}

export async function fetchFavoriteSongs(store, songIds) {
    if (!checkLogin(store)) {
        return []
    }
    const res = await getSongFavorite(songIds);
    if (res.data.code === 200) {
        return res.data.data.songs
    }
}

export async function fetchFavoritePlaylists(store, playlistIds) {
    if (!checkLogin(store)) {
        return []
    }
    const res = await getPlaylistFavorite(playlistIds);
    if (res.data.code === 200) {
        return res.data.data.playlists
    }
}