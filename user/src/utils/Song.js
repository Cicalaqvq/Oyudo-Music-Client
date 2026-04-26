import store from "../store/index.js"
import {message} from "./message.js";
import {addScoreToSong} from "../api/manage.js";

export async function playSongs(songs) {
    if (!songs.length) {
        message("请先收藏一些歌曲", "info");
        return;
    }
    const song = songs[0];
    if (songs.length === 1) {
        store.commit("ADD_SONG_TO_TRACK_LIST", song);
    } else {
        store.commit("SET_TRACK_LIST", songs);
    }
    store.commit("SET_PLAY_MODE", 0);
    store.commit("SET_CURRENT_SONG", song);
    store.commit("SET_PLAYING", true);
    playsong(song.id);
}

// 当歌曲进度大于75%时，认为该用户喜欢该歌曲
export function handle75Percent(songId) {
    addScoreToSong(songId, 0.5);
}

// 当前播放歌曲的进度小于25%时，认为该用户不喜欢该歌曲
export function handle25Percent(songId) {
    addScoreToSong(songId, -0.5)
}

const playsong = (songId) => {
    addScoreToSong(songId, 0.5);
};

export async function download(song) {
    message("正在创建下载链接....", "info");
    try {
        const response = await fetch(song.audioUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${song.name}.mp3`; // 自定义文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        message("链接创建成功，正在调用浏览器下载窗口...", "success");
        await likeSong(song);
    } catch (error) {
        message("下载失败", "error");
    }
}
