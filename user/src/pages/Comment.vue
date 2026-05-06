<template>
  <div>
    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabChange">
      <el-tab-pane label="歌曲评论" name="song">
        <!-- 搜索表单 -->
        <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
          <el-form ref="formRef" :inline="true" :model="searchForm">
            <el-form-item label="评论内容" prop="content" style="min-width: 300px;">
              <el-input v-model="searchForm.content" clearable placeholder="请输入评论内容"/>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                  v-model="timeRange"
                  :shortcuts="shortcuts"
                  date-format="YYYY/MM/DD ddd"
                  end-placeholder="请选择结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  range-separator="至"
                  start-placeholder="请选择开始时间"
                  style="width: 350px"
                  time-format="A hh:mm:ss"
                  type="datetimerange"
              >
              </el-date-picker>
            </el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form>
        </el-card>
        <!-- 列表、分页、批量操作 -->
        <el-card>
          <el-scrollbar height="auto">
            <el-table v-if="songComments.length"
                      v-loading="tableLoading"
                      :cell-style="{ 'text-align': 'center'}"
                      :data="songComments"
                      :header-cell-style="{ 'text-align': 'center' }"
                      :row-style="{'height': 'auto'}"
                      element-loading-text="Loading..."
                      height="520"
                      style="width: 100%;font-size: 12px">
              <el-table-column v-for="column in columns"
                               :key="column.prop"
                               :label="column.label"
                               :prop="column.prop"
                               :sortable="column.sortable"
                               :width="column.width || 'auto'"
              >

                <template #default="{ row }">
                  <template v-if="column.prop==='Do'">
                    <el-button type="text" @click="handleDelete(row)">删除</el-button>
                  </template>

                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-if="!songComments.length && !tableLoading" :image-size="200" description="暂无数据"/>

          </el-scrollbar>
          <!-- 批量操作和分页 -->
          <div class="table-footer">
            <el-pagination :current-page="page.currentPage" :page-size="searchForm.pageSize"
                           :page-sizes="[10, 20, 30, 40]"
                           :total="page.total"
                           background
                           layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                           @current-change="handlePageChange"/>
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="歌单评论" name="playlist">
        <!-- 搜索表单 -->
        <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
          <el-form ref="formRef" :inline="true" :model="searchForm">
            <el-form-item label="评论内容" prop="content" style="min-width: 300px;">
              <el-input v-model="searchForm.content" clearable placeholder="请输入评论内容"/>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                  v-model="timeRange"
                  :shortcuts="shortcuts"
                  date-format="YYYY/MM/DD ddd"
                  end-placeholder="请选择结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  range-separator="至"
                  start-placeholder="请选择开始时间"
                  style="width: 350px"
                  time-format="A hh:mm:ss"
                  type="datetimerange"
              >
              </el-date-picker>
            </el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form>
        </el-card>
        <!-- 列表、分页、批量操作 -->
        <el-card>
          <el-scrollbar height="auto">
            <el-table v-if="playlistComments.length"
                      v-loading="tableLoading"
                      :cell-style="{ 'text-align': 'center'}"
                      :data="playlistComments"
                      :header-cell-style="{ 'text-align': 'center' }"
                      :row-style="{'height': 'auto'}"
                      element-loading-text="Loading..."
                      height="520"
                      style="width: 100%;font-size: 12px">
              <el-table-column v-for="column in columns"
                               :key="column.prop"
                               :label="column.label"
                               :prop="column.prop"
                               :sortable="column.sortable"
                               :width="column.width || 'auto'"
              >

                <template #default="{ row }">
                  <template v-if="column.prop==='Do'">
                    <el-button type="text" @click="handleDelete(row)">删除</el-button>
                  </template>

                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-if="!playlistComments.length && !tableLoading" :image-size="200" description="暂无数据"/>

          </el-scrollbar>
          <!-- 批量操作和分页 -->
          <div class="table-footer">
            <el-pagination :current-page="page.currentPage" :page-size="searchForm.pageSize"
                           :page-sizes="[10, 20, 30, 40]"
                           :total="page.total"
                           background
                           layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                           @current-change="handlePageChange"/>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>

