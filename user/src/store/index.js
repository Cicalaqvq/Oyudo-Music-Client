import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import {
  getPlaylistFavorite,
  getUserInfo,
  login,
  logout,
  updateUserInfo,
} from "../api/manage.js";
import { message } from "../utils/message.js";

// 创建一个新的 store 实例
const store = createStore({
  state() {
    return {
      // 需要持久化的状态

      // 用户相关UserStore
      USER_INFO: null,
      USER_FAVORITE_PLAYLISTS: [],
      IS_LOGIN: false,

      // 播放相关AudioStore
      TRACK_LIST: [],
      PLAYED_QUEUE: [],
      PLAY_MODE: 0, // 0:顺序播放 1:随机播放 2:单曲循环
      CURRENT_SONG: null,
      IS_PLAYING: false,
      VOLUME: 50,

      // 无需持久化的状态
      SHOW_LOGIN_DIALOG: false,
      SELECTED_ARTIST: null,
      SELECTED_PLAYLIST: null,
    };
  },
  mutations: {
    TRACK_LIST_IS_EMPTY(state) {
      if (!state.TRACK_LIST || state.TRACK_LIST.length === 0) {
        throw new Error("播放列表为空");
      }
    },
    QUEUE_IS_EMPTY(state) {
      if (!state.PLAYED_QUEUE || state.PLAYED_QUEUE.length === 0) {
        throw new Error("这是您播放的第一首歌曲哦");
      }
    },
    ADD_SONG_TO_TRACK_LIST(state, song) {
      if (!Array.isArray(state.TRACK_LIST)) {
        state.TRACK_LIST = [];
      }
      if (!state.TRACK_LIST.find((s) => s.id === song.id)) {
        state.TRACK_LIST.push(song);
      }
    },
    SET_TRACK_LIST(state, trackList) {
      state.TRACK_LIST = trackList;
    },
    SET_CURRENT_SONG(state, song) {
      state.CURRENT_SONG = song;
      if (!Array.isArray(state.PLAYED_QUEUE)) {
        state.PLAYED_QUEUE = [];
      }
      if (!state.PLAYED_QUEUE.find((s) => s.id === song.id)) {
        state.PLAYED_QUEUE.push(song);
      }
    },
    SET_NEXT_SONG(state) {
      // 1. 判断播放列表是否为空 （不用了）
      /*            if (!state.USER_PLAYLIST || state.USER_PLAYLIST.length === 0) {
                            message("播放列表为空", "error")
                            throw new Error("播放列表为空")
                        }*/
      // 2. 获取当前播放歌曲的索引
      const currentSong = state.CURRENT_SONG;
      const index = state.TRACK_LIST.indexOf(currentSong);
      // 3. 保存进已经播放的列表中
      if (!Array.isArray(state.PLAYED_QUEUE)) {
        state.PLAYED_QUEUE = [];
      }
      if (
        !state.PLAYED_QUEUE.find((s) => s.id === currentSong.id) &&
        state.PLAYED_QUEUE.length > 0
      ) {
        state.PLAYED_QUEUE.push(currentSong);
      }
      // 4. 判断播放方式
      switch (state.PLAY_MODE) {
        // 4.1 顺序播放
        case 0:
          // 判断是否是最后一首歌曲
          if (index === state.TRACK_LIST.length - 1) {
            // 播放第一首歌曲
            state.CURRENT_SONG = state.TRACK_LIST[0];
          } else {
            // 播放下一首歌曲
            state.CURRENT_SONG = state.TRACK_LIST[index + 1];
          }
          break;
        // 4.2 随机播放
        case 1:
          let randomIndex = Math.floor(Math.random() * state.TRACK_LIST.length);
          state.CURRENT_SONG = state.TRACK_LIST[randomIndex];
          break;
        default:
          break;
      }
      // 4. 设置播放状态
      state.IS_PLAYING = true;
    },
    SET_PREV_SONG(state) {
      state.CURRENT_SONG = state.PLAYED_QUEUE.pop();
      state.IS_PLAYING = true;
    },
    SET_PLAYING(state, isPlaying) {
      state.IS_PLAYING = isPlaying;
    },
    SET_PLAY_MODE(state, mode) {
      state.PLAY_MODE = mode;
    },
    SET_SELECTED_ARTIST(state, artist) {
      state.SELECTED_ARTIST = artist;
    },
    SET_SELECTED_PLAYLIST(state, playlist) {
      state.SELECTED_PLAYLIST = playlist;
    },
    SET_USER_INFO(state, userInfo) {
      state.USER_INFO = userInfo;
    },
    SET_IS_LOGIN(state, isLogin) {
      state.IS_LOGIN = isLogin;
    },
    SET_SHOW_LOGIN_DIALOG(state, isShow) {
      state.SHOW_LOGIN_DIALOG = isShow;
    },
    SET_USER_FAVORITE_PLAYLISTS(state, playlist) {
      state.USER_FAVORITE_PLAYLISTS = playlist;
    },
    SET_VOLUME(state, volume) {
      state.VOLUME = volume;
    },
    DELETE_SONG_FROM_TRACK_LIST(state, song) {
      state.TRACK_LIST = state.TRACK_LIST.filter((item) => item.id !== song.id);
    },
  },

  actions: {
    async userLogin({ commit }, loginForm) {
      await login(loginForm).then(async (res) => {
        if (res.data.code === 200) {
          commit("SET_IS_LOGIN", true);
          message("登录成功");
        }
      });
    },
    async userLogout({ commit }) {
      await logout().then((res) => {
        if (res.data.code === 200) {
          commit("SET_USER_INFO", null);
          commit("SET_IS_LOGIN", false);
          message("已退出登录");
        }
      });
    },
    async getUserFavoritePlaylists({ commit }) {
      await getPlaylistFavorite(null).then((res) => {
        if (res.data.code === 200) {
          commit("SET_USER_FAVORITE_PLAYLISTS", res.data.data.playlists);
        }
      });
    },
    async getUserInfo({ commit }) {
      const res = await getUserInfo();
      if (res.data.code === 200) {
        commit("SET_USER_INFO", res.data.data);
      }
    },
    async updateUserInfo({ commit }, userForm) {
      const res = await updateUserInfo(userForm);
      if (res.data.code === 200) {
        commit("SET_USER_INFO", res.data.data);
        message("更新成功");
      }
    },
  },
  plugins: [
    createPersistedState({
      // 自定义存储方式
      storage: window.localStorage,
      // 指定需要持久化的状态
      reducer(state) {
        return {
          TRACK_LIST: state.TRACK_LIST,
          PLAYED_QUEUE: state.PLAYED_QUEUE,
          PLAY_MODE: state.PLAY_MODE,
          CURRENT_SONG: state.CURRENT_SONG,
          IS_PLAYING: state.IS_PLAYING,
          VOLUME: state.VOLUME,
        };
      },
      // 自定义存储的 key
      key: "AudioStore",
    }),
    createPersistedState({
      // 自定义存储方式
      storage: window.localStorage,
      // 忽略指定的状态
      reducer(state) {
        return {
          USER_INFO: state.USER_INFO,
          USER_FAVORITE_PLAYLISTS: state.USER_FAVORITE_PLAYLISTS,
          IS_LOGIN: state.IS_LOGIN,
        };
      },
      // 自定义存储的 key
      key: "UserStore",
    }),
  ],
});

export default store;
