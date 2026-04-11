<template>
  <div>
    <!-- 歌单搜索表单 -->
    <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="歌单" style="min-width: 300px;">
          <el-input v-model="searchForm.title" clearable placeholder="请输入歌单名称"/>
        </el-form-item>
        <el-form-item label="风格" style="min-width: 300px;">
          <el-select v-model="searchForm.styleId" clearable placeholder="请选择风格">
            <el-option v-for="item in styleOptions" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form>
    </el-card>
    <!-- 歌单列表、分页、批量操作 -->
    <el-card>
      <div class="flex items-left mb-3">歌单列表</div>
      <el-scrollbar height="auto">
        <el-table v-if="playlists.length"
                  v-loading="TableLoading"
                  :cell-style="{ 'text-align': 'center'}"
                  :data="playlists"
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
                    :preview-src-list="[row.coverUrl]"
                    :preview-teleported="true"
                    :show-progress="true"
                    :src="row.coverUrl"
                    alt="Playlist Cover"
                    loading="lazy"
                    size="small"
                    style="width: 72px;height: 72px"
                >
                  <el-image fit="cover"
                            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
                </el-image>

                <el-image-viewer v-if="showPreview"
                                 :hide-on-click-modal="true"
                                 :hide-on-press-escape="true"
                                 :infinite="true"
                                 :show-download="true"
                                 :show-rotate="true"
                                 :show-scale="true"
                                 :show-zoom="true"
                                 :url-list="[row.coverUrl]"
                                 :z-index="9999"
                                 @close="showPreview = false">
                  <el-icon>
                    <Picture/>
                  </el-icon>
                </el-image-viewer>
              </template>

              <template v-else-if="column.prop==='style'">
                <el-tag size="small">
                  {{ row.style }}
                </el-tag>
              </template>

              <template v-else-if="column.showOverflowTooltip">
                <el-tooltip :content="row[column.prop]" placement="top">
                  <p class="text-desc">{{ row[column.prop] }}</p>
                </el-tooltip>
              </template>

              <template v-else-if="column.prop==='Do'">
                <div class="flex items-center">
                  <el-button type="text" @click="handleEdit(row)">编辑</el-button>
                  <el-button type="text" @click="handleDelete(row)">删除</el-button>
                  <el-dropdown placement="bottom" style="margin-left: 10px;">
                    <el-button type="text">...</el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="openCropper(row)">上传封面</el-dropdown-item>
                        <el-dropdown-item @click="addSongToPlaylist(row)">添加歌曲</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>

                </div>
              </template>

              <template v-else>
                {{ row[column.prop] }}
              </template>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!playlists.length && !TableLoading" :image-size="200" description="暂无数据"/>

      </el-scrollbar>
      <!-- 批量操作和分页 -->
      <div class="table-footer">
        <div class="flex items-center">
          <el-button :disabled="!selectedRows.length" type="danger" @click="handleBatchDelete">批量删除</el-button>
          <el-button type="primary" @click="handleAddPlaylist">新增歌单</el-button>
        </div>
        <el-pagination :current-page="page.currentPage" :page-size="searchForm.pageSize" :page-sizes="[10, 20, 30, 40]"
                       :total="page.total"
                       background
                       layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                       @current-change="handlePageChange"/>
      </div>
    </el-card>

    <!-- 编辑/新增歌单的弹窗 -->
    <el-dialog v-model="playlistDialogVisible" :before-close="cancelEdit" :title="editForm.formTitle" width="600">
      <el-form ref="playlistFormRef" :model="editForm" :rules="rules"
               label-position="right"
               label-width="auto">

        <el-form-item v-show="editForm.id" label="歌单编号" prop="id">
          <el-input v-model="editForm.id" disabled/>
        </el-form-item>

        <el-form-item label="歌单" prop="title" required>
          <el-input v-model="editForm.title" clearable placeholder="请输入歌单"/>
        </el-form-item>

        <el-form-item label="风格" prop="styleId">
          <el-select
              v-model="editForm.styleId"
              :options="styleOptions"
              clearable
              placeholder="请选择风格(单选)"
          />
        </el-form-item>
        <el-form-item label="简介" prop="introduction">
          <el-input v-model="editForm.introduction" :autosize="{minRows: 3, maxRows: 6}" placeholder="请输入简介"
                    size="large" type="textarea"/>
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button :loading="loading" type="primary" @click="onSubmit">确定</el-button>
      </span>
      </template>
    </el-dialog>

    <!-- 向歌单中添加歌曲的弹窗 -->
    <el-dialog v-model="addSongDialogVisible" :before-close="cancelAddSong" class="add-song-form" title="为歌单添加歌曲"
               width="400">
      <el-form ref="addSongFormRef" :model="addSongForm" label-position="right" label-width="auto">
        <el-form-item label="歌单id" prop="playlistId">
          <el-input v-model="addSongForm.playlistId" disabled/>
        </el-form-item>
        <el-form-item label="选择歌曲" prop="songIds">
          <div class="flex flex-wrap">
            <el-select
                v-model="addSongForm.songIds"
                :loading="loading"
                :max-collapse-tags="5"
                :reserve-keyword="false"
                :tag-tooltip="{
                    placement: 'right',
                  }"
                collapse-tags
                collapse-tags-tooltip
                filterable
                multiple
                placeholder="请输入歌名以选择歌曲（多选）"
                placement="bottom"
                popper-style="width:300px;max-height:500px;overflow: auto"
                @input="handleInput"
            >
              <el-option
                  v-for="item in songOptions"
                  :key="item.id"
                  :label="item.artistName + ' - ' +item.name"
                  :value="item.id"
              />
            </el-select>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
        <el-button @click="cancelAddSong">取消</el-button>
        <el-button :loading="loading" type="primary" @click="onAddSong">确定</el-button>
      </span>
      </template>
    </el-dialog>

    <img-cropper ref="imgCropperRef"/>
  </div>
