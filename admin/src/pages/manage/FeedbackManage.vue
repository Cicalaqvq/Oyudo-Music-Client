<template>
  <div>
    <!-- 反馈搜索表单 -->
    <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词" style="min-width: 300px;">
          <el-input v-model="searchForm.feedback" clearable placeholder="请输入反馈内容关键词" @clear="handleReset"/>
        </el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form>
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
                  height="613"
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
    label: "反馈内容",
    prop: "feedback",
    width: 600,
  },
  {
    label: "反馈时间",
    prop: "createTime",
    width: 300,
  },
  {
    label: "操作",
    prop: "Do",
  }
]

const searchForm = reactive({
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
  fetchFeedbacks();
};

const handleReset = () => {
  searchForm.feedback = null;
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
            fetchFeedbacks();
          }
        })
      }).finally(() => {
    loading.value = false;
  })
};

const handleSizeChange = (size) => {
  searchForm.pageSize = size;
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