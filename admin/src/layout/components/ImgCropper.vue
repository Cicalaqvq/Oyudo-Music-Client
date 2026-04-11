<template>
  <!-- 图片裁剪弹窗 -->
  <el-dialog
      v-model="dialogVisible"
      align-center
      title="图片上传/裁剪"
      width="auto"

  >
    <div class="cropper-content">
      <el-upload
          ref="uploadRef"
          :auto-upload=false
          :class="{hideUpload : isHideUpload}"
          :limit="1"
          :on-change="handleOnChange"
          :on-remove="handleOnRemove"
          :show-file-list="true"
          accept=".jpg,.png"
          drag
          style="min-width: 500px"
      >
        <el-icon class="el-icon--upload">
          <upload-filled/>
        </el-icon>
        <div class="el-upload__text">
          点击或拖拽图片文件，
          支持.jpg/.png格式的图片文件
        </div>
      </el-upload>
      <el-row v-if="showCropper" gutter="20">
        <el-col span="6">
          <div class="cropper">
            <vueCropper
                v-if="showCropper"
                ref="cropper"
                :autoCrop="options.autoCrop"
                :autoCropHeight="options.autoCropHeight"
                :autoCropWidth="options.autoCropWidth"
                :canMove="options.canMove"
                :canMoveBox="options.canMoveBox"
                :centerBox="options.centerBox"
                :fixed="options.fixed"
                :fixedBox="options.fixedBox"
                :fixedNumber="options.fixedNumber"
                :full="options.full"
                :img="options.img"
                :info="true"
                :infoTrue="options.infoTrue"
                :original="options.original"
                :outputType="options.outputType"
                @realTime="generateReview"
            />
            <div v-if="showCropper" class="handle_btn">
              <el-button
                  plain
                  type="primary"
                  @click="changeScale(1)"
              >+ 放大
              </el-button>
              <el-button
                  v-if="showCropper"
                  plain
                  type="primary"
                  @click="changeScale(-1)"
              >- 缩小
              </el-button>
              <el-button
                  v-if="showCropper"
                  plain
                  type="primary"
                  @click="rotateLeft"
              >↺ 左旋转
              </el-button>
              <el-button
                  v-if="showCropper"
                  plain
                  type="primary"
                  @click="rotateRight"
              >↻ 右旋转
              </el-button>
            </div>
          </div>
        </el-col>
        <el-col span="6">
          <el-card>
            <div class="cropper-img">
              <el-avatar v-if="showAvatar"
                         :src="imgReview.url"
                         fit="cover"
                         style="width: 290px;height: 290px"
              />
              <el-image
                  v-else
                  :preview-src-list="imgReview.url"
                  :preview-teleported="true"
                  :show-progress="true"
                  :src="imgReview.url"
                  fit="cover"
                  style="width: 600px;height: 200px"
              />

            </div>

            <div>
              图片宽高：{{ imgReview.width }} x {{ imgReview.height }} 像素
            </div>
            <div>
              图片大小： {{ formatFileSize(imgReview.size) }} ({{ imgReview.size }} 字节)
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelCrop">取消</el-button>
          <el-button
              :loading="loading"
              type="primary"
              @click="confirmCrop"
          > 确认裁剪 </el-button>
        </span>
    </template>
  </el-dialog>
</template>

<script setup>

import {reactive, ref} from "vue";
import {message} from "../../utils/message.js";
import {uploadImg} from "../../api/manage.js";

// 父组件调用
const emit = defineEmits(["cropComplete"])

// 头像裁剪
const dialogVisible = ref(false);
const loading = ref(false);
const uploadRef = ref();
const showAvatar = ref(true);


const imgReview = reactive({
  url: null,
  height: null,
  width: null,
  size: null
})

//获取裁剪图片组件
const showCropper = ref(false);
const cropper = ref();
const isHideUpload = ref(false);

// 0:用户头像 1:歌手头像 2:歌曲封面 3:歌单封面 4.轮播图
let flagSrc = 0;

// 头像裁剪各项参数
const options = reactive({
  img: "", // 裁剪图片的地址
  info: true, // 裁剪框的大小信息
  outputSize: 1, // 裁剪生成图片的质量
  outputType: "png", // 裁剪生成图片的格式
  canScale: true, // 图片是否允许滚轮缩放
  autoCrop: true, // 是否默认生成截图框
  canMoveBox: true, // 截图框能否拖动
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: false, // 固定截图框大小 不允许改变
  fixed: true, // 是否开启截图框宽高固定比例
  fixedNumber: [1, 1], // 截图框的宽高比例
  full: false, // 是否输出原图比例的截图
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
  canMove: true,
});

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


// 上传图片
const handleOnChange = (file) => {
  if (file.raw.type.indexOf("image") === -1) {
    message("请上传图片文件", "error")
    return false;
  }
  if (file.size / 1024 / 1024 > 10) {
    message("图片不能大于10M", "error")
    return false;
  }
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = () => {
    options.img = reader.result;
  };
  showCropper.value = true;
  isHideUpload.value = true;
};

const handleOnRemove = () => {
  options.img = "";
  showCropper.value = false;
  isHideUpload.value = false;
};


// 确认裁剪
const confirmCrop = () => {
  loading.value = true;
  cropper.value.getCropBlob((blob) => {
    const file = new File([blob], "cropped-image.png", {
      type: "image/png",
    });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("flag", flagSrc)
    uploadImg(formData).then(res => {
      if (res.data.code === 200) {
        message("图片裁剪结果已上传")
        emit("cropComplete", res.data.data)
        dialogVisible.value = false
      }
    }).finally(() => {
      loading.value = false
    })
  })
};

// 取消裁剪
const cancelCrop = () => {
  uploadRef.value?.clearFiles()
  handleOnRemove()
  dialogVisible.value = false
}

// 缩放
const changeScale = (num) => {
  cropper.value.changeScale(num);
};

// 旋转
const rotateLeft = () => {
  cropper.value.rotateLeft();
};

const rotateRight = () => {
  cropper.value.rotateRight();
};

const generateReview = async (data) => {
  await cropper.value.getCropBlob((blob) => {
    imgReview.url = window.URL.createObjectURL(blob);
    imgReview.size = blob.size
    imgReview.height = data.h
    imgReview.width = data.w
  })
};
// 暴露方法
defineExpose({
  open(flag) {
    // flag: 0 头像 1 歌手头像 2 歌曲封面 3 歌单封面 4.轮播图
    flagSrc = flag
    switch (flag) {
      case 4:
        showAvatar.value = false;
        options.autoCropWidth = 600;
        options.autoCropHeight = 200;
        options.fixedNumber = [3, 1];
    }
    dialogVisible.value = true
  },
})

</script>


<style scoped>
.cropper {
  width: 395px;
  height: 395px;
}


.cropper-img {
  display: flex;
  justify-content: center;
  align-items: center;
}

.cropper-result {
  width: 100%;
  height: 200px;
}

.hideUpload /deep/ .el-upload--text {
  display: none;
}

</style>