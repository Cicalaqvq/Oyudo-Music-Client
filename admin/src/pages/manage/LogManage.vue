<template>
  <div>
    <!-- 搜索表单 -->
    <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
      <div class="flex items-left mb-3">横向滑动以选择条件重置或搜索</div>
      <el-scrollbar height="auto">
        <el-form ref="formRef" :inline="true" :model="searchForm" @keydown.enter="handleSearch">
          <el-form-item label="角色" prop="role">
            <el-select v-model="searchForm.role" clearable placeholder="请选择角色" style="width: 120px"
                       @change="handleSearch">
              <el-option label="管理员" value="0"/>
              <el-option label="普通用户" value="1"/>
              <el-option label="游客" value="2"/>
            </el-select>
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="searchForm.username" clearable placeholder="请输入用户名" style="width: 200px"/>
          </el-form-item>
          <el-form-item label="客户端IP地址" label-width="100" prop="clientIp">
            <el-input v-model="searchForm.clientIp" clearable placeholder="请输入IP地址" style="width: 150px"/>
          </el-form-item>
          <el-form-item label="操作状态" prop="status">
            <el-select v-model="searchForm.status" clearable placeholder="请选择操作状态" style="width: 150px"
                       @change="handleSearch">
              <el-option label="成功" value="1"/>
              <el-option label="失败" value="0"/>
            </el-select>
          </el-form-item>
          <el-form-item label="操作模块" prop="module">
            <el-input v-model="searchForm.module" clearable placeholder="请输入操作模块" style="width: 200px"/>
          </el-form-item>
          <el-form-item label="操作描述" prop="description">
            <el-input v-model="searchForm.description" clearable placeholder="请输入操作描述" style="width: 200px"/>
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

    <!-- 列表、分页、批量操作 -->
    <el-card>
      <div class="flex items-left mb-3">日志列表</div>
      <el-scrollbar height="auto">
        <el-table v-if="logs.length"
                  v-loading="tableLoading"
                  :cell-style="{ 'text-align': 'center'}"
                  :data="logs"
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
              <template v-if="column.prop==='role'">
                <el-tag :type="selectTypeByRole(row.role)">
                  {{ showRoleName(row.role) }}
                </el-tag>
              </template>
              <template v-else-if="column.prop==='status'">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '成功' : '失败' }}
                </el-tag>
              </template>
              <template v-else-if="column.prop==='Do'">
                <el-button type="text" @click="showDetail(row)">查看详情</el-button>
                <el-button type="text" @click="handleDelete(row)">删除</el-button>
              </template>

              <template v-else>
                {{ row[column.prop] }}
              </template>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!logs.length && !tableLoading" :image-size="200" description="暂无数据"/>

      </el-scrollbar>
      <!-- 批量操作和分页 -->
      <div class="table-footer">
        <div class="flex items-center">
          <el-button :disabled="!selectedRows.length" type="danger" @click="handleBatchDelete">批量删除</el-button>
          <el-button  type="primary" @click="handleReset">刷新数据</el-button>

        </div>
        <el-pagination :current-page="page.currentPage" :page-size="searchForm.pageSize"
                       :page-sizes="[25, 50, 100, 200]"
                       :total="page.total"
                       background
                       layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                       @current-change="handlePageChange"/>
      </div>

      <el-dialog v-model="dialogVisible" center title="日志详情" width="1000" @close="closeDialog">
        <el-descriptions v-if="selectedRow" :column="1" border>
          <el-descriptions-item label="日志ID">
            {{ selectedRow.id }}
          </el-descriptions-item>
          <el-descriptions-item label="用户角色">
            <el-tag :type="selectTypeByRole(selectedRow.role)">
              {{ showRoleName(selectedRow.role) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作用户">
            {{ selectedRow.username }} (用户ID: {{ selectedRow.userId }})
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ selectedRow.operationTime }}
          </el-descriptions-item>
          <el-descriptions-item label="操作模块">
            {{ selectedRow.module }}
          </el-descriptions-item>
          <el-descriptions-item label="操作描述">
            {{ selectedRow.description }}
          </el-descriptions-item>
          <el-descriptions-item label="操作方法全路径">
            {{ selectedRow.method }}
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedRow.params" label="操作参数">
            <pre style="margin: 0; white-space: pre-wrap;">{{ selectedRow.params }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedRow.status === 1 ? 'success' : 'danger'">
              {{ selectedRow.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作结果">
            {{ selectedRow.result }}
          </el-descriptions-item>
          <el-descriptions-item label="操作耗时 (毫秒)">
            {{ selectedRow.costTime }}
          </el-descriptions-item>
          <el-descriptions-item label="客户端IP地址">
            {{ selectedRow.clientIp }}
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>

    </el-card>
  </div>

</template>
<script setup>
import {onMounted, reactive, ref} from "vue";
import {deleteLogs, getLogs} from "../../api/manage.js";
import {message, messageBox} from "../../utils/message.js";
import {formatDate} from "@vueuse/shared";


const tableLoading = ref(true);

const loading = ref(false);

const selectedRows = ref([]);

const selectedRow = ref(null);

const timeRange = ref([new Date().setTime(new Date().getTime() - 3600 * 1000 * 24), new Date()]);

const formRef = ref();

const dialogVisible = ref(false);

const columns = [
  {
    label: "时间",
    prop: "operationTime",
    width: 150,
  },
  {
    label: "角色",
    prop: "role",
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
    label: "操作模块",
    prop: "module",
    width: 200,
  },
  {
    label: "操作描述",
    prop: "description",
    width: 200,
  },
  {
    label: "状态",
    prop: "status",
  },
  {
    label: "所在IP地址",
    prop: "clientIp",
    width: 100,
  },
  {
    label: "操作",
    prop: "Do",
    width: 150,
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
  role: null,
  username: null,
  startTime: null,
  endTime: null,
  status: null,
  clientIp: null,
  pageNum: 1,
  pageSize: 25,
});

const page = reactive({
  currentPage: 1,
  total: 0
})

const logs = ref([]);

const fetchLogs = async () => {
  tableLoading.value = true;
  await getLogs(searchForm).then(res => {
    if (res.data.code === 200) {
      logs.value = res.data.data.records;
      logs.value.forEach(item => {
        item.operationTime = formatDate(new Date(item.operationTime), "YYYY-MM-DD HH:mm:ss");
      })
      page.total = res.data.data.total;
    }
  }).finally(() => {
    tableLoading.value = false;
  })
}

const showDetail = (row) => {
  dialogVisible.value = true;
  selectedRow.value = row;
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
  fetchLogs();
};

const handleReset = () => {
  formRef.value.resetFields();
  timeRange.value = [];
  searchForm.startTime = null;
  searchForm.endTime = null;
  searchForm.pageNum = 1;
  page.currentPage = 1;
  fetchLogs();
};

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const handleDelete = (row) => {
  loading.value = true;
  messageBox(`确定删除编号为${row.id}的日志吗？`, "删除确认", "warning", true)
      .then(async () => {
        const ids = [row.id];
        await deleteLogs(ids).then(res => {
          if (res.data.code === 200) {
            message("删除成功");
            handleReset();
          }
        })
      }).finally(() => {
    loading.value = false;
  })
};

const handleBatchDelete = () => {
  loading.value = true;
  messageBox("确定批量删除选中的日志吗？", "删除确认", "warning", true)
      .then(async () => {
        const ids = selectedRows.value.map((row) => row.id);
        await deleteLogs(ids).then(res => {
          if (res.data.code === 200) {
            message("已删除" + ids.length + "条日志");
            handleReset();
          }
        })
      }).finally(() => {
    loading.value = false;
  })
};

const handleSizeChange = (size) => {
  searchForm.pageSize = size;
  searchForm.pageNum = 1;
  page.currentPage = 1;
  fetchLogs();
};

const handlePageChange = (number) => {
  page.currentPage = number;
  searchForm.pageNum = number;
  fetchLogs();
};

const selectTypeByRole = (role) => {
  // 0-管理员，1-普通用户 2-游客
  switch (role) {
    case 0:
      return "danger";
    case 1:
      return "primary";
    case 2:
      return "info";
    default:
      return "info";
  }
}

const showRoleName = (role) => {
  // 0-管理员，1-普通用户 2-游客
  switch (role) {
    case 0:
      return "管理员";
    case 1:
      return "普通用户";
    case 2:
      return "游客";
    default:
      return "游客";
  }
}

const closeDialog = () => {
  selectedRow.value = null;
  dialogVisible.value = false;
};
const initData = () => {
  fetchLogs();
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