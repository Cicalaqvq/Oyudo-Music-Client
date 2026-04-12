<template>
  <div class="recommend-container">
    <!-- 轮播图区域 -->
    <div class="banner-section">
      <el-carousel
        v-if="banners.length"
        :interval="4000"
        arrow="always"
        autoplay
        height="auto"
        type="card"
      >
        <el-carousel-item
          v-for="banner in banners"
          :key="banner.id"
          style="height: 300px"
        >
          <div class="banner-item">
            <el-image :src="banner.bannerUrl" class="banner-image" lazy />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 歌单推荐 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">今日为你推荐</h2>
        <div class="section-more" @click="viewMore">
          <el-icon>
            <Share />
          </el-icon>
          <span>更多</span>
        </div>
      </div>
      <div class="playlist-grid">
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="playlist-item"
          @click="showPlaylistDetail(playlist)"
        >
          <div class="playlist-cover">
            <el-image :src="playlist.coverUrl" alt="封面" />
            <div class="play-btn" />
          </div>
          <div class="playlist-info">
            <div class="like-name">{{ playlist.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 歌曲推荐 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">相似推荐</h2>
        <div class="section-more" @click="refreshRecommend">
          <el-icon>
            <Refresh />
          </el-icon>
          <span>刷新</span>
        </div>
      </div>
      <div class="song-list">
        <div class="songs-column">
          <div
            v-for="song in songsLeft"
            :key="song.id"
            class="song-item"
            @click="playSong(song)"
          >
            <div class="song-left">
              <el-image
                :alt="song.name"
                :src="song.coverUrl"
                class="song-cover"
                lazy
              />
              <div class="song-info">
                <div class="song-title">{{ song.name }}</div>
                <div class="song-artist">{{ song.artistName }}</div>
              </div>
            </div>
            <div class="song-duration">{{ song.duration }}</div>
          </div>
        </div>
        <div class="songs-column">
          <div
            v-for="song in songsRight"
            :key="song.id"
            class="song-item"
            @click="playSong(song)"
          >
            <div class="song-left">
              <el-image
                :alt="song.name"
                :src="song.coverUrl"
                class="song-cover"
                lazy
              />
              <div class="song-info">
                <div class="song-title">{{ song.name }}</div>
                <div class="song-artist">{{ song.artistName }}</div>
              </div>
            </div>
            <div class="song-duration">{{ song.duration }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Refresh, Share } from "@element-plus/icons-vue";
import {
  getBanners,
  getRecommendPlaylists,
  getRecommendSongs,
} from "../api/manage.js";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

// 轮播图数据
const banners = ref([]);

// 推荐歌单数据
const playlists = ref([]);

// 推荐歌曲数据
const songs = ref([]);

// 计算属性：将歌曲分为左右两列
const songsLeft = computed(() => songs.value.slice(0, 10));
const songsRight = computed(() => songs.value.slice(10, 20));

// 查看更多
const viewMore = () => {
  fetchRecommendPlaylists();
};

// 刷新推荐
const refreshRecommend = () => {
  fetchRecommendSongs();
};

// 播放歌单
const showPlaylistDetail = (playlist) => {
  store.commit("SET_SELECTED_PLAYLIST", playlist);
  router.push({ path: "/playlist/" + playlist.id });
};

// 播放歌曲
const playSong = (song) => {
  store.commit("SET_CURRENT_SONG", song);
  store.commit("ADD_SONG_TO_USER_PLAYLIST", song);
  store.commit("SET_PLAYING", true);
};

const fetchBanners = async () => {
  await getBanners().then((res) => {
    if (res.data.code === 200) {
      banners.value = res.data.data.records;
    }
  });
};
const fetchRecommendPlaylists = async () => {
  await getRecommendPlaylists().then((res) => {
    if (res.data.code === 200) {
      playlists.value = res.data.data;
    }
  });
};
const fetchRecommendSongs = async () => {
  await getRecommendSongs().then((res) => {
    if (res.data.code === 200) {
      songs.value = res.data.data;
      songs.value.forEach((song) => {
        const minutes = Math.floor(song.duration / 60);
        const seconds = Math.floor(song.duration % 60);
        song.duration =
          minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
      });
    }
  });
};

const initData = async () => {
  // 初始化数据
  await fetchBanners();
  await fetchRecommendPlaylists();
  await fetchRecommendSongs();
};

onMounted(() => {
  initData();
});
</script>

<style scoped>
.recommend-container {
  padding: 20px;
  min-height: 100vh;
  margin-bottom: 50px;
}

/* 轮播图区域 */
.banner-section {
  margin-bottom: 10px;
}

.banner-item {
  position: relative;
  border-radius: 10px;
  display: flex;
  justify-content: center;
}

.banner-image {
  width: 100%;
  object-fit: cover;
}

/* 通用区域样式 */
.section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-more {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.section-more:hover {
  opacity: 0.8;
}

.section-more .el-icon {
  font-size: 16px;
}

/* 歌单网格 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
}

.playlist-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.playlist-item:hover {
  transform: translateY(-4px);
}

.play-btn {
  position: absolute;
  right: -8px;
  bottom: -10px;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background-color: #dedada;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.playlist-item:hover .play-btn {
  opacity: 1;
}

.playlist-item:hover .play-btn::after {
  content: "▷";
  font-size: 18px;
  font-weight: bolder;
  position: absolute;
}

.playlist-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.playlist-info {
  padding: 0 4px;
}

.like-name {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
}

/* 歌曲列表 */
.song-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.songs-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #dadde0;
}

.song-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.song-cover {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  position: relative;
  transition: background-color 0.2s;
}

.song-left:hover .song-cover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
}

.song-left:hover .song-cover::after {
  content: "▷";
  position: absolute;
  top: 46%;
  left: 56%;
  transform: translate(-50%, -50%);
  font-size: 30px;
  color: white;
  z-index: 1;
}

.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.song-artist {
  font-size: 12px;
  color: #666;
}

.song-duration {
  font-size: 12px;
  color: #999;
  min-width: 45px;
  text-align: right;
}
</style>
