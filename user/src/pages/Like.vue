<template>
  <div class="like-detail">
    <!-- 歌单信息区域 -->
    <div class="like-info">
      <div class="like-avatar">
        <el-image v-if="songs.length" :src="songs[0].coverUrl || defaultAvatar"
                  style="width: 100%;height: 100%;object-fit: cover;"/>
        <el-image v-else :src="defaultAvatar"
                  style="width: 100%;height: 100%;object-fit: cover;"/>

      </div>
      <div class="like-content">
        <h1 class="like-name">我喜欢的音乐</h1>
        <div class="like-meta">
          <p class="meta-item">
            <span class="playlist-data">{{ songs.length }}首歌曲</span>
          </p>
        </div>
        <div class="like-footer">
          <el-button class="play-button" style="width: 100px" type="primary" @click="playAll">
            <span style="font-size: 12px">▷ 播放全部</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 歌曲列表区域 -->
    <div class="tabs-section">
      <div class="song-list">
        <el-scrollbar height="auto">
          <el-table v-if="songs.length"
                    v-loading="tableLoading"
                    :cellStyle="{ width: '100%','border-bottom': 'none' }"
                    :data="songs"
                    :header-cell-style="{ width: '100%','border-bottom':'none' }"
                    :row-class-name="rowClassName"
                    :tooltip-options="{ placement: 'top' ,offset:-20,effect:'light' }"
                    element-loading-text="Loading..."
                    height="550"
                    style="width: 100%;font-size: 12px"
                    @row-dblclick="playSong"
          >
            >
            <el-table-column v-for="column in columns"
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
                          style="width: 45px;height: 45px"
                      >
                      </el-image>
                    </div>
                    <div class="song-title">{{ row.name }}
                    </div>
                  </div>
                </template>

                <template v-else-if="column.prop==='like'">
                  <el-icon class="control-icon" @click="toggleLike(row)">
                    <BiSolidHeart style="color: red"/>
                  </el-icon>
                </template>
                <template v-else-if="column.prop==='download'">
                  <el-icon class="control-icon" @click="downloadSong(row)">
                    <BsCloudDownload/>
                  </el-icon>
                </template>
                <template v-else>
                  {{ row[column.prop] }}
                </template>


              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="!songs.length && !tableLoading" :image-size="200" description="暂无数据"/>

        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {useStore} from "vuex";
import {BiSolidHeart} from "vue-icons-plus/bi";
import {BsCloudDownload} from "vue-icons-plus/bs";
import {message, messageBox} from "../utils/message.js";
import {getSongFavorite, unlikeSong} from "../api/manage.js";

const store = useStore()
const tableLoading = ref(false)
const rowClassName = (row, index) => {
  row.index = index;
}
// 默认图片
const defaultAvatar = 'https://ts1.tc.mm.bing.net/th/id/OIP-C.CDxtKQRYAPTUqYVGxNKuLQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'


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
]


const playAll = () => {
  store.commit('SET_TRACK_LIST', songs)
  store.commit('SET_PLAY_MODE', 0)
  store.commit('SET_CURRENT_SONG', songs.value[0])
  store.commit('SET_PLAYING', true)
}

// 切换喜欢状态
const toggleLike = (row) => {
  messageBox("确定取消收藏这首歌曲吗？取消后该歌曲不会出现在您的喜欢列表中！").then(() => {
    unlikeSong(row.id).then((res) => {
      if (res.data.code === 200) {
        message('取消收藏成功')
        fetchLikeSongs()
      }
    })
  }).catch(() => {
    message('操作已取消', "info")
  })
}

// 下载歌曲
const downloadSong = async (row) => {
  message("正在创建下载链接....", "info")
  try {
    const response = await fetch(row.audioUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${row.name}.mp3`; // 自定义文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    message('链接创建成功，正在调用浏览器下载窗口...', 'success');
  } catch (error) {
    message('下载失败', 'error');
  }
}


// 获取歌单歌曲列表
const fetchLikeSongs = async () => {
  tableLoading.value = true
  const res = await getSongFavorite(null)
  if (res.data.code === 200) {
    songs.value = res.data.data.songs
    songs.value.forEach((song) => {
      song.duration = Math.floor(song.duration / 60) + ':' + (Math.floor(song.duration % 60) < 10 ? '0' + Math.floor(song.duration % 60) : Math.floor(song.duration % 60));
    })
  }
  tableLoading.value = false
}


const playSong = (row) => {
  store.commit('SET_CURRENT_SONG', row);
  store.commit("ADD_SONG_TO_USER_PLAYLIST", row);
  store.commit("SET_PLAYING", true);
}

onMounted(() => {
  fetchLikeSongs()
})
</script>

<style scoped>

.tabs-section {
  margin-top: 10px;
}


.like-detail {
  min-height: calc(100vh - 120px);
}

/* 歌手信息区域 */
.like-info {
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
  padding-top: 80px;
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
  height: 600px;
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

/deep/ .el-table__inner-wrapper:before {
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
  color: #409EFF;
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
