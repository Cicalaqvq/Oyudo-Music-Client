<template>
  <div class="playlist-container">
    <!-- 搜索栏 -->
    <div class="like-header">
      <div class="search-section">
        <el-input
          v-model="searchForm.title"
          clearable
          placeholder="搜索歌单..."
          prefix-icon="Search"
          style="width: 300px"
          @clear="handleInputClear"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <div>
        <el-select
          v-model="searchForm.styleId"
          :options="styleOptions"
          clearable
          default-first-option
          placeholder="请选择风格(单选)"
          @change="handleStyleChange"
          @clear="handleStyleClear"
        />
      </div>
    </div>
    <!-- 歌单 -->
    <div class="playlist-section">
      <el-scrollbar height="610">
        <div class="playlist-grid">
          <div
            v-for="playlist in playlists"
            :key="playlist.id"
            v-loading="loading"
            class="playlist-item"
            @click="handleClick(playlist)"
          >
            <div class="playlist-cover">
              <el-image :src="playlist.coverUrl" alt="封面" />
              <div class="play-btn" />
            </div>
            <div class="playlist-info">
              <h3 class="playlist-title">{{ playlist.title }}</h3>
              <p class="playlist-desc">{{ playlist.introduction }}</p>
              <el-tag>{{ playlist.style }}</el-tag>
            </div>
          </div>
        </div>
        <el-empty v-if="playlists.length === 0" description="暂无数据" />
      </el-scrollbar>
    </div>

    <!-- 分页 -->
    <div class="pagination-section" v-if="playlists.length !== 0">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[12, 24, 36]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { BiPlay } from "vue-icons-plus/bi";
import { getAllPlaylists } from "../api/manage.js";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { fetchFavoritePlaylists } from "../utils/userFavorite.js";
import { checkLogin } from "../utils/auth.js";
import { message } from "../utils/message.js";

const searchForm = reactive({
  title: null,
  styleId: null,
  pageNum: 1,
  pageSize: 12,
});
const styleOptions = [
  {
    label: "全部",
    value: null,
  },
  {
    label: "乡村",
    value: 1,
  },
  {
    label: "华语流行",
    value: 2,
  },
  {
    label: "原声带",
    value: 3,
  },
  {
    label: "古典",
    value: 4,
  },
  {
    label: "嘻哈说唱",
    value: 5,
  },
  {
    label: "国风",
    value: 6,
  },
  {
    label: "国风流行",
    value: 7,
  },
  {
    label: "摇滚",
    value: 8,
  },
  {
    label: "日本流行",
    value: 9,
  },
  {
    label: "朋克",
    value: 10,
  },
  {
    label: "欧美流行",
    value: 11,
  },
  {
    label: "电子",
    value: 12,
  },
  {
    label: "粤语流行",
    value: 13,
  },
  {
    label: "节奏布鲁斯",
    value: 14,
  },
  {
    label: "轻音乐",
    value: 15,
  },
  {
    label: "非洲节拍",
    value: 16,
  },
  {
    label: "韩国流行",
    value: 17,
  },
];
const loading = ref(true);
const playlists = ref([]);

const currentPage = ref(1);
const pageSize = ref(12);
const total = ref();
const router = useRouter();
const store = useStore();

const handleSearch = () => {
  fetchPlaylists();
};

const handleInputClear = () => {
  searchForm.title = null;
  fetchPlaylists();
};

const handleStyleChange = (val) => {
  searchForm.styleId = val;
  fetchPlaylists();
};

const handleStyleClear = () => {
  searchForm.styleId = null;
  fetchPlaylists();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  searchForm.pageSize = val;
  currentPage.value = 1;
  fetchPlaylists();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  searchForm.pageNum = val;
  fetchPlaylists();
};

const handleClick = (playlist) => {
  store.commit("SET_SELECTED_PLAYLIST", playlist);
  router.push({
    path: "/playlist/" + playlist.id,
  });
};

const fetchPlaylists = async () => {
  loading.value = true;
  const res = await getAllPlaylists(searchForm);
  if (res.data.code === 200) {
    playlists.value = res.data.data.records;
    total.value = res.data.data.total;
  }
  loading.value = false;
};

onMounted(() => {
  fetchPlaylists();
});
</script>

<style scoped>
.playlist-container {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 120px);
}

.like-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .search-section {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .el-select {
    width: 300px;
  }
}

.playlist-section {
  margin-top: 50px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 30px;
  padding-right: 20px;
}

.playlist-item {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.playlist-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.playlist-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.playlist-info {
  padding: 12px;
}

.playlist-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
