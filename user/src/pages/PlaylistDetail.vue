<template>
  <div class="like-detail">
    <div class="like-header">
      <el-icon class="back-icon" size="24" @click="back">
        <Back />
      </el-icon>
    </div>
    <!-- 歌单信息区域 -->
    <div class="playlist-info">
      <div class="like-avatar">
        <el-image
          :alt="playlistData.title"
          :preview-src-list="[playlistData.coverUrl]"
          :show-progress="true"
          :src="playlistData.coverUrl || defaultAvatar"
          style="width: 100%; height: 100%; object-fit: cover"
        />
      </div>
      <div class="like-content">
        <h1 class="like-name">{{ playlistData.title }}</h1>
        <div class="like-meta">
          <p class="meta-item">
            <el-tooltip
              v-if="playlistData.introduction"
              :content="playlistData.introduction"
              :disabled="isShowTooltip"
              :offset="-500"
              :popper-style="{ maxWidth: '550px' }"
              effect="light"
              placement="right"
            >
              <div
                class="playlist-description"
                @mouseenter="visibilityChange($event)"
              >
                {{ playlistData.introduction || "暂无简介" }}
              </div>
            </el-tooltip>
          </p>
          <p class="meta-item">
            <span class="playlist-data">{{ songs.length }}首歌曲</span>
          </p>
        </div>
        <div class="like-footer">
          <el-button
            class="play-button"
            style="width: 100px"
            type="primary"
            @click="playAll"
          >
            <span style="font-size: 12px">▷ 播放全部</span>
          </el-button>
          <el-button
            class="like-button"
            style="
              background-color: #d9d6d6;
              border-color: transparent;
              width: 40px;
            "
            type="primary"
            @click="toggleLikePlaylist"
          >
            <el-icon class="like-icon" size="24">
              <BiSolidHeart v-if="playlistData.isLike" style="color: red" />
              <BiHeart v-else />
            </el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 歌曲列表区域 -->
    <div class="tabs-section">
      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabChange">
        <el-tab-pane label="歌曲" name="songs">
          <div class="song-list">
            <el-scrollbar height="auto">
              <el-table
                v-if="songs.length"
                v-loading="tableLoading"
                :cellStyle="{ width: '100%', 'border-bottom': 'none' }"
                :data="songs"
                :header-cell-style="{ width: '100%', 'border-bottom': 'none' }"
                :row-class-name="rowClassName"
                :tooltip-options="{
                  placement: 'top',
                  offset: -20,
                  effect: 'light',
                }"
                element-loading-text="Loading..."
                height="480"
                style="width: 100%; font-size: 12px"
                @row-dblclick="playSong"
              >
                >
                <el-table-column
                  v-for="column in columns"
                  :key="column.prop"
                  :label="column.label"
                  :prop="column.prop"
                  :show-overflow-tooltip="true"
                  :width="column.width || 'auto'"
                >
                  <template #default="{ row }">
                    <template v-if="column.slot">
                      <div class="song-info">
                        <div class="song-cover">
                          <el-image
                            :preview-src-list="[row.coverUrl]"
                            :preview-teleported="true"
                            :show-progress="true"
                            :src="row.coverUrl"
                            alt="Song"
                            lazy
                            style="width: 45px; height: 45px"
                          >
                          </el-image>
                        </div>
                        <div class="song-title">{{ row.name }}</div>
                      </div>
                    </template>

                    <template v-else-if="column.prop === 'like'">
                      <el-icon class="control-icon" @click="toggleLikeSong">
                        <BiSolidHeart v-if="row.isLike" style="color: red" />
                        <BiHeart v-else />
                      </el-icon>
                    </template>
                    <template v-else-if="column.prop === 'download'">
                      <el-icon class="control-icon" @click="downloadSong(row)">
                        <BsCloudDownload />
                      </el-icon>
                    </template>
                    <template v-else>
                      {{ row[column.prop] }}
                    </template>
                  </template>
                </el-table-column>
              </el-table>

              <el-empty
                v-if="!songs.length && !tableLoading"
                :image-size="200"
                description="暂无数据"
              />
            </el-scrollbar>
          </div>
        </el-tab-pane>
        <el-tab-pane label="评论" name="comments">
          <div class="comments-section">
            <h3 class="section-title">评论 ({{ comments.length }})</h3>
            <div class="comment-input-wrapper">
              <el-input
                v-model="commentText"
                :maxlength="180"
                :rows="3"
                placeholder="说点什么吧"
                resize="none"
                type="textarea"
              />
              <div class="input-footer">
                <span class="char-count">{{ commentText.length }} / 180</span>
                <el-button size="small" type="primary" @click="submitComment"
                  >发布</el-button
                >
              </div>
            </div>

            <el-scrollbar height="300px">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment-item"
              >
                <el-image
                  :alt="comment.username"
                  :src="comment.userAvatar || '/defaultAvatar.png'"
                  class="comment-avatar"
                />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-user">{{ comment.username }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-footer">
                    <span class="comment-date">{{ comment.createTime }}</span>
                    <div class="comment-actions">
                      <el-icon
                        class="action-icon"
                        @click="likeComment(comment.id)"
                      >
                        <BiHeart />
                      </el-icon>
                      <span class="likes-count">{{ comment.likeCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty
                v-if="comments.length === 0"
                description="暂无评论，快来抢沙发~"
              />
            </el-scrollbar>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import { BiHeart, BiSolidHeart } from "vue-icons-plus/bi";
import { BsCloudDownload } from "vue-icons-plus/bs";
import { message } from "../utils/message.js";
import { useRoute } from "vue-router";
import {
  getCommentOfPlaylist,
  getPlaylistDetail,
  getSongsOfPlaylist,
} from "../api/manage.js";
import { formatDate } from "@vueuse/core";
import {
  fetchFavoritePlaylists,
  fetchFavoriteSongs,
  toggleFavoritePlaylist,
  toggleFavoriteSong,
} from "../utils/userFavorite.js";
import { fetchPlaylistComments } from "../utils/userComment.js";

const isShowTooltip = ref(false);
const routes = useRoute();
const store = useStore();
const tableLoading = ref(false);
const rowClassName = (row, index) => {
  row.index = index;
};
const activeTab = ref("songs");

// 歌手数据
const playlistData = reactive({
  id: routes.params.id,
});

const comments = ref([]);
const commentText = ref("");

// 歌曲列表
const songs = ref([]);

const columns = [
  {
    label: "标题",
    prop: "name",
    slot: true,
    width: 450,
  },
  {
    label: "歌手",
    prop: "artistName",
  },
  {
    label: "专辑",
    prop: "album",
    width: 300,
  },
  {
    label: "喜欢",
    prop: "like",
  },
  {
    label: "时长",
    prop: "duration",
  },
  {
    label: "下载",
    prop: "download",
    width: 100,
  },
];

const back = () => {
  window.history.back();
};

const likeComment = async (commentId) => {
  // TODO: 调用 API 喜欢评论
};

const handleTabChange = (tab) => {
  activeTab.value = tab.paneName;
  if (activeTab.value === "comments") {
    fetchComments();
  } else {
    fetchPlaylistSongs();
  }
};

const visibilityChange = (event) => {
  const ev = event.target;
  const evWeight = ev.scrollHeight;
  const contentWeight = ev.clientHeight;
  isShowTooltip.value = evWeight <= contentWeight;
};

const playAll = () => {
  store.commit("SET_TRACK_LIST", songs);
  store.commit("SET_PLAY_MODE", 0);
  store.commit("SET_CURRENT_SONG", songs.value[0]);
  store.commit("SET_PLAYING", true);
};

// 切换歌曲喜欢状态
const toggleLikeSong = async (row) => {
  row.isLike = await toggleFavoriteSong(store, [row.id], row.isLike);
};

// 切换歌单喜欢状态
const toggleLikePlaylist = async () => {
  playlistData.isLike = await toggleFavoritePlaylist(
    store,
    [playlistData.id],
    playlistData.isLike,
  );
};

// 下载歌曲
const downloadSong = async (row) => {
  message("正在创建下载链接....", "info");
  try {
    const response = await fetch(row.audioUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${row.name}.mp3`; // 自定义文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    message("链接创建成功，正在调用浏览器下载窗口...", "success");
  } catch (error) {
    message("下载失败", "error");
  }
};

// 获取歌单详情
const fetchPlaylistDetail = async () => {
  if (!store.state.SELECTED_PLAYLIST) {
    const res = await getPlaylistDetail(playlistData.id);
    if (res.data.code === 200) {
      store.commit("SET_SELECTED_PLAYLIST", res.data.data);
    }
  }
  playlistData.title = store.state.SELECTED_PLAYLIST.title;
  playlistData.coverUrl =
    store.state.SELECTED_PLAYLIST.coverUrl || defaultAvatar;
  playlistData.introduction = store.state.SELECTED_PLAYLIST.introduction;
  playlistData.style = store.state.SELECTED_PLAYLIST.style;
  const favoritePlaylist = await fetchFavoritePlaylists(store, [
    playlistData.id,
  ]);
  playlistData.isLike = favoritePlaylist.length > 0;
};

// 获取歌单歌曲列表
const fetchPlaylistSongs = async () => {
  tableLoading.value = true;
  const res = await getSongsOfPlaylist(playlistData.id);
  if (res.data.code === 200) {
    songs.value = res.data.data;
    songs.value.forEach((song) => {
      song.duration =
        Math.floor(song.duration / 60) +
        ":" +
        (Math.floor(song.duration % 60) < 10
          ? "0" + Math.floor(song.duration % 60)
          : Math.floor(song.duration % 60));
    });
  }
  await fetchLikeSongs();
  tableLoading.value = false;
};

// 获取歌单评论
const fetchComments = async () => {
  comments.value = (await fetchPlaylistComments(playlistData.id)) || [];
  if (comments.value.length > 0) {
    comments.value.forEach((comment) => {
      comment.createTime = formatDate(
        new Date(comment.createTime),
        "YYYY年MM月DD日 HH:mm:ss",
      );
    });
  }
};

// 获取用户收藏的歌单歌曲
const fetchLikeSongs = async () => {
  const favoriteSongs = await fetchFavoriteSongs(store, []);
  songs.value.forEach((song) => {
    song.isLike =
      favoriteSongs.find((favoriteSong) => favoriteSong.id === song.id) ||
      false;
  });
};

// 播放歌曲
const playSong = (row) => {
  store.commit("SET_CURRENT_SONG", row);
  store.commit("ADD_SONG_TO_TRACK_LIST", row);
  store.commit("SET_PLAYING", true);
};

const initData = async () => {
  await fetchPlaylistDetail();
  await fetchPlaylistSongs();
};

onMounted(() => {
  initData();
});
</script>

<style scoped>
.like-header {
  display: flex;
  margin-bottom: 10px;
}

.tabs-section {
  margin-top: 10px;
}

.back-icon {
  cursor: pointer;
  padding: 0;
}

.like-detail {
  min-height: calc(100vh - 120px);
}

/* 歌手信息区域 */
.playlist-info {
  display: flex;
  gap: 30px;
}

.like-avatar {
  flex-shrink: 0;
  width: 200px;
  height: 200px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.like-content {
  flex: 1;
}

.like-name {
  font-size: 30px;
  font-weight: bold;
  color: #333;
}

.like-meta {
  margin-bottom: 15px;
}

.like-footer {
  display: flex;
  align-items: center;
  font-size: 12px;
  position: relative;
  padding-top: 40px;
}

.meta-item {
  display: block;
  font-size: 13px;
  color: #666;
  padding-top: 10px;
  max-height: 105px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-item .label {
  color: #999;
}

.meta-item .playlist-data {
  display: inline-block;
  font-size: 12px;
  color: #999;
}

.playlist-description {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  height: fit-content;
  max-height: 90px;
  margin-top: 3px;
}

/* 歌曲列表区域 */
.song-list {
  height: 500px;
  padding-top: 0;

  .title {
    color: #333;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .sub-title {
    font-size: 13px;
    margin-bottom: 10px;
    color: #666;
  }
}

.song-info {
  display: flex;
  align-items: center;
  gap: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.song-cover {
  display: flex;
  align-items: center;
  justify-content: left;
}

.song-title {
  display: block;
  align-items: center;
  font-size: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
}

:deep(.el-table__inner-wrapper):before {
  background-color: transparent;
  position: relative;
}

.control-icon {
  font-size: 20px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.control-icon:hover {
  color: #333;
}

.comments-section {
  flex: 1;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.comment-input-wrapper {
  margin-bottom: 10px;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-count {
  font-size: 12px;
  color: #999;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  margin-bottom: 8px;
  display: flex;
  justify-content: left;
}

.comment-user {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.comment-text {
  font-size: 14px;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.5;
  text-align: left;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-date {
  font-size: 12px;
  color: #999;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 20px;
}

.action-icon {
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.action-icon:hover {
  color: #ff69b4;
}

.likes-count {
  font-size: 12px;
  color: #999;
}
</style>
