<template>
  <el-card :body-style="{ padding: '10px 15px' }" class="player-card">
    <div class="player-container">
      <!-- 左侧：歌曲信息 -->
      <div class="song-info">
        <el-image
            :src="localCurrentSong.coverUrl || '/defaultSongCover.png'"
            alt="songCover"
            class="song-cover"
            @click="showSongDetail"
        />
        <div class="song-text">
          <el-tooltip
              :content="localCurrentSong.name"
              :disabled="!isShowTooltip"
              effect="light"
              placement="top"
              trigger="hover"
          >
            <div class="song-title" @mouseenter="visibilityChange($event)">
              {{ localCurrentSong.name || "暂未播放歌曲" }}
            </div>
          </el-tooltip>

          <el-tooltip
              :content="localCurrentSong.artistName"
              :disabled="!isShowTooltip"
              effect="light"
              placement="right"
              trigger="hover"
          >
            <div class="song-artist" @mouseenter="visibilityChange($event)">
              {{ localCurrentSong.artistName || "Various Artists" }}
            </div>
          </el-tooltip>
        </div>
      </div>

      <!-- 中间：播放控制 -->
      <div class="player-controls">
        <div class="control-buttons">
          <el-icon class="control-icon" size="35" @click="previousSong">
            <BiSkipPrevious/>
          </el-icon>
          <div class="play-btn" @click="togglePlay">
            <el-icon v-if="!localIsPlaying">
              <BiPlay/>
            </el-icon>
            <el-icon v-else>
              <BiPause/>
            </el-icon>
          </div>
          <el-icon class="control-icon" size="35" @click="nextSong">
            <BiSkipNext/>
          </el-icon>
          <el-icon class="control-icon" @click="toggleFavorite">
            <BiSolidHeart v-if="isFavorite" style="color: red"/>
            <BiHeart v-else/>
          </el-icon>
        </div>
        <div class="progress-container">
          <span class="time-text">{{ formatTime(currentTime) }}</span>
          <el-slider
              v-model="currentTime"
              :max="duration"
              :show-tooltip="false"
              :step="1"
              class="progress-slider"
              @change="onProgressChange"
          />
          <span class="time-text">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- 右侧：音量和播放列表 -->
      <div class="right-controls">
        <el-tooltip :content="showPlayMode()" effect="light">
          <el-icon
              v-if="localPlayMode === 0"
              class="control-icon"
              @click="onPlayModeChange"
          >
            <AiOutlineUnorderedList/>
          </el-icon>
          <el-icon
              v-if="localPlayMode === 1"
              class="control-icon"
              @click="onPlayModeChange"
          >
            <LiaRandomSolid/>
          </el-icon>
          <el-icon
              v-if="localPlayMode === 2"
              class="control-icon"
              @click="onPlayModeChange"
          >
            <IpPlayCycle/>
          </el-icon>
        </el-tooltip>
        <div class="volume-control">
          <el-tooltip
              :content="localVolume ? `点击静音` : '点击取消静音'"
              effect="light"
          >
            <el-icon v-if="localVolume > 0" class="control-icon" @click="mute">
              <BiSolidVolumeFull/>
            </el-icon>
            <el-icon v-else class="control-icon" @click="resetLastVolume">
              <BiSolidVolumeMute/>
            </el-icon>
          </el-tooltip>
          <el-slider
              v-model="store.state.VOLUME"
              :max="100"
              :step="1"
              class="volume-slider"
              height="10"
              @input="onVolumeChange"
          />
        </div>
        <!-- 播放列表 --->
        <el-popover placement="top" trigger="click" width="400">
          <template #reference>
            <el-icon class="control-icon">
              <RiPlayList2Fill/>
            </el-icon>
          </template>
          <template #default>
            <div class="popover-header">
              <div class="popover-title">播放列表</div>
              <div>
                <el-popover
                    :visible="popoverVisible"
                    :width="180"
                    placement="top"
                >
                  <p>确定要删除播放列表中的所有歌曲吗？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="small" text @click="popoverVisible = false"
                    >取消
                    </el-button
                    >
                    <el-button
                        size="small"
                        type="primary"
                        @click="deleteUserPlaylist"
                    >
                      确定
                    </el-button>
                  </div>
                  <template #reference>
                    <el-icon
                        class="control-icon"
                        @click="popoverVisible = true"
                    >
                      <Delete/>
                    </el-icon>
                  </template>
                </el-popover>
              </div>
            </div>
            <el-scrollbar height="500px">
              <div
                  v-for="song in store.state.TRACK_LIST"
                  v-if="store.state.TRACK_LIST.length"
                  :key="song.id"
                  :class="{ 'song-item_active': song.id === localCurrentSong.id }"
                  class="song-item"
              >
                <el-image
                    :alt="song.name"
                    :src="song.coverUrl"
                    class="song-item-cover"
                    style="width: 64px; height: 64px"
                    @click="playSong(song)"
                />
                <div class="song-item-info">
                  <div class="song-item-title">{{ song.name }}</div>
                  <div class="song-item-artist">{{ song.artistName }}</div>
                </div>
                <div class="song-item-duration">{{ song.duration }}</div>
                <div class="song-item-delete">
                  <el-icon class="control-icon" @click="deleteSong(song)">
                    <Delete/>
                  </el-icon>
                </div>
              </div>
              <el-empty v-else description="空空如也，先去选择歌曲吧"/>
            </el-scrollbar>
          </template>
        </el-popover>
      </div>
    </div>

    <!-- 隐藏的 audio 元素 -->
    <audio
        ref="audioRef"
        :src="localCurrentSong.audioUrl"
        @ended="onEnded"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
    />

    <!-- 歌曲详情抽屉 -->
    <el-drawer
        v-model="drawerVisible"
        :withHeader="false"
        direction="btt"
        size="100%"
    >
      <SongDetail
          :comments="comments"
          :currentTime="currentTime"
          :duration="duration"
          :isFavorite="isFavorite"
          @back="drawerVisible = false"
          @next="nextSong"
          @pause="togglePlay"
          @play="togglePlay"
          @previous="previousSong"
          @on-progress-change="onProgressChange"
          @toggle-favorite="toggleFavorite"
          @fetch-comments="fetchComments"
      />

      /> />
    </el-drawer>
  </el-card>
