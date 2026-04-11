<template>
  <div class="artist-detail">
    <div>
      <el-icon class="back-icon" size="24" @click="back">
        <Back/>
      </el-icon>
    </div>
    <!-- 歌手信息区域 -->
    <div class="artist-info">
      <div class="artist-avatar">
        <el-image :alt="artistData.name" :preview-src-list="[artistData.avatar]" :show-progress=true
                  :src="artistData.avatar || defaultAvatar" style="width: 100%;height: 100%;object-fit: cover;"/>
      </div>
      <div class="artist-content">
        <h1 class="artist-name">{{ artistData.name }}</h1>
        <div class="artist-meta">
          <p class="meta-item">
            <span class="label">生日：</span>
            <span>{{ artistData.birth }}</span>
          </p>
          <p class="meta-item">
            <span class="label">地区：</span>
            <span>{{ artistData.area }}</span>
          </p>
          <p class="meta-item">
            <span class="label">简介</span>
            <el-tooltip v-if="artistData.introduction"
                        :content="artistData.introduction"
                        :disabled="isShowTooltip"
                        :offset="-500"
                        :popper-style="{ maxWidth: '550px' }"
                        effect="light"
                        placement="right"
            >
              <div class="artist-description" @mouseenter="visibilityChange($event)">
                {{ artistData.introduction || '暂无简介' }}
              </div>
            </el-tooltip>
          </p>
        </div>
      </div>
    </div>

    <!-- 歌曲列表区域 -->
    <div class="song-list">
      <p class="title">所有歌曲</p>
      <p class="sub-title">共{{ songsList.length }}首</p>
      <el-scrollbar height="auto">
        <el-table v-if="songsList.length"
                  v-loading="tableLoading"
                  :cellStyle="{ width: '100%','border-bottom': 'none' }"
                  :data="songsList"
                  :header-cell-style="{ width: '100%','border-bottom':'none' }"
                  :row-class-name="rowClassName"
                  :tooltip-options="{ placement: 'top' ,offset:'-20',effect:'light' }"
                  element-loading-text="Loading..."
                  height="480"
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
                <el-icon class="control-icon">
                  <BiSolidHeart v-if="row.isLike" style="color: red"/>
                  <BiHeart v-else/>
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

        <el-empty v-if="!songsList.length && !tableLoading" :image-size="200" description="暂无数据"/>

      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import {useStore} from "vuex";
import {BiHeart, BiSolidHeart} from "vue-icons-plus/bi";
import {BsCloudDownload} from "vue-icons-plus/bs";
import {message} from "../utils/message.js";
import {useRoute} from "vue-router";
import {getAllSongs, getArtistDetail} from "../api/manage.js";
import {formatDate} from "@vueuse/core";

const isShowTooltip = ref(false)
const routes = useRoute()
const store = useStore()
const tableLoading = ref(false)
const rowClassName = (row, index) => {
  row.index = index;
}

// 默认图片
const defaultAvatar = 'https://via.placeholder.com/300x300?text=Artist'

// 歌手数据
const artistData = reactive({
  id: routes.params.id,
})

// 歌曲列表
const songsList = ref([]);

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

const back = () => {
  window.history.back()
}

const visibilityChange = (event) => {
  const ev = event.target;
  const evWeight = ev.scrollHeight;
  const contentWeight = ev.clientHeight;
  isShowTooltip.value = evWeight <= contentWeight;
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

// 获取歌手详情
const fetchArtistDetail = async () => {
  if (!store.state.SELECTED_ARTIST) {
    const res = await getArtistDetail(artistData.id)
    if (res.data.code === 200) {
      store.commit('SET_SELECTED_ARTIST', res.data.data)
    }
  }
  artistData.avatar = store.state.SELECTED_ARTIST.avatar || defaultAvatar
  artistData.name = store.state.SELECTED_ARTIST.name
  artistData.introduction = store.state.SELECTED_ARTIST.introduction
  artistData.area = store.state.SELECTED_ARTIST.area
  if (!store.state.SELECTED_ARTIST.birth) {
    artistData.birth = '暂无数据'
  } else {
    artistData.birth = formatDate(new Date(store.state.SELECTED_ARTIST.birth), "YYYY年MM月DD日")
  }

}

// 获取歌手歌曲列表
const fetchArtistSongs = async () => {
  tableLoading.value = true
  const res = await getAllSongs({
    artistId: artistData.id,
  })
  if (res.data.code === 200) {
    songsList.value = res.data.data.records
    songsList.value.forEach((song) => {
      song.duration = Math.floor(song.duration / 60) + ':' + (Math.floor(song.duration % 60) < 10 ? '0' + Math.floor(song.duration % 60) : Math.floor(song.duration % 60));
    })
  }
  tableLoading.value = false
}

const playSong = (row) => {
  store.commit('SET_CURRENT_SONG', row);
  store.commit("ADD_SONG_TO_TRACK_LIST", row);
  store.commit("SET_PLAYING", true);
}

onMounted(() => {
  fetchArtistDetail()
  fetchArtistSongs()
})
</script>

<style scoped>
.back-icon {
  cursor: pointer;
  padding: 0;
}

.artist-detail {
  min-height: calc(100vh - 120px);
}

/* 歌手信息区域 */
.artist-info {
  display: flex;
  gap: 30px;
}

.artist-avatar {
  flex-shrink: 0;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.artist-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.artist-name {
  font-size: 30px;
  font-weight: bold;
  color: #333;
}

.artist-meta {
  margin-bottom: 15px;
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

.artist-description {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
  height: fit-content;
  max-height: 90px;
  margin-top: 3px;
}

/* 歌曲列表区域 */
.song-list {
  padding-top: 10px;
  height: 500px;

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


</style>
