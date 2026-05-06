<template>
  <div class="main-container">
    <!-- 轮播图搜索表单 -->
    <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="状态" style="min-width: 300px;">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option :value="0" label="启用"></el-option>
            <el-option :value="1" label="禁用"></el-option>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form>
    </el-card>

    <!-- 轮播图列表、分页、批量操作 -->
    <el-card>
      <div class="flex items-left mb-3">轮播图列表</div>
      <el-scrollbar height="auto">
        <el-table v-if="banners.length"
                  v-loading="tableLoading"
                  :cell-style="{ 'text-align': 'center'}"
                  :data="banners"
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

              <template v-if="column.slot">
                <el-image
                    :preview-src-list="[row.bannerUrl]"
                    :preview-teleported="true"
                    :show-progress="true"
                    :src="row.bannerUrl"
                    alt="Banner"
                    style="width: 550px;height: 200px"

                >
                  <el-icon>
                    <Picture/>
                  </el-icon>
                </el-image>

                <el-image-viewer v-if="showPreview"
                                 :hide-on-click-modal="true"
                                 :hide-on-press-escape="true"
                                 :infinite="true"
                                 :show-download="true"
                                 :show-rotate="true"
                                 :show-scale="true"
                                 :show-zoom="true"
                                 :url-list="[row.bannerUrl]"
                                 :z-index="9999"
                                 @close="showPreview = false">

                  <el-icon>
                    <Picture/>
                  </el-icon>

                </el-image-viewer>
              </template>

              <template v-else-if="column.prop ==='status'">
                <el-switch v-model="row.status"
                           inline-prompt
                           style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                           @click="(value) => handleStatusChange(row, value)"/>
              </template>


              <template v-else-if="column.prop==='Do'">
                <el-button type="text" @click="handleEdit(row)">编辑</el-button>
                <el-button type="text" @click="handleDelete(row)">删除</el-button>
              </template>

              <template v-else>
                {{ row[column.prop] }}
              </template>


            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!banners.length && !tableLoading" :image-size="200" description="暂无数据"/>

      </el-scrollbar>
      <!-- 批量操作和分页 -->
      <div class="table-footer">
        <div class="flex items-center">
          <el-button :disabled="!selectedRows.length" type="danger" @click="handleBatchDelete">批量删除</el-button>
          <el-button type="primary" @click="handleAddBanner">新增轮播图</el-button>
        </div>
        <el-pagination :current-page="page.currentPage" :page-size="searchForm.pageSize" :page-sizes="[10, 20, 30, 40]"
                       :total="page.total"
                       background
                       layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                       @current-change="handlePageChange"/>
      </div>
    </el-card>
    <!-- 编辑/新增歌单的弹窗 -->
    <el-dialog v-model="dialogVisible" :before-close="cancelEdit" :title="editForm.formTitle" width="600">
      <el-form ref="formRef" :model="editForm" :rules="rules"
               label-position="right"
               label-width="auto"
               style="display: flex; flex-direction: column;"
      >

        <el-form-item v-show="editForm.id" label="轮播图编号" prop="id">
          <el-input v-model="editForm.id" disabled/>
        </el-form-item>

        <el-form-item label="轮播图" prop="bannerUrl" required>
          <el-image
              v-show="editForm.bannerUrl"
              :preview-src-list="[editForm.bannerUrl]"
              :preview-teleported="true"
              :show-progress="true"
              :src="editForm.bannerUrl"
              alt="Banner"
              style="width: 600px;height: 200px;margin-bottom: 10px"
          >
          </el-image>
          <el-button @click="openCropper">上传轮播图</el-button>
        </el-form-item>

        <el-form-item label="状态" prop="status" required>
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option :value="0" label="启用"></el-option>
            <el-option :value="1" label="禁用"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button :loading="loading" type="primary" @click="onSubmit">确定</el-button>
      </span>
      </template>
    </el-dialog>
    <img-cropper ref="imgCropperRef" @crop-complete="handleCropComplete"/>
  </div>

</template>
<script setup>
import {nextTick, onMounted, reactive, ref} from "vue";
import {addBanner, deleteBanners, getBanners, updateBanner} from "../../api/manage.js";
import {message, messageBox} from "../../utils/message.js";
import {Picture} from "@element-plus/icons-vue";
import ImgCropper from "../../layout/components/ImgCropper.vue";

const showPreview = ref(false);

const tableLoading = ref(true);

const loading = ref(false);

const dialogVisible = ref(false);

const imgCropperRef = ref();

const formRef = ref();

const selectedRows = ref([]);

const banners = ref([]);