</template>

<script setup>
import {computed, nextTick, ref, watchEffect} from "vue";
import {Delete} from "@element-plus/icons-vue";
import {
  BiHeart,
  BiPause,
  BiPlay,
  BiSkipNext,
  BiSkipPrevious,
  BiSolidHeart,
  BiSolidVolumeFull,
  BiSolidVolumeMute,
} from "vue-icons-plus/bi";
import {AiOutlineUnorderedList} from "vue-icons-plus/ai";
import {RiPlayList2Fill} from "vue-icons-plus/ri";
import {IpPlayCycle} from "vue-icons-plus/ip";
import {LiaRandomSolid} from "vue-icons-plus/lia";
import {useStore} from "vuex";
import {message} from "../../utils/message.js";
import SongDetail from "./SongDetail.vue";
import {fetchFavoriteSongs, toggleFavoriteSong,} from "../../utils/userFavorite.js";
import {fetchSongComments} from "../../utils/userComment.js";

const store = useStore();
const popoverVisible = ref(false);
const drawerVisible = ref(false);
const isShowTooltip = ref(false);
// 当前歌曲信息
const localCurrentSong = computed(() => store.state.CURRENT_SONG || {});

// 播放状态
const localIsPlaying = computed(() => store.state.IS_PLAYING || false);

// 当前播放模式
const localPlayMode = computed(() => store.state.PLAY_MODE || 0);

const isFavorite = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const comments = ref([]);
const localVolume = computed(() => store.state.VOLUME);
let lastVolume = localVolume.value;
const audioRef = ref(null);

const mute = () => {
  lastVolume = localVolume.value;
  store.commit("SET_VOLUME", 0);
  if (audioRef.value) {
    audioRef.value.volume = 0;
  }
};

