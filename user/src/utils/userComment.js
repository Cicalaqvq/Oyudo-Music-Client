import { checkLogin } from "./auth.js";
import { message } from "./message.js";
import {
  getCommentOfPlaylist,
  getCommentOfSong,
  likeComment,
  submitComment,
} from "../api/manage.js";

export async function publishComment(store, commentForm) {
  if (!checkLogin(store)) {
    message("请先登录", "warning");
    store.commit("SET_SHOW_LOGIN_DIALOG", true);
    return false;
  }
  const res = submitComment(commentForm);
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
    return res.data.data;
  }
}

export async function fetchSongComments(id) {
  const res = await getCommentOfSong(id);
  if (res.data.code === 200) {
    return res.data.data;
  }
}
