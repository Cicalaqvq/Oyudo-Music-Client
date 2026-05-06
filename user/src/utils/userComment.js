import {checkLogin} from "./auth.js";
import {message} from "./message.js";
import {addComment, getComments, getCommentsByUser, likeComment,} from "../api/manage.js";
import {formatDate} from "@vueuse/core";
import store from "../store/index.js";

export async function publishComment(commentForm) {
    if (!checkLogin()) {
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

export async function toggleFavoriteComment(commentId) {
    if (!checkLogin()) {
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

export async function fetchPlaylistCommentsByPlaylistId(id) {
    const res = await getComments({"type": 1, "playlistId": id});
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

export async function fetchSongCommentsBySongId(id) {
    const res = await getComments({"type": 0, "songId": id});
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

export async function searchComments(searchForm) {
    const res = await getComments(searchForm);
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

export async function searchCommentsByUser(searchForm) {
    const res = await getCommentsByUser(searchForm);
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
