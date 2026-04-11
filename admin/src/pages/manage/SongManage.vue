<template>
  <div>
    <el-row :gutter="30">
      <el-col :span="5">
        <!-- 歌手搜索表单 -->
        <el-card>
          <el-form>
            <el-form-item prop="name" size="default">
              <el-input v-model="searchArtistForm.name" clearable placeholder="请输入歌手姓名"
                        @clear="handleResetArtist"
                        @input="handleSearchArtist">
              </el-input>
            </el-form-item>
          </el-form>

          <!--歌手列表 -->
          <el-scrollbar height="auto">
            <el-table
                v-loading="tableLoading"
                :allow-drag-last-column="true"
                :cell-style="{'border-bottom': 'none','text-align': 'left','padding': '5px'}"
                :data="artistListReview"
                :header-cell-style="{ 'text-align': 'left' }"
                :row-style="{'height': 'auto'}"
                :show-header="false"
                :size="'small'"
                element-loading-text="Loading..."
                height="738"
                highlight-current-row
                style="width: 100%;font-size: 12px;text-align: left"
                @row-click="handleArtistClick"
            >
              <el-table-column>
                <template #default="{ row }">
                  <el-icon>
                    <UserFilled/>
                  </el-icon>
                  <span style="margin-left: 10px" v-html="highlightSearchText(row.name,searchArtistForm.name)"></span>
                </template>
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </el-card>
      </el-col>
      <el-col :span="19">
        <div class="main-container">
          <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
            <!-- 歌曲搜索表单 -->
            <el-form :inline="true" :model="searchSongForm">
              <el-form-item label="歌名">
                <el-input v-model="searchSongForm.name" clearable placeholder="请输入歌名"/>
              </el-form-item>
              <el-form-item label="专辑">
                <el-input v-model="searchSongForm.album" clearable placeholder="请输入专辑"/>
              </el-form-item>
              <el-button type="primary" @click="handleSearchSongs">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form>
          </el-card>

          <el-card>
            <!-- 歌曲列表 -->
            <div class="flex items-left mb-3">歌曲列表 (在对歌曲进行操作前，请先在左侧选择歌手)</div>
            <el-scrollbar height="auto">
              <el-table v-if="songList.length"
                        v-loading="tableLoading"
                        :cell-style="{ 'text-align': 'center'}"
                        :data="songList"
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
                                 :show-overflow-tooltip="column.showOverflowTooltip"
                                 :width="column.width || 'auto'"
                >

                  <template #default="{ row }">
                    <template v-if="column.slot">
                      <el-image
                          :preview-src-list="[row.coverUrl]"
                          :preview-teleported="true"
                          :show-progress="true"
                          :src="row.coverUrl"
                          alt="Song Cover"
                          size="small"
                          style="width: 72px;height: 72px"
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
                                       :url-list="[row.coverUrl]"
                                       :z-index="9999"
                                       @close="showPreview = false">

                        <el-icon>
                          <Picture/>
                        </el-icon>

                      </el-image-viewer>

                    </template>

                    <template v-else-if="column.prop==='style'">
                      <el-tag v-for="tag in row.style.split(',')" :key="tag" size="small" style="margin-right: 5px;">
                        {{ tag.trim() }}
                      </el-tag>
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
                              <el-dropdown-item @click="openUploadAudio(row)">上传音频
                              </el-dropdown-item>
                              <el-dropdown-item @click="handlePlay(row)">浏览音频</el-dropdown-item>
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
              <el-empty v-if="!songList.length && !tableLoading" :image-size="200" description="暂无数据"/>
            </el-scrollbar>

            <!-- 批量操作和分页 -->
            <div class="table-footer">
              <div class="flex items-center">
                <el-button :disabled="!selectedRows.length" type="danger" @click="handleBatchDelete">批量删除
                </el-button>
                <el-button type="primary" @click="handleAddSong">新增歌曲</el-button>
              </div>
              <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 30, 40]"
                             :total="total"
                             background
                             layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                             @current-change="handlePageChange"/>
            </div>
          </el-card>
        </div>

      </el-col>
    </el-row>

    <!-- 播放歌曲的弹窗 -->
    <el-dialog v-model="audioPlayDialogVisible" :modal="false" align-center destroy-on-close draggable modal-penetrable
               title="浏览歌曲" width="600">
      <div style="display:inline-block;text-align:center;justify-content: center;min-width: 100%">
        <div style="border-bottom: #c2c2c2 1px solid;padding-bottom: 20px">
          正在播放：{{ audioPreview.artist }} - {{ audioPreview.name }}
        </div>
        <audio :src="audioPreview.url" autoplay controls style="margin-top: 20px;min-width: 100%;"/>
      </div>
      <template #footer>
        <el-button @click="audioPlayDialogVisible = false, audioUploadForm.songId = null">关闭</el-button>
        <el-button type="primary" @click="handleEditAudio">修改音频</el-button>
      </template>
    </el-dialog>

    <!-- 上传音频文件的弹窗 -->
    <el-dialog v-model="audioUploadDialogVisible"
               destroy-on-close
               title="上传音频文件"
               width="530"
    >
      <el-form ref="audioUploadFormRef" :model="audioUploadForm" :rules="rules">
        <el-form-item prop="audioUrl" size="default" style="width: auto">
          <el-upload
              ref="audioUploadRef"
              :auto-upload="false"
              :class="{'hide-upload': isHideUpload}"
              :limit="1"
              :on-change="handleOnChange"
              :on-remove="handleRemove"
              :show-file-list="true"
              accept=".mp3,.flac,.wav"
              drag
              style="min-width: 500px"
          >
            <el-icon class="el-icon--upload">
              <upload-filled/>
            </el-icon>
            <div class="el-upload__text">
              点击或拖拽上传音频文件，仅支持mp3、flac、wav格式
            </div>
          </el-upload>
          <div v-if="audioPreview.url" style="margin-top: 20px;min-width: 100%">
            <div style="text-align: left;padding-left: 20px">若需重新上传可选择文件列表进行删除</div>
            <audio ref="audioRef" :src="audioPreview.url" controls style="min-width: 100%" @canplay="getDuration"/>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleRemoveButton">取消</el-button>
        <el-button :loading="loading" type="primary" @click="handleUploadAudio">确认上传</el-button>
      </template>
    </el-dialog>

    <!-- 编辑/新增歌曲的弹窗 -->
    <el-dialog v-model="dialogVisible" :before-close="cancelEdit" :title="editForm.formTitle" width="500">
      <el-form ref="editFormRef" :inline="true" :model="editForm" :rules="rules" class="form-inline"
               label-position="top"
               label-width="auto">
        <el-form-item label="歌手姓名" prop="artistName" required>
          <el-input v-model="editForm.artistName" disabled placeholder="若为空请先选择歌手"/>
        </el-form-item>
        <el-form-item label="歌名" prop="name" required>
          <el-input v-model="editForm.name" placeholder="请输入歌曲名称"/>
        </el-form-item>
        <el-form-item label="专辑" prop="album" required>
          <el-input v-model="editForm.album" placeholder="请输入专辑名称"/>
        </el-form-item>
        <el-form-item label="发布日期" prop="releaseTime">
          <el-date-picker
              v-model="editForm.releaseTime"
              placeholder="选择日期"
              size="default"
              type="date"
          />
        </el-form-item>
        <el-form-item label="类型" prop="styleIds" required>
          <el-select-v2
              v-model="editForm.styleIds"
              :options="styleList"
              class="form-inline"
              clearable
              multiple
              placeholder="请选择曲风(可多选)"
          />
        </el-form-item>

      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button :loading="loading" type="primary" @click="onSubmit">确定</el-button>
      </span>
      </template>
    </el-dialog>

    <img-cropper ref="ImgCropperRef" @crop-complete="handleCropComplete"/>
  </div>
