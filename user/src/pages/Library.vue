<template>
  <div class="library-container">
    <div class="header-section">
      双击对应行即可播放该歌曲！
    </div>
    <el-scrollbar height="auto">
      <el-table v-if="songs.length"
                v-loading="tableLoading"
                :cellStyle="{ width: '100%','border-bottom': 'none' }"
                :data="songs"
                :header-cell-style="{ width: '100%','border-bottom':'none' }"
                :row-class-name="rowClassName"
                :tooltip-options="{ placement: 'top' ,offset:'-20' }"
                element-loading-text="Loading..."
                height="670"
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
              <el-icon class="control-icon" @click="toggleFavorite(row)">
                <BiSolidHeart v-if="row.isLiked || false" style="color: red"/>
                <BiHeart v-else/>
              </el-icon>
            </template>
            <template v-else-if="column.prop==='download'">
              <el-icon class="control-icon" @click="handleDownload(row)">
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
    <!-- 分页 -->
    <div class="table-footer">
      <el-pagination :current-page="page.currentPage"
                     :page-size="searchForm.pageSize"
                     :page-sizes="[50, 100, 150, 200]"
                     :total="page.total"
                     layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                     @current-change="handlePageChange"/>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import {getAllSongs} from "../api/manage.js";
import {useStore} from "vuex";
import {BiHeart, BiSolidHeart} from "vue-icons-plus/bi";
import {BsCloudDownload} from "vue-icons-plus/bs";
import {message} from "../utils/message.js";
import {fetchFavoriteSongs, toggleFavoriteSong} from "../utils/userFavorite.js";

const store = useStore();

const tableLoading = ref(true);

const songs = ref([]);

const rowClassName = (row, index) => {
  row.index = index;
}

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

const searchForm = reactive({
  pageNum: 1,
  pageSize: 50,
});

const page = reactive({
  currentPage: 1,
  total: 0
})

const toggleFavorite = async (row) => {
  row.isLiked = await toggleFavoriteSong(store, [row.id], row.isLiked)
}

const handleDownload = async (row) => {
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

const playSong = (row) => {
  store.commit('SET_CURRENT_SONG', row);
  store.commit("ADD_SONG_TO_USER_PLAYLIST", row);
  store.commit("SET_PLAYING", true);
}

const fetchSongs = async () => {
  tableLoading.value = true;
  getAllSongs(searchForm).then(res => {
    if (res.data.code === 200) {
      songs.value = res.data.data.records;
      songs.value.forEach(song => {
        const minutes = Math.floor(song.duration / 60);
        const seconds = Math.floor(song.duration % 60);
        song.duration = minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
      })
      page.total = res.data.data.total;
      fetchFavorite();
    }
  }).finally(() => {
    tableLoading.value = false;
  })
}

const fetchFavorite = async () => {
  const favoriteSongs = await fetchFavoriteSongs(store);
  if (favoriteSongs) {
    console.log(favoriteSongs)
    songs.value.forEach(song => {
      song.isLiked = favoriteSongs.find(favoriteSong => favoriteSong.id === song.id) || false;
    })
  }
}

const handleSizeChange = (val) => {
  searchForm.pageSize = val;
  fetchSongs();
}

const handlePageChange = (val) => {
  searchForm.pageNum = val;
  page.currentPage = val;
  fetchSongs();
}

onMounted(() => {
  fetchSongs();
})

</script>
<style scoped>
.library-container {
  background-color: white;
}

.header-section {
  margin-bottom: 10px;
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


.song-info {
  display: flex;
  align-items: center;
  justify-content: left;
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


.table-footer {
  display: flex;
  justify-content: center;
  text-align: center;
  margin-top: 20px;
  position: relative;
  z-index: 1001;
}

/deep/ .el-table__inner-wrapper:before {
  background-color: white;
  position: relative;
}
</style>