</template>

<script setup>
import {nextTick, onMounted, reactive, ref} from "vue";
import ImgCropper from "../../layout/components/ImgCropper.vue";
import {
  addPlaylist,
  deletePlaylists,
  getPlaylists,
  getSongList,
  getSongsOfPlaylist,
  updatePlaylist,
  updateSongToPlaylist
} from "../../api/manage.js";
import {message, messageBox} from "../../utils/message.js";
import {Picture} from "@element-plus/icons-vue";


const TableLoading = ref(true);

const loading = ref(false);

const showPreview = ref(false);

const addSongDialogVisible = ref(false);

const playlistDialogVisible = ref(false);

const imgCropperRef = ref();

const playlistFormRef = ref();

const addSongFormRef = ref();

const selectedRows = ref([]);

const playlists = ref([])

const songList = ref([])

const columns = [
  {
    label: "歌单编号",
    prop: "id",
    width: 80,
  },
  {
    label: "封面",
    prop: "coverUrl",
    slot: true,
    width: 100,
  },
  {
    label: "歌单",
    prop: "title",
    width: 350,
  },
  {
    label: "风格",
    prop: "style",
    width: 100,
  },
  {
    label: "简介",
    prop: "introduction",
    width: 500,
    showOverflowTooltip: true,
  },
  {
    label: "操作",
    prop: "Do",
  }
]

const styleOptions = [
  {
    label: "乡村",
    value: 1
  },
  {
    label: "华语流行",
    value: 2
  },
  {
    label: "原声带",
    value: 3
  },
  {
    label: "古典",
    value: 4
  },
  {
    label: "嘻哈说唱",
    value: 5
  },
  {
    label: "国风",
    value: 6
  },
  {
    label: "国风流行",
    value: 7
  },
  {
    label: "摇滚",
    value: 8
  },
  {
    label: "日本流行",
    value: 9
  },
  {
    label: "朋克",
    value: 10
  },
  {
    label: "欧美流行",
    value: 11
  },
  {
    label: "电子",
    value: 12
  },
  {
    label: "粤语流行",
    value: 13
  },
  {
    label: "节奏布鲁斯",
    value: 14
  },
  {
    label: "轻音乐",
    value: 15
  },
  {
    label: "非洲节拍",
    value: 16
  },
  {
    label: "韩国流行",
    value: 17
  },
]

const songOptions = ref([]);

