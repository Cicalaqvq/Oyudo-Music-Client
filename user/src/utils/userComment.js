import {checkLogin} from "./auth.js";
import {message} from "./message.js";
import {addComment, getCommentOfPlaylist, getCommentOfSong, likeComment,} from "../api/manage.js";
import {formatDate} from "@vueuse/core";

export async function publishComment(store, commentForm) {
    if (!checkLogin(store)) {
        message("请先登录", "warning");
        store.commit("SET_SHOW_LOGIN_DIALOG", true);
        return false;
    }
    const res = await addComment(commentForm);
    if (res.data.code === 200) {
        message("评论发布成功");
        return true;
    }
    return false;
}

export async function toggleFavoriteComment(store, commentId) {
    if (!checkLogin(store)) {
        message("请先登录", "warning");
        store.commit("SET_SHOW_LOGIN_DIALOG", true);
        return false;
    }
    const res = await likeComment(commentId);
    if (res.data.code === 200) {
        message("点赞成功");
        return true;
    }
}

export async function fetchPlaylistComments(id) {
    const res = await getCommentOfPlaylist(id);
    if (res.data.code === 200) {
        const data = res.data.data;
        if (data.length > 0) {
            data.forEach(item => {
                item.createTime = formatDate(new Date(item.createTime), "YYYY年MM月DD日 HH:mm:ss");
            })
        }
        return data;
    }
}

export async function fetchSongComments(id) {
    const res = await getCommentOfSong(id);
    if (res.data.code === 200) {
        const data = res.data.data;
        if (data.length > 0) {
            data.forEach(item => {
                item.createTime = formatDate(new Date(item.createTime), "YYYY年MM月DD日 HH:mm:ss");
            })
        }
        return data;
    }
}
