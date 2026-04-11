<template>
  <div class="artist-page">
    <!-- 标题 -->

    <div class="container">
      <!-- 左侧筛选栏 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <span style="font-size: 16px;font-weight: 800;">歌手分类</span>
          <div class="reset-filters"
               @click="resetFilters">
            <el-icon size="15" style="padding-top: 2px">
              <BiReset/>
            </el-icon>
            <div style="margin-left: 5px">重置</div>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
              v-model="searchForm.name"
              placeholder="搜索歌手"
              prefix-icon="Search"
              @input="handleInput"
          />
        </div>

        <template v-for="(item) in options" :key="item.index">
          <div class="filter-group">
            <div class="filter-title">{{ item.title }}</div>
            <el-radio-group class="filter-options">
              <el-radio-button
                  v-for="child in item.option"
                  :class="{active: item.selected === child.value}"
                  :label=child.label
                  :value=child.value
                  class="filter-option"
                  @click="handleSelect(item,child)"
              >
              </el-radio-button>
            </el-radio-group>
          </div>
        </template>
      </div>

      <!-- 右侧歌手列表 -->
      <div class="main-content">
        <el-scrollbar>
          <!-- 歌手列表 -->
          <div class="artist-grid">
            <div
                v-for="artist in artists"
                :key="artist.id"
                v-loading="loading"
                class="artist-item"
                @click="handleClick(artist)"
                @mouseenter="handleMouseEnter(artist.id)"
                @mouseleave="handleMouseLeave"
            >
              <div class="artist-avatar">
                <el-image :lazy=true :src="artist.avatar" alt="歌手头像"
                          style="width: 100%;height: 100%;border-radius: 50%"/>
              </div>
              <div v-show="hoverIndex === artist.id" class="artist-name">{{ artist.name }}</div>
            </div>
          </div>
          <el-empty v-if="artists.length === 0" description="暂无数据"/>
        </el-scrollbar>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
              :current-page="page.currentPage"
              :page-size="searchForm.pageSize"
              :page-sizes="[12, 24, 36]"
              :total="page.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import {BiReset} from "vue-icons-plus/bi";
import {getArtists} from "../api/manage.js";
import {useRouter} from "vue-router";
import {useStore} from "vuex";

const store = useStore()
const router = useRouter()
const options = ref([
  {
    title: "歌手类型",
    index: 0,
    selected: null,
    option: [
      {
        value: null,
        label: "全部",
      },
      {
        value: 0,
        label: "男歌手",
      },
      {
        value: 1,
        label: "女歌手",
      },
      {
        value: 2,
        label: "华语组合/乐队",
      },
    ]
  },
  {
    title: "地区类型",
    index: 1,
    selected: null,
    option: [
      {
        value: null,
        label: "全部",
      },
      {
        value: 0,
        label: "中国",
      },
      {
        value: 1,
        label: "美国",
      },
      {
        value: 2,
        label: "韩国",
      },
      {
        value: 3,
        label: "日本",
      },
      {
        value: 4,
        label: "其他",
      }
    ]
  }
])
const loading = ref(false)
const artists = ref([])
const page = ref({
  currentPage: 1,
  total: 0,
})
const searchForm = reactive({
  name: null,
  gender: null,
  area: null,
  pageNum: 1,
  pageSize: 12,
})
const hoverIndex = ref(null)
const handleMouseEnter = (id) => {
  hoverIndex.value = id
}
const handleMouseLeave = () => {
  hoverIndex.value = null
}
const handleSizeChange = (size) => {
  searchForm.pageSize = size
  handleCurrentChange(1)
}
const handleCurrentChange = (currentPage) => {
  page.value.currentPage = currentPage
  searchForm.pageNum = currentPage
  fetchArtists()
}
const resetFilters = () => {
  searchForm.name = null
  searchForm.gender = null
  searchForm.area = null
  searchForm.pageNum = 1
  options.value.forEach(item => {
    item.selected = null
  })
  fetchArtists()
}
const handleInput = (value) => {
  searchForm.name = value
  fetchArtists()
}
const handleSelect = (parent, child) => {
  parent.selected = child.value
  switch (parent.index) {
    case 0:
      searchForm.gender = child.value
      break;
    case 1:
      searchForm.area = child.label
      break;
  }
  fetchArtists()
}
const fetchArtists = async () => {
  loading.value = true
  getArtists(searchForm).then(res => {
    if (res.data.code === 200) {
      artists.value = res.data.data.records
      page.value.total = res.data.data.total
      searchForm.pageNum = page.value.currentPage
    }
  }).finally(() => {
    loading.value = false
  })
}

const handleClick = (artist) => {
  store.commit("SET_SELECTED_ARTIST", artist)
  router.push({
    path: "/artist/" + artist.id,
  })
}
onMounted(() => {
  fetchArtists()
})
</script>

<style scoped>
.reset-filters {
  font-size: 12px;
  cursor: pointer;
  display: flex;
  justify-content: center;
}

.reset-filters:hover {
  color: #007bff;
}

.artist-page {
  padding: 20px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.container {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 200px;
  height: 750px;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
}

.main-content {
  width: calc(100% - 200px);
  max-height: 750px;
}

.search-box {
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-title {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  /deep/ .el-radio-button__inner {
    outline: none;
    background-color: transparent;
  }

}

.filter-option {
  width: 100%;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.filter-option:hover {
  background-color: #e8e7e7;
}

.filter-option.active {
  background-color: #cde5f8;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 35px;
  margin-bottom: 10px;
}

.artist-item {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.artist-item:hover {
  transform: scale(1.05);
}

.artist-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-left: 10px;
  margin-top: 10px;
}


.artist-name {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.artist-item:hover .artist-name {
  opacity: 1;
}

.pagination-container {
  display: flex;
  justify-content: center;
}
</style>