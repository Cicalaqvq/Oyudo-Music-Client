<template>
  <div>
    <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="歌手">
          <el-input v-model="searchForm.name" clearable placeholder="请输入歌手姓名"/>
        </el-form-item>
        <el-form-item label="国籍">
          <el-input v-model="searchForm.area" clearable placeholder="请输入歌手国籍"/>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.gender" clearable placeholder="请选择类型">
            <el-option :value="0" label="男歌手"/>
            <el-option :value="1" label="女歌手"/>
            <el-option :value="2" label="组合/乐队"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 歌手列表 -->
    <el-card>
      <div class="flex items-left mb-3">歌手列表</div>
      <el-scrollbar height="auto">
        <el-table v-if="artistList.length" v-loading="loading"
                  :cell-style="{ 'text-align': 'center' }" :data="artistList"
                  :header-cell-style="{ 'text-align': 'center' }"
                  :row-style="{'height': 'auto'}"
                  element-loading-text="Loading..."
                  height="613" style="width: 100%;font-size: 12px"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50"/>
          <el-table-column v-for="column in columns" :key="column.prop" :label="column.label" :prop="column.prop"
                           :width="column.width || 'auto'">
            <template #default="{ row }">
              <el-avatar v-if="column.slot" :src="row.avatar" alt="User Avatar" size="large">
                <el-image fit="cover"
                          size="small"
                          src="https://img.tukuppt.com/png_preview/00/36/36/Fdv2RXQpcV.jpg!/fw/780"
                />
              </el-avatar>
              <template v-else-if="column.prop==='gender'">
                <el-tag v-if="row.gender===0" type="primary">男歌手</el-tag>
                <el-tag v-else-if="row.gender===1" type="danger">女歌手</el-tag>
                <el-tag v-else-if="row.gender===2" type="success">组合/乐队</el-tag>
                <el-tag v-else type="info">未指定</el-tag>
              </template>
              <template v-else-if="column.showOverflowTooltip">
                <el-tooltip :content="row[column.prop]" placement="top">
                  <p class="descStyle">{{ row[column.prop] }}</p>
                </el-tooltip>
              </template>
              <template v-else>
                {{ row[column.prop] }}
              </template>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="auto">
            <template #default="{ row }">
              <el-button size="small" type="text" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="text" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!artistList.length && !loading" :image-size="200" description="暂无数据"/>

        <!-- 批量操作和分页 -->
        <div class="table-footer">
          <div class="flex items-center">
            <el-button :disabled="!selectedRows.length" type="danger" @click="handleBatchDelete">批量删除</el-button>
            <el-button type="primary" @click="handleAddArtist">新增歌手</el-button>
          </div>
          <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 30, 40]" :total="total"
                         background
                         layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                         @current-change="handlePageChange"/>
        </div>
      </el-scrollbar>
    </el-card>
    <!-- 编辑/新增歌手的弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editForm.formTitle" destroy-on-close width="500">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="auto">
        <el-form-item label="头像">

          <el-image v-if="editForm.avatar" :src="editForm.avatar" fit="cover"
                    style="width: 80px; height: 80px; border-radius: 50%;"/>
          <el-button v-if="editForm.avatar" class="ml-2" @click="openCropper">修改头像</el-button>
          <el-button v-else @click="openCropper">上传头像</el-button>
          <img-cropper ref="ImgCropperRef" @crop-complete="handleCropComplete"/>
        </el-form-item>
        <el-form-item label="歌手姓名" prop="name" required>
          <el-input v-model="editForm.name" placeholder="请输入歌手姓名"/>
        </el-form-item>
        <el-form-item label="类型" prop="gender">
          <el-select v-model="editForm.gender" clearable placeholder="请选择类型">
            <el-option :value="0" label="男歌手"/>
            <el-option :value="1" label="女歌手"/>
            <el-option :value="2" label="组合/乐队"/>
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="birth">
          <div class="demo-date-picker">
            <div class="block">
              <el-date-picker
                  v-model="editForm.birth"
                  placeholder="请选择生日"
                  size="default"
                  type="date"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="国籍" prop="area">
          <el-input v-model="editForm.area" placeholder="请输入国籍"/>
        </el-form-item>
        <el-form-item label="简介" prop="introduction">
          <el-input v-model="editForm.introduction" :autosize="{minRows: 2, maxRows: 6}" placeholder="请输入简介"
                    size="large"
                    type="textarea"/>
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button :loading="switchLoading" type="primary" @click="onSubmit">确定</el-button>
      </span>
      </template>
    </el-dialog>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import {message, messageBox} from "../../utils/message.js";
import {formatDate} from "@vueuse/shared";
import ImgCropper from "../../layout/components/ImgCropper.vue";
import {addArtist, deleteArtists, getArtistList, updateArtist} from "../../api/manage.js";

// 编辑弹窗表单数据
const dialogVisible = ref(false)