const rules = reactive({
  bannerUrl: [
    {required: true, message: "请上传轮播图", trigger: "blur"}
  ],
  status: [
    {required: true, message: "请选择状态", trigger: "change"}
  ]
})

const columns = [
  {
    label: "轮播图编号",
    prop: "id",
  },
  {
    label: "轮播图",
    prop: "bannerUrl",
    width: 600,
    slot: true,
  },
  {
    label: "状态",
    prop: "status",
    width: 300,
  },
  {
    label: "操作",
    prop: "Do",
  }
]

const searchForm = reactive({
  status: null,
  pageNum: 1,
  pageSize: 10,
});

const editForm = reactive({
  id: null,
  bannerUrl: null,
  status: null,
  formTitle: "新增轮播图",
});

const page = reactive({
  currentPage: 1,
  total: 0
})

const fetchBanners = async () => {
  tableLoading.value = true;
  await getBanners(searchForm).then(res => {
    if (res.data.code === 200) {
      banners.value = res.data.data.records;
      banners.value.forEach(banner => {
        if (banner.status === 1) {
          banner.status = false;
        }
        if (banner.status === 0) {
          banner.status = true;
        }
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
  fetchBanners();
};

const handleReset = () => {
  searchForm.status = null;
  searchForm.pageNum = 1;
  page.currentPage = 1;
  fetchBanners();
};

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const handleDelete = (row) => {
  loading.value = true;
  messageBox(`确定删除编号为${row.id}的轮播图吗？`, "删除确认", "warning", true)
      .then(() => {
        const ids = [row.id];
        deleteBanners(ids).then(res => {
          if (res.data.code === 200) {
            message("删除成功")
            handleReset();
            fetchBanners();
          }
        })
      }).finally(() => {
    loading.value = false;
  })
};

const handleBatchDelete = () => {
  loading.value = true;
  messageBox("确定批量删除选中的轮播图吗？", "删除确认", "warning", true)
      .then(() => {
        const ids = selectedRows.value.map((row) => row.id);
        deleteBanners(ids).then(res => {
          if (res.data.code === 200) {
            message("已删除" + ids.length + "个轮播图");
            handleReset();
            fetchBanners();
          }
        })
      }).finally(() => {
    loading.value = false;
  })
};

const handleAddBanner = () => {
  dialogVisible.value = true;
  nextTick(() => {
    editForm.formTitle = "新增轮播图";
    editForm.id = null;
    editForm.bannerUrl = null;
    editForm.status = 0;
  })
}

const handleEdit = (row) => {
  dialogVisible.value = true;
  nextTick(() => {
    editForm.id = row.id;
    editForm.bannerUrl = row.bannerUrl;
    editForm.status = row.status ? 0 : 1;
    editForm.formTitle = "编辑轮播图";
  })
};

const openCropper = () => {
  const flag = 4;
  imgCropperRef.value.open(flag);
};

const handleCropComplete = (data) => {
  editForm.bannerUrl = data;
};

const cancelEdit = () => {
  dialogVisible.value = false;
  formRef.value.resetFields();
};

const onSubmit = () => {
  loading.value = true;
  if (editForm.formTitle === "新增轮播图") {
    addBanner(editForm).then(res => {
      if (res.data.code === 200) {
        message("轮播图添加成功！")
        dialogVisible.value = false;
        formRef.value.resetFields();
        fetchBanners();
      }
    })
  }

  if (editForm.formTitle === "编辑轮播图") {
    updateBanner(editForm).then(res => {
      if (res.data.code === 200) {
        message("轮播图修改成功！")
        dialogVisible.value = false;
        formRef.value.resetFields();
        fetchBanners();
      }
    })
  }
};

const handleSizeChange = (size) => {
  searchForm.pageSize = size;
  page.currentPage = 1;
  searchForm.pageNum = 1;
  fetchBanners();
};

const handlePageChange = (number) => {
  page.currentPage = number;
  searchForm.pageNum = number;
  fetchBanners();
};

const handleStatusChange = (row) => {
  const status = row.status ? 0 : 1;
  updateBanner({
    id: row.id,
    status: status
  }).then(res => {
    if (res.data.code === 200) {
      fetchBanners();
      if (status === 0) {
        message("已启用，开始在客户端中展示");
      } else {
        message("已禁用，已不在客户端中展示", 'warning');
      }
    }
  })
}

const initData = () => {
  fetchBanners();
};

onMounted(() => {
  initData();
});

</script>
<style scoped>
.main-container {
  .el-form {
    display: flex;
    text-align: center;
    justify-content: left;
  }
}

.search-form {
  .el-card__body {
    padding-bottom: 10px !important;
  }

  margin-bottom: 20px;
  height: auto;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
}


</style>