// 切换收藏
import {checkLogin} from "./auth.js";
import {
    getPlaylistFavorite,
    getSongFavorite,
    likePlaylist,
    likeSong,
    unlikePlaylist,
    unlikeSong,
} from "../api/manage.js";
import {message} from "./message.js";
import store from "../store/index.js"

export async function toggleFavoriteSong(songs, isFavoriteOriginal) {
    if (!checkLogin()) {
        message("请先登录", "warning");
        store.commit("SET_SHOW_LOGIN_DIALOG", true);
        return;
    }
    const isFavorite = !isFavoriteOriginal;
    if (isFavorite) {
        const res = await likeSong(songs.map(song => song.id));
        if (res.data.code === 200) {
            message("收藏成功");
            return true;
        }
    } else {
        const res = await unlikeSong(songs.map(song => song.id));
        if (res.data.code === 200) {
            message("取消收藏成功");
            return false;
        }
    }
}

export async function toggleFavoritePlaylist(
    store,
    playlist,
    isFavoriteOriginal,
) {
    if (!checkLogin()) {
        message("请先登录", "warning");
        store.commit("SET_SHOW_LOGIN_DIALOG", true);
        return;
    }
    const isFavorite = !isFavoriteOriginal;
    if (isFavorite) {
        const res = await likePlaylist([playlist.id]);
        if (res.data.code === 200) {
            message("收藏成功");

            await store.dispatch("getUserFavoritePlaylists");
            return true;
        }
    } else {
        const res = await unlikePlaylist([playlist.id]);
        if (res.data.code === 200) {
            message("取消收藏成功");
            await store.dispatch("getUserFavoritePlaylists");
            return false;
        }
    }
}

export async function fetchFavoriteSongs() {
    if (!checkLogin()) {
        return [];
    }
    const res = await getSongFavorite();
    if (res.data.code === 200) {
        const songs = res.data.data.songs;
        if (songs.length > 0) {
            songs.forEach((song) => {
                song.duration =
                    Math.floor(song.duration / 60) +
                    ":" +
                    (Math.floor(song.duration % 60) < 10
                        ? "0" + Math.floor(song.duration % 60)
                        : Math.floor(song.duration % 60));
            });
        }
        return songs;
    }
    return [];

}

export async function fetchFavoritePlaylists() {
    if (!checkLogin()) {
        return [];
    }
    const res = await getPlaylistFavorite();
    if (res.data.code === 200) {
        return res.data.data.playlists;
    }
    return [];
}

export async function checkFavoriteSong(songId) {
    if (!checkLogin()) {
        return false;
    }
    const res = await getSongFavorite();
    if (res.data.code === 200) {
        const likedSongs = res.data.data.songs;
        return likedSongs.some((song) => song.id === songId);
    }
    return false;
}

export async function checkFavoritePlaylist(playlistId) {
    if (!checkLogin()) {
        return false;
    }
    const res = await getPlaylistFavorite();
    if (res.data.code === 200) {
        const likedPlaylists = res.data.data.playlists;
        return likedPlaylists.some((playlist) => playlist.id === playlistId);
    }
    return false;
}