</template>

<script setup>
import {nextTick, onMounted, reactive, ref} from "vue";
import {message, messageBox, notification} from "../../utils/message.js";
import {formatDate} from "@vueuse/shared";
import ImgCropper from "../../layout/components/ImgCropper.vue";
import {addSong, deleteSongs, getArtistList, getSongList, updateSong, uploadAudio} from "../../api/manage.js";
import {Picture} from "@element-plus/icons-vue";

// 风格列表常量
const styleList = [
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

// 图片预览
const showPreview = ref(false)

// 编辑弹窗表单数据
const dialogVisible = ref(false)

const editFormRef = ref();

const editForm = reactive({
  id: null,
  coverUrl: null,
  name: null,
  artistName: null,
  artistId: null,
  album: null,
  styleIds: [],
  releaseTime: null,
  formTitle: null
});

const rules = {
  name: [
    {required: true, message: "请输入歌名", trigger: "blur"},
  ],
  album: [
    {required: true, message: "请输入专辑", trigger: "blur"},
  ],
  styleIds: [
    {required: true, message: "请选择曲风", trigger: "blur"},
  ],
  releaseTime: [
    {required: true, message: "请选择发布日期", trigger: "blur"},
  ],
  audioUrl: [
    {required: true, message: "请上传歌曲", trigger: "blur"},
  ],
  artistName: [
    {required: true, message: "请先在左侧选择歌手", trigger: "blur"},
  ],
}

// 搜索表单数据
const searchArtistForm = reactive({
  name: null,
  isSearched: false,
});

const searchSongForm = reactive({
  artistId: null,
  name: null,
  album: null,
  pageSize: 10,
  pageNum: 1,
});

// 歌曲列表数据
const songList = ref([]);
// 歌手列表数据
const artistList = ref([]);
// 歌手列表预览数据
const artistListReview = ref([]);
// 分页数据
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
// 加载中标志
const tableLoading = ref(true);
const loading = ref(false);

// 表格列配置
const columns = [
  {label: "歌曲编号", prop: "id"},
  {label: "封面", prop: "coverUrl", slot: true},
  {label: "歌名", prop: "name", showOverflowTooltip: true},
  {label: "歌手", prop: "artistName", showOverflowTooltip: true},
  {label: "专辑", prop: "album", showOverflowTooltip: true},
  {label: "曲风", prop: "style"},
  {label: "发布日期", prop: "releaseTime"},
  {label: "操作", prop: 'Do'},
];

// 选中行数据
const selectedRows = ref([]);
// 选中歌手暂存
const selectedArtist = ref();


// 获取歌手数据
const fetchArtistList = async () => {
  tableLoading.value = true;
  try {
    const res = await getArtistList(searchArtistForm);
    if (res.data.code === 200) {
      artistList.value = res.data.data.records;
      artistListReview.value = artistList.value;
    }
  } finally {
    tableLoading.value = false;
  }
};

// 获取歌曲数据
const fetchSongList = async () => {
  tableLoading.value = true;
  try {
    const res = await getSongList(searchSongForm);
    if (res.data.code === 200) {
      songList.value = res.data.data.records;
      total.value = res.data.data.total;
      songList.value.forEach(item => {
        item.releaseTime = formatDate(new Date(item.releaseTime), "YYYY-MM-DD");
        // item.artistName = artistList.value.find(artist => artist.id === item.artistId).name;
      });
    }
  } finally {
    tableLoading.value = false;
  }
};

// 搜索歌曲
const handleSearchSongs = () => {
  currentPage.value = 1;
  fetchSongList();
};

// 搜索歌手
const handleSearchArtist = () => {
  if (artistList.value.length === 0) {
    fetchArtistList();
  }
  artistListReview.value = artistList.value.filter(item => item.name.includes(searchArtistForm.name));
};

// 重置歌手搜索条件
const handleResetArtist = () => {
  searchArtistForm.name = ''; // 不能为null
  handleSearchArtist();
};


// 重置歌曲搜索条件
const handleReset = () => {
  searchSongForm.name = null;
  searchSongForm.album = null;
  handleSearchSongs();
};

// 图片裁剪与上传准备
const ImgCropperRef = ref();
const flag = ref(2);

// 上传图片并打开裁剪界面
const openCropper = (row) => {
  ImgCropperRef.value.open(flag);
  editForm.id = row.id;
};

// 剪裁完成并上传到服务器后，更新歌曲封面数据
const handleCropComplete = (imgUrl) => {
  updateSong({
    id: editForm.id,
    coverUrl: imgUrl
  }).then(res => {
    if (res.data.code === 200) {
      message("歌曲封面已更新！");
      fetchSongList();
    }
  })
};


// 打开编辑页面
const handleEdit = (row) => {
  dialogVisible.value = true;
  nextTick(() => {
    editForm.id = row.id;
    editForm.formTitle = "编辑歌曲";
    editForm.name = row.name;
    editForm.artistName = row.artistName;
    editForm.artistId = row.artistId;
    editForm.album = row.album;
    // 获取曲风数据
    editForm.styleIds = [];
    if (row.style) {
      const styleNames = row.style.split(',');
      styleNames.forEach(styleName => {
        const styleItem = styleList.find(item => item.label === styleName);
        if (styleItem) {
          editForm.styleIds.push(styleItem.value);
        }
      });
    }
    editForm.releaseTime = row.releaseTime;
  })

};

// 取消编辑
const cancelEdit = () => {
  dialogVisible.value = false;
  editFormRef.value.resetFields();
};

// 提交表单
const onSubmit = () => {
  loading.value = true;
  editFormRef.value.validate().then((valid) => {
    if (!valid) {
      return false;
    }
    if (editForm.formTitle === "编辑歌曲") {
      updateSong(editForm).then(res => {
        if (res.data.code === 200) {
          message("歌曲信息修改成功！")
          cancelEdit();
          fetchSongList();
        }
      })
    }
    if (editForm.formTitle === "新增歌曲") {
      addSong(editForm).then(res => {
        if (res.data.code === 200) {
          message("歌曲增加成功！")
          cancelEdit();
          messageBox("是否继续添加歌曲？", "提示", "warning", true).then(() => {
            audioUploadDialogVisible.value = true;
          }).finally(() => {
            fetchSongList();
          })
        }
      })
    }
  }).finally(() => {
    loading.value = false;
  })
};

// 删除
const handleDelete = (row) => {
  messageBox(`确定删除编号为${row.id}的歌曲《${row.name}》吗？ 歌单对应曲目、用户收藏对应曲目都会被删除！`, "删除确认", "warning", true)
      .then(() => {
        const ids = [row.id];
        deleteSongs(ids).then(res => {
          if (res.data.code === 200) {
            message("歌曲已删除！")
            fetchSongList();
          }
        })
      })
      .catch(() => {
        message("已取消删除", "info");
      });
};

// 批量删除
const handleBatchDelete = () => {
  messageBox("确定批量删除选中的歌曲吗？歌单对应曲目、用户收藏对应曲目都会被删除", "删除确认", "warning", true)
      .then(() => {
        const ids = selectedRows.value.map((row) => row.id);
        deleteSongs(ids).then(res => {
          if (res.data.code === 200) {
            message("歌曲已删除！")
            fetchSongList();
          }
        })
      })
      .catch(() => {
        message("已取消删除", "info");
      });
};

// 歌曲相关操作
const audioPlayDialogVisible = ref(false);
const audioUploadDialogVisible = ref(false);
const audioUploadRef = ref()
const audioUploadFormRef = ref()
const isHideUpload = ref(false)
const audioUploadForm = reactive({
  file: null,
  songId: null,
  duration: null,
});
const audioPreview = reactive({
  url: null,
  name: null,
  artist: null,
  id: null,
});
// 打开上传音频页面
const openUploadAudio = (row) => {
  audioUploadDialogVisible.value = true;
  nextTick(() => {
    if (row) {
      audioUploadForm.songId = row.id;
    }
  })
};
// 在浏览音频页面中打开上传音频页面
const handleEditAudio = () => {
  audioPlayDialogVisible.value = false;
  audioUploadForm.songId = audioPreview.id;
  Object.keys(audioPreview).forEach(key => delete audioPreview[key]);
  openUploadAudio();
};
// 浏览音频
const handlePlay = (row) => {
  if (!row.audioUrl) {
    messageBox("是否上传？", "暂无歌曲文件", "warning").then(() => {
      openUploadAudio(row);
    })
  } else {
    audioPlayDialogVisible.value = true;
    nextTick(() => {
      Object.assign(audioPreview, {
        url: row.audioUrl,
        name: row.name,
        artist: row.artistName,
        id: row.id,
      });
    })
  }
};
// 前端上传音频文件
const handleOnChange = (file) => {
  const rawFile = file.raw;
  if (rawFile.type.indexOf('audio') === -1) {
    messageBox("请选择音频文件", "error");
    return;
  }
  audioUploadForm.file = rawFile;
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = function () {
    audioPreview.url = reader.result;  // 获取预览url
  };
  isHideUpload.value = true;
};
// 通过文件列表删除音频
const handleRemove = () => {
  audioUploadRef.value.clearFiles();
  Object.keys(audioPreview).forEach(key => delete audioPreview[key]);
  audioUploadForm.file = null;
  isHideUpload.value = false;
};
// 取消上传
const handleRemoveButton = () => {
  audioUploadDialogVisible.value = false;
  handleRemove();
  audioUploadFormRef.value.resetFields();

}
// 上传音频文件至后台服务器
const audioRef = ref();
const getDuration = () => {
  audioUploadForm.duration = audioRef.value.duration.toFixed(2) || 0;
};
const handleUploadAudio = () => {
  loading.value = true;
  if (!audioUploadForm.file) {
    message("请选择歌曲文件", "error");
    return;
  }
  uploadAudio(audioUploadForm).then(res => {
    if (res.data.code === 200) {
      message("歌曲文件上传成功！")
      audioUploadDialogVisible.value = false;
      audioUploadFormRef.value.resetFields();
      Object.keys(audioPreview).forEach(key => delete audioPreview[key]);
      fetchSongList();
    }
  }).finally(() => {
    loading.value = false;
  })
};


// 新增歌曲
const handleAddSong = () => {
  if (!selectedArtist.value) {
    notification("新增歌曲失败", "请先在左侧选择歌手", "error")
    return;
  }
  dialogVisible.value = true;
  nextTick(() => {
    editForm.artistName = artistList.value.find(item => item.id === selectedArtist.value).name;
    editForm.artistId = selectedArtist.value;
    editForm.formTitle = "新增歌曲";
  })
};

const handleArtistClick = (row) => {
  selectedArtist.value = row.id;
  searchSongForm.artistId = row.id;
  searchSongForm.name = null;
  searchSongForm.album = null;
  handleSearchSongs();
}

const highlightSearchText = (text, keyword) => {
  if (!keyword || !text) {
    return text;
  }
  const reg = new RegExp(keyword, "gi");
  return text.replace(reg, (match) => `<span style="color: red">${match}</span>`);
};


// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  searchSongForm.pageNum = page;
  fetchSongList();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  searchSongForm.pageSize = size;
  fetchSongList();
};

// 监听选中行变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 初始化数据
onMounted(() => {
  initData();
});
const initData = async () => {
  await fetchArtistList();
  await fetchSongList();
};

</script>

<style scoped>
.hide-upload /deep/ .el-upload--text {
  display: none;
}


.el-table--fit .el-table__inner-wrapper:before {
  /* width: 100%; */
}


.search-form {
  margin-bottom: 20px;
  height: auto;

  .el-form {
    display: flex;
  }

  .el-input {
    min-width: 300px;
  }
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
}


.form-inline {
  .el-input {
    min-width: 200px;
  }

  .el-select {
    min-width: 200px;
  }

  /deep/ .el-date-editor {
    --el-date-editor-width: 200px !important;
  }
}

</style>