</template>
<script setup>
import {onMounted, reactive, ref} from "vue";
import {formatDate} from "@vueuse/shared";
import {searchCommentsByUser} from "../utils/userComment.js";
import {message, messageBox} from "../utils/message.js";
import {deleteComment} from "../api/manage.js";

const activeTab = ref("song");

const timeRange = ref([]);

const formRef = ref(null);

const tableLoading = ref(true);

const loading = ref(false);

const playlistComments = ref([]);

const songComments = ref([]);

const columns = [
  {
    label: "标题",
    prop: "title",
  },
  {
    label: "评论内容",
    prop: "content",
    width: 500,
  },
  {
    label: "点赞数",
    prop: "likeCount",
  },
  {
    label: "评论时间",
    prop: "createTime",
    width: 200,
  },
  {
    label: "操作",
    prop: "Do",
  }
]

const shortcuts = [
  {
    text: '昨天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    },
  },
  {
    text: '上周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    },
  },
  {
    text: '上个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    },
  },
]

const searchForm = reactive({
  type: 1,
  content: null,
  startTime: null,
  endTime: null,
  pageNum: 1,
  pageSize: 10
});

const page = reactive({
  currentPage: 1,
  total: 0
})

const handleTabChange = (tab) => {
  activeTab.value = tab.props.name;
  handleReset();
};

const handleSearch = () => {
  searchForm.pageNum = 1;
  page.currentPage = 1;
  if (timeRange.value && timeRange.value.length === 2) {
    const startDate = new Date(timeRange.value[0]);
    const endDate = new Date(timeRange.value[1]);
    searchForm.startTime = formatDate(startDate, "YYYY-MM-DD HH:mm:ss");
    searchForm.endTime = formatDate(endDate, "YYYY-MM-DD HH:mm:ss");
  } else {
    searchForm.startTime = null;
    searchForm.endTime = null;
  }
  initData();
};

const handleReset = () => {
  formRef.value.resetFields();
  timeRange.value = [];
  searchForm.startTime = null;
  searchForm.endTime = null;
  searchForm.pageNum = 1;
  page.currentPage = 1;
  initData();
};


const handleDelete = (row) => {
  loading.value = true;
  messageBox(`确定删除该条评论吗？`, "删除确认", "warning", true)
      .then(async () => {
        await deleteComment(row.id).then(res => {
          if (res.data.code === 200) {
            message("删除成功")
            handleReset();
            initData();
          }
        })
      }).finally(() => {
    loading.value = false;
  })
};


const handleSizeChange = (size) => {
  searchForm.pageNum = 1;
  searchForm.pageSize = size;
  page.currentPage = 1;
  initData();
};

const handlePageChange = (number) => {
  page.currentPage = number;
  searchForm.pageNum = number;
  initData();
};

const initData = async () => {
  tableLoading.value = true;
  switch (activeTab.value) {
    case "playlist":
      searchForm.type = 1;
      playlistComments.value = await searchCommentsByUser(searchForm);
      page.total = playlistComments.value.length;
      tableLoading.value = false;
      break;
    case "song":
      searchForm.type = 0;
      songComments.value = await searchCommentsByUser(searchForm);
      page.total = songComments.value.length;
      tableLoading.value = false;
      break;
  }
};

onMounted(() => {
  initData();
});

</script>
<style scoped>

.search-form {
  margin-bottom: 20px;
  height: auto;

  .el-form {
    display: flex;
  }
}

.table-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
}

:deep(.el-card) {
  --el-card-border-color: unset !important;
}

:deep(.el-card.is-always-shadow) {
  box-shadow: none;
}

</style>