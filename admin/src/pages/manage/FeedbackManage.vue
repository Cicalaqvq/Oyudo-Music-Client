<template>
  <div>
    <!-- 反馈搜索表单 -->
    <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
      <div class="flex items-left mb-3">横向滑动以选择条件重置或搜索</div>
      <el-scrollbar>
        <el-form ref="formRef" :inline="true" :model="searchForm">
          <el-form-item label="用户名" prop="username" style="min-width: 300px;">
            <el-input v-model="searchForm.username" clearable placeholder="请输入用户名"/>
          </el-form-item>
          <el-form-item label="邮箱" prop="email" style="min-width: 300px;">
            <el-input v-model="searchForm.email" clearable placeholder="请输入邮箱"/>
          </el-form-item>
          <el-form-item label="反馈内容" prop="feedback" style="min-width: 300px;">
            <el-input v-model="searchForm.feedback" clearable placeholder="请输入反馈内容"/>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
                v-model="timeRange"
                :shortcuts="shortcuts"
                date-format="YYYY/MM/DD ddd"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                range-separator="至"
                start-placeholder="开始时间"
                style="width: 350px"
                time-format="A hh:mm:ss"
                type="datetimerange"
            >
            </el-date-picker>
          </el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form>
      </el-scrollbar>
    </el-card>

    <!-- 反馈列表、分页、批量操作 -->
    <el-card>
      <div class="flex items-left mb-3">反馈列表</div>
      <el-scrollbar height="auto">
        <el-table v-if="feedbacks.length"
                  v-loading="tableLoading"
                  :cell-style="{ 'text-align': 'center'}"
                  :data="feedbacks"
                  :header-cell-style="{ 'text-align': 'center' }"
                  :row-style="{'height': 'auto'}"
                  element-loading-text="Loading..."
                  height="580"
                  style="width: 100%;font-size: 12px"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="auto"/>
          <el-table-column v-for="column in columns"
                           :key="column.prop"
                           :label="column.label"
                           :prop="column.prop"
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

        <el-empty v-if="!feedbacks.length && !tableLoading" :image-size="200" description="暂无数据"/>

      </el-scrollbar>
      <!-- 批量操作和分页 -->
      <div class="table-footer">
        <div class="flex items-center">
          <el-button :disabled="!selectedRows.length" type="danger" @click="handleBatchDelete">批量删除</el-button>
        </div>
        <el-pagination :current-page="page.currentPage" :page-size="searchForm.pageSize" :page-sizes="[10, 20, 30, 40]"
                       :total="page.total"
                       background
                       layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                       @current-change="handlePageChange"/>
      </div>

    </el-card>
  </div>

</template>
<script setup>
import {onMounted, reactive, ref} from "vue";
import {deleteFeedbacks, getFeedbacks} from "../../api/manage.js";
import {message, messageBox} from "../../utils/message.js";
import {formatDate} from "@vueuse/shared";

const timeRange = ref([]);

const formRef = ref(null);

const tableLoading = ref(true);

const loading = ref(false);

const selectedRows = ref([]);

const feedbacks = ref([]);

const columns = [
  {
    label: "反馈编号",
    prop: "id",
  },
  {
    label: "用户编号",
    prop: "userId",
  },
  {
    label: "用户名",
    prop: "username",
    width: 150,
  },
  {
    label: "用户邮箱",
    prop: "email",
    width: 300,
  },
  {
    label: "反馈内容",
    prop: "feedback",
    width: 500,
  },
  {
    label: "反馈时间",
    prop: "createTime",
    width: 150,
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
  username: null,
  email: null,
  startTime: null,
  endTime: null,
  feedback: null,
  pageNum: 1,
  pageSize: 10,
});

const page = reactive({
  currentPage: 1,
  total: 0
})

const fetchFeedbacks = async () => {
  tableLoading.value = true;
  await getFeedbacks(searchForm).then(res => {
    if (res.data.code === 200) {
      feedbacks.value = res.data.data.records;
      feedbacks.value.forEach(item => {
        item.createTime = formatDate(new Date(item.createTime), "YYYY-MM-DD HH:mm:ss");
      })
      page.total = res.data.data.total;
    }
  }).finally(() => {
    tableLoading.value = false;
  });
}

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
  fetchFeedbacks();
};

const handleReset = () => {
  formRef.value.resetFields();
  timeRange.value = [];
  searchForm.startTime = null;
  searchForm.endTime = null;
  searchForm.pageNum = 1;
  page.currentPage = 1;
  fetchFeedbacks();
};

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};


const handleDelete = (row) => {
  loading.value = true;
  messageBox(`确定删除编号为${row.id}的反馈项吗？`, "删除确认", "warning", true)
      .then(() => {
        const ids = [row.id];
        deleteFeedbacks(ids).then(res => {
          if (res.data.code === 200) {
            message("删除成功")
            handleReset();
            fetchFeedbacks();
          }
        })
      }).finally(() => {
    loading.value = false;
  })
};

const handleBatchDelete = () => {
  loading.value = true;
  messageBox("确定批量删除选中的反馈项吗？", "删除确认", "warning", true)
      .then(() => {
        const ids = selectedRows.value.map((row) => row.id);
        deleteFeedbacks(ids).then(res => {
          if (res.data.code === 200) {
            message("已删除" + ids.length + "个反馈项");
            handleReset();
            fetchFeedbacks();
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
  fetchFeedbacks();
};

const handlePageChange = (number) => {
  page.currentPage = number;
  searchForm.pageNum = number;
  fetchFeedbacks();
};

const initData = () => {
  fetchFeedbacks();
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
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
}

</style>