const editForm = reactive({
  id: null,
  formTitle: null,
  avatar: null,
  name: null,
  gender: null,
  birth: null,
  area: null,
  introduction: null,
});

const rules = {
  name: [
    {required: true, message: "请输入歌手名称", trigger: "blur"},
    {min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur"},
  ],
}

const formRef = ref();

// 搜索表单数据
const searchForm = reactive({
  name: null,
  area: null,
  gender: null,
  pageSize: 10,
  pageNum: 1,
});

// 歌手列表数据
const artistList = ref([]);
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
const loading = ref(true);
const switchLoading = ref(false);

// 表格列配置
const columns = [
  {label: "歌手编号", prop: "id"},
  {label: "歌手头像", prop: "avatar", slot: true, width: 100},
  {label: "歌手", prop: "name", width: 200},
  {label: "类型", prop: "gender", width: 100},
  {label: "生日", prop: "birth", width: 150},
  {label: "国籍", prop: "area", width: 90},
  {label: "简介", prop: "introduction", width: 340, showOverflowTooltip: true},
];

// 选中行数据
const selectedRows = ref([]);

// 获取歌手数据
const fetchArtistList = async () => {
  loading.value = true;
  getArtistList(searchForm).then(res => {
    artistList.value = res.data.data.records;
    artistList.value.forEach(item => {
      item.birth = formatDate(new Date(item.birth), "YYYY-MM-DD");
    });
    total.value = res.data.data.total;
  }).finally(() => {
    loading.value = false;
  })
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchArtistList();
};

// 重置
const handleReset = () => {
  searchForm.name = null;
  searchForm.area = null;
  searchForm.gender = null;
  handleSearch();
};

// 图片裁剪与上传
const ImgCropperRef = ref(false);
const flag = ref(1);

const openCropper = () => {
  ImgCropperRef.value.open(editForm.avatar, flag)
};

const handleCropComplete = (imgUrl) => {
  editForm.avatar = imgUrl;
};

// 编辑
const handleEdit = (row) => {
  dialogVisible.value = true;
  editForm.id = row.id;
  editForm.avatar = row.avatar;
  editForm.formTitle = "编辑歌手";
  editForm.name = row.name;
  editForm.gender = row.gender;
  editForm.birth = row.birth;
  editForm.area = row.area;
  editForm.introduction = row.introduction;
};

const cancelEdit = () => {
  dialogVisible.value = false;
  ImgCropperRef.value.close();
};

const onSubmit = () => {
  switchLoading.value = true;
  formRef.value.validate().then((valid) => {
    if (!valid) {
      return false;
    }
    if (editForm.formTitle === "编辑歌手") {
      updateArtist(editForm).then(res => {
        if (res.data.code === 200) {
          message("歌手信息修改成功！")
          dialogVisible.value = false;
          fetchArtistList();
        }
      })
    }
    if (editForm.formTitle === "新增歌手") {
      addArtist(editForm).then(res => {
        if (res.data.code === 200) {
          message("歌手" + editForm.name + "添加成功！")
          dialogVisible.value = false;
          fetchArtistList();
        }
      })
    }
  }).finally(() => {
    switchLoading.value = false;
  })
};

// 删除
const handleDelete = (row) => {
  messageBox(`确定删除编号为${row.id}的歌手${row.name}吗？歌手对应的歌曲、歌单、用户收藏都会被删除！`, "删除确认", "warning", true)
      .then(() => {
        const ids = [row.id];
        deleteArtists(ids).then(res => {
          if (res.data.code === 200) {
            message("歌手已删除！")
            fetchArtistList();
          }
        })
      })
      .catch(() => {
        message("已取消删除", "info");
      });
};

// 批量删除
const handleBatchDelete = () => {
  messageBox("确定批量删除选中的歌手吗？歌手对应的歌曲、歌单、用户收藏都会被删除！", "删除确认", "warning", true)
      .then(() => {
        const ids = selectedRows.value.map((row) => row.id);
        deleteArtists(ids).then(res => {
          if (res.data.code === 200) {
            message("歌手已删除！")
            fetchArtistList();
          }
        })
      })
      .catch(() => {
        message("已取消删除", "info");
      });
};

// 新增用户
const handleAddArtist = () => {
  dialogVisible.value = true;
  editForm.formTitle = "新增歌手";
  editForm.name = null;
  editForm.gender = null;
  editForm.avatar = null;
  editForm.area = null;
  editForm.birth = null;
  editForm.introduction = null;
};

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  searchForm.pageNum = page;
  fetchArtistList();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  searchForm.pageSize = size;
  fetchArtistList();
};

// 监听选中行变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 初始化数据
onMounted(() => {
  fetchArtistList();
});
</script>

<style scoped>

.search-form {
  margin-bottom: 20px;
  height: auto;

  .el-form {
    display: flex;
  }

  .el-input {
    min-width: 300px;
  }

  .el-select {
    min-width: 200px;
  }
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.descStyle {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>