const rules = {
  title: [
    {required: true, message: '请输入歌单名称', trigger: 'blur'},
    {min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur'}
  ],
  styleId: [
    {required: true, message: '请选择风格', trigger: 'blur'},
  ],
}

const searchForm = reactive({
  title: null,
  styleId: null,
  pageNum: 1,
  pageSize: 10,
});

const editForm = reactive({
  id: null,
  title: null,
  styleId: null,
  introduction: null,
  formTitle: null
});

const addSongForm = reactive({
  songIds: null,
  playlistId: null
})

const searchSongForm = reactive({
  name: null,
})

const page = reactive({
  currentPage: 1,
  total: 0
})

const fetchPlaylists = () => {
  TableLoading.value = true;
  getPlaylists(searchForm).then(res => {
    if (res.data.code === 200) {
      playlists.value = res.data.data.records;
      page.total = res.data.data.total;
    }
  }).finally(() => {
    TableLoading.value = false;
  });
}

const handleSearch = () => {
  searchForm.pageNum = 1;
  fetchPlaylists();
};

const handleReset = () => {
  searchForm.title = null;
  searchForm.style = null;
  fetchPlaylists();
};

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const handleEdit = (row) => {
  playlistDialogVisible.value = true;
  nextTick(() => {
    editForm.id = row.id; // 必须使用v-show，v-if会改变dom结构，导致无法获取到元素
    editForm.title = row.title;
    editForm.style = row.style;
    editForm.styleId = styleOptions.find(item => item.label === row.style).value;
    editForm.introduction = row.introduction;
    editForm.formTitle = '编辑歌单';
  })
};

const cancelEdit = () => {
  playlistDialogVisible.value = false;
  playlistFormRef.value.resetFields();
  return 'done' // element-plus要求返回done
};

const onSubmit = () => {
  loading.value = true;
  playlistFormRef.value.validate().then((valid) => {
    if (!valid) {
      return false;
    }
    if (editForm.formTitle === '编辑歌单') {
      updatePlaylist(editForm).then(res => {
        if (res.data.code === 200) {
          message("歌单编号" + editForm.id + "的信息修改成功！")
          playlistDialogVisible.value = false;
          playlistFormRef.value.resetFields();
          fetchPlaylists();
        }
      })
    }
    if (editForm.formTitle === '新增歌单') {
      addPlaylist(editForm).then(res => {
        if (res.data.code === 200) {
          message("歌单" + "《" + editForm.title + "》" + "添加成功！")
          playlistDialogVisible.value = false;
          playlistFormRef.value.resetFields();
          fetchPlaylists();
          messageBox("是否向歌单中添加歌曲？", "提示", "warning", true).then(() => {
            addSongDialogVisible.value = true;
          })
        }
      })
    }
  }).finally(() => {
    loading.value = false;
  });
};

const handleDelete = (row) => {
  loading.value = true;
  messageBox(`确定删除编号为${row.id}的歌单《${row.title}》吗？用户收藏的对应歌单也将被删除！`, "删除确认", "warning", true)
      .then(() => {
        const ids = [row.id];
        deletePlaylists(ids).then(res => {
          if (res.data.code === 200) {
            message("删除成功")
            fetchPlaylists();
          }
        })
      }).finally(() => {
    loading.value = false;
  })
};

const openCropper = (row) => {
  imgCropperRef.value.open(3);
  editForm.id = row.id;
};


const addSongToPlaylist = (row) => {
  addSongDialogVisible.value = true;
  nextTick(async () => {
    addSongForm.playlistId = row.id;
    if (songList.value.length === 0) {
      await getAllSongs();
    }
    await getSongsOfPlaylist({id: row.id}).then(res => {
      addSongForm.songIds = res.data.data;
    })
    songOptions.value = songList.value;
  })
};

const handleInput = (input) => {
  const query = input.data;
  loading.value = true;
  if (query) {
    songOptions.value = songList.value.filter(item => item.name.includes(query));
  } else {
    songOptions.value = songList.value;
  }
  loading.value = false;
};

const getAllSongs = async () => {
  await getSongList(searchSongForm).then(res => {
    if (res.data.code === 200) {
      songList.value = res.data.data.records;
    }
  })
};

const cancelAddSong = () => {
  addSongDialogVisible.value = false;
  addSongFormRef.value.resetFields();
  return 'done' // element-plus要求返回done
};

const onAddSong = () => {
  loading.value = true;
  updateSongToPlaylist(addSongForm).then(res => {
    if (res.data.code === 200) {
      message(`id为${addSongForm.playlistId}的歌单已含有${addSongForm.songIds.length}首歌曲！`);
      addSongDialogVisible.value = false;
      addSongFormRef.value.resetFields();
      fetchPlaylists();
    }
  }).finally(() => {
    loading.value = false;
  });
};

const handleBatchDelete = () => {
  loading.value = true;
  messageBox("确定批量删除选中的歌单吗？歌单对应的歌曲、用户收藏都会被删除！", "删除确认", "warning", true)
      .then(() => {
        const ids = selectedRows.value.map((row) => row.id);
        deletePlaylists(ids).then(res => {
          if (res.data.code === 200) {
            message("已删除" + ids.length + "个歌单");
            fetchPlaylists();
          }
        })
      }).finally(() => {
    loading.value = false;
  })
};

const handleAddPlaylist = () => {
  playlistDialogVisible.value = true;
  nextTick(() => {
    editForm.formTitle = '新增歌单';
  })
};

const handleSizeChange = (size) => {
  searchForm.pageSize = size;
  fetchPlaylists();
};

const handlePageChange = (number) => {
  page.currentPage = number;
  searchForm.pageNum = number;
  fetchPlaylists();
};

const initData = () => {
  fetchPlaylists();
};

onMounted(() => {
  initData();
});

</script>
<style scoped>

.search-form {
  .el-card__body {
    padding-bottom: 10px !important;
  }

  .el-form {
    display: flex;
    text-align: center;
    justify-content: left;
  }

  margin-bottom: 20px;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
}

.text-desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-song-form {
  .el-input {
    width: 300px;
  }

  .el-select {
    width: 300px;
  }
}

</style>