const resetLastVolume = () => {
  store.commit("SET_VOLUME", lastVolume);
  if (audioRef.value) {
    audioRef.value.volume = lastVolume / 100;
  }
};

const visibilityChange = (event) => {
  const ev = event.target;
  const evWeight = ev.scrollWidth;
  const contentWeight = ev.clientWidth;
  isShowTooltip.value = evWeight > contentWeight;
};

// 播放模式切换
const onPlayModeChange = () => {
  store.commit("SET_PLAY_MODE", (localPlayMode.value + 1) % 3);
};

// 显示播放模式名称
const showPlayMode = () => {
  switch (localPlayMode.value) {
    case 0:
      return "顺序播放";
    case 1:
      return "随机播放";
    case 2:
      return "单曲循环";
  }
};

// 显示歌曲详情
const showSongDetail = () => {
  const currentSong = store.state.CURRENT_SONG;
  if (currentSong) {
    drawerVisible.value = true;
    fetchComments();
  } else {
    message("请选择歌曲", "error");
  }
};

const fetchComments = async () => {
  comments.value = await fetchSongComments(localCurrentSong.value.id) || [];
};

// 播放歌曲
const playSong = (song) => {
  if (!song.audioUrl) {
    message("歌曲暂无音频，已自动删除", "error");
    store.commit("DELETE_SONG_FROM_TRACK_LIST", song);
    return;
  }
  store.commit("SET_CURRENT_SONG", song);
  store.commit("ADD_SONG_TO_TRACK_LIST", song);
  store.commit("SET_PLAYING", true);
};

// 删除播放列表
const deleteUserPlaylist = () => {
  popoverVisible.value = false;
  store.commit("SET_TRACK_LIST", []);
  message("播放列表已清空");
};

// 将歌曲从播放列表中删除
const deleteSong = (song) => {
  store.commit("DELETE_SONG_FROM_TRACK_LIST", song);
  message("已从播放列表中删除");
};

// 切换播放/暂停
const togglePlay = () => {
  if (!store.state.CURRENT_SONG) {
    message("请选择歌曲", "error");
    store.commit("SET_PLAYING", false);
    return;
  }
  if (audioRef.value) {
    if (localIsPlaying.value) {
      audioRef.value.pause();
    } else {
      audioRef.value.play();
    }
    store.commit("SET_PLAYING", !localIsPlaying.value);
  }
};

// 上一首
const previousSong = () => {
  try {
    store.commit("TRACK_LIST_IS_EMPTY");
    store.commit("QUEUE_IS_EMPTY");
  } catch (e) {
    message(e.message, "error");
    return;
  }
  if (!localPlayMode.value !== 2) {
    store.commit("SET_PREV_SONG");
    fetchFavorite();
  } else {
    audioRef.value.currentTime = 0;
  }
};

// 下一首
const nextSong = () => {
  try {
    store.commit("TRACK_LIST_IS_EMPTY");
  } catch (e) {
    message(e.message, "error");
    return;
  }
  if (localPlayMode.value !== 2) {
    store.commit("SET_NEXT_SONG");
    fetchFavorite();
  }
  audioRef.value.currentTime = 0;
};

// 切换收藏
const toggleFavorite = async () => {
  isFavorite.value = await toggleFavoriteSong(
      store,
      [store.state.CURRENT_SONG.id],
      isFavorite.value,
  );
};

const fetchFavorite = async () => {
  const flag = await fetchFavoriteSongs(store, [store.state.CURRENT_SONG.id]);
  isFavorite.value = flag.length > 0;
};

// 音量改变
const onVolumeChange = (value) => {
  store.commit("SET_VOLUME", value);
  if (audioRef.value) {
    audioRef.value.volume = value / 100;
  }
};

// 时间更新
const onTimeUpdate = (e) => {
  currentTime.value = e.target.currentTime;
};

// 元数据加载完成
const onLoadedMetadata = (e) => {
  duration.value = e.target.duration;
  fetchFavorite();
};

// 播放结束
const onEnded = () => {
  try {
    store.commit("TRACK_LIST_IS_EMPTY");
  } catch (e) {
    message(e.message + "，结束播放", "error");
    store.commit("SET_PLAYING", false);
    return;
  }
  nextSong();
};

// 进度条改变
const onProgressChange = (value) => {
  if (audioRef.value) {
    audioRef.value.currentTime = value;
  }
};

// 格式化时间
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

watchEffect(() => {
  const isPlaying = localIsPlaying.value;
  const song = localCurrentSong.value;
  const volume = localVolume.value;
  if (isPlaying && song && song.id && audioRef.value) {
    if (!song.audioUrl) {
      message("该歌曲暂无音频，已停止播放", "error");
      store.state.IS_PLAYING = false;
      return;
    }
    nextTick(() => {
      const playPromise = audioRef.value.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioRef.value.volume = volume / 100;
        });
        playPromise.catch((error) => {
          // 忽略 AbortError
          if (error.name === "NotAllowedError") {
            message("上一次播放时意外退出，请手动播放", "warning");
          } else if (error.name !== "AbortError") {
            // 只报告非 AbortError 的错误
            message("音频播放异常，请联系管理员处理", "error");
            console.error("音频播放错误:", error);
          }
          store.state.IS_PLAYING = false;
        });
      }
    });
  } else if (audioRef.value && !isPlaying) {
    audioRef.value.pause();
  }
});

</script>

<style scoped>
.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popover-title {
  font-size: 16px;
  font-weight: bold;
}

.song-item-delete {
  opacity: 0;
  transition: opacity 0.2s;
}

.song-item {
  display: flex;
  justify-content: left;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
  overflow: hidden;
  white-space: nowrap;
  max-width: 400px;
}

.song-item_active {
  background-color: #cde5f8;
  cursor: pointer;
}

.song-item-cover {
  cursor: pointer;
  border-radius: 16px;
  position: relative;
  transition: background-color 0.2s;
  margin-right: 30px;
}

.song-item:hover .song-item-delete {
  opacity: 1;
}

.song-item-info {
  flex: 1;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;

  .song-item-artist {
    margin-top: 10px;
    font-size: 12px;
    color: #666;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .song-item-title {
    display: inline-block;
    font-size: 14px;
    color: #333;
    font-weight: 500;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.song-item-duration {
  font-size: 12px;
  color: #999;
  min-width: 45px;
  text-align: right;
}

.song-item:hover {
  background-color: #dadde0;
}

.song-item:hover .song-item-cover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
}

.song-item:hover .song-item-cover::after {
  content: "▷";
  position: absolute;
  top: 46%;
  left: 56%;
  transform: translate(-50%, -50%);
  font-size: 30px;
  color: white;
  z-index: 1;
}

.player-card {
  border-radius: 0;
  border: none;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
}

.player-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  height: 50px;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 500px;

  .song-cover {
    width: 50px;
    height: 50px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
    cursor: pointer;
  }

  .song-text {
    gap: 4px;
    margin-left: 30px;
    white-space: nowrap;
    overflow: hidden;

    .song-title {
      display: inline-block;
      font-size: 16px;
      font-weight: 800;
      color: #333;
      width: 100%;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .song-artist {
      font-size: 12px;
      color: #666;
      width: 100%;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}

.player-controls {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 50px;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
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

.play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.play-btn:hover {
  background-color: #66b1ff;
}

.play-btn .el-icon {
  color: white;
  font-size: 30px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 600px;
}

.time-text {
  font-size: 12px;
  color: #666;
  min-width: 45px;
  text-align: center;
}

.progress-slider {
  flex: 1;
  width: 300px;
}

.progress-slider :deep(.el-slider__runway) {
  height: 4px;
}

.progress-slider :deep(.el-slider__bar) {
  height: 4px;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 300px;
  justify-content: flex-end;
  padding-right: 20px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-slider {
  margin-left: 20px;
  width: 120px;
}

.volume-slider :deep(.el-slider__runway) {
  height: 4px;
}

.volume-slider :deep(.el-slider__bar) {
  height: 4px;
}

:deep(.el-drawer__body) {
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
