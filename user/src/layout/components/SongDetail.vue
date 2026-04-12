<template>
  <div class="song-detail-container">
    <!--顶部：返回-->
    <el-row :span="24">
      <div class="top-section">
        <div>
          <el-icon class="back-icon" size="24" @click="back">
            <Back/>
          </el-icon>
        </div>
        <div/>
      </div>
    </el-row>
    <!-- 左侧：歌曲信息和播放控制 -->
    <el-row :gutter="20">
      <el-col :span="10">
        <div class="left-section">
          <div class="cover-wrapper">
            <img :src="currentSong.coverUrl" alt="cover" class="song-cover"/>
            <div
                :class="{ 'vinyl-record_active': localIsPlaying }"
                class="vinyl-record"
            >
              <div class="vinyl-inner">
                <el-image :src="currentSong.coverUrl" class="vinyl-image"/>
              </div>
            </div>
          </div>

          <div class="song-info">
            <h2 class="song-title">{{ currentSong.name }}</h2>
            <p class="song-artist">{{ currentSong.artistName }}</p>
          </div>

          <div class="progress-section">
            <span class="time-text">{{ formatTime(currentTime) }}</span>
            <el-slider
                v-model="localCurrentTime"
                :max="duration"
                :show-tooltip="false"
                :step="1"
                class="progress-slider"
                @change="onProgressChange"
            />
            <span class="time-text">{{ currentSong.duration }}</span>
          </div>

          <div class="player-controls">
            <el-icon class="control-icon" size="35" @click="previousSong">
              <BiSkipPrevious/>
            </el-icon>
            <div class="play-btn" @click="togglePlay">
              <el-icon v-if="!localIsPlaying" size="40">
                <BiPlay/>
              </el-icon>
              <el-icon v-else size="40">
                <BiPause/>
              </el-icon>
            </div>
            <el-icon class="control-icon" size="35" @click="nextSong">
              <BiSkipNext/>
            </el-icon>
            <el-icon class="control-icon" size="30" @click="toggleFavorite">
              <BiSolidHeart v-if="isFavorite" style="color: red"/>
              <BiHeart v-else/>
            </el-icon>
            <el-tooltip :content="showPlayMode()" effect="light">
              <el-icon
                  v-if="localPlayMode === 0"
                  class="control-icon"
                  size="30"
                  @click="onPlayModeChange"
              >
                <AiOutlineUnorderedList/>
              </el-icon>
              <el-icon
                  v-if="localPlayMode === 1"
                  class="control-icon"
                  size="30"
                  @click="onPlayModeChange"
              >
                <LiaRandomSolid/>
              </el-icon>
              <el-icon
                  v-if="localPlayMode === 2"
                  class="control-icon"
                  size="30"
                  @click="onPlayModeChange"
              >
                <IpPlayCycle/>
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </el-col>
      <el-col :span="13">
        <!-- 右侧：歌曲信息和评论 -->
        <div class="right-section">
          <div class="song-meta">
            <h3 class="section-title">歌曲信息</h3>
            <div class="meta-info">
              <div class="meta-item">
                <span class="label">专辑：</span>
                <span class="value">{{ currentSong.album || "未知专辑" }}</span>
              </div>
              <div class="meta-item">
                <span class="label">发行时间：</span>
                <span class="value">{{
                    formateDate(currentSong.releaseTime)
                  }}</span>
              </div>
            </div>
          </div>

          <div class="comments-section">
            <h3 class="section-title">评论 ({{ comments.length }})</h3>
            <el-form ref="formRef" :model="commentForm" :rules="rules">
              <el-form-item prop="content">
                <div class="comment-input-wrapper">
                  <el-input
                      v-model="commentForm.content"
                      :maxlength="180"
                      :rows="3"
                      clearable
                      placeholder="说点什么吧"
                      resize="none"
                      type="textarea"
                  />
                  <div class="input-footer">
                    <span class="char-count"
                    >{{ commentForm.content.length }} / 180</span
                    >
                    <el-button
                        size="small"
                        type="primary"
                        @click="submitComment"
                    >发布
                    </el-button
                    >
                  </div>
                </div>
              </el-form-item>
            </el-form>
            <el-scrollbar height="500px">
              <div
                  v-for="comment in comments"
                  :key="comment.id"
                  class="comment-item"
              >
                <el-image
                    :alt="comment.username"
                    :src="comment.userAvatar || '/defaultAvatar.png'"
                    class="comment-avatar"
                />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-user">{{ comment.username }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-footer">
                    <span class="comment-date">{{ comment.createTime }}</span>
                    <div class="comment-actions">
                      <el-icon
                          class="action-icon"
                          @click="likeComment(comment.id)"
                      >
                        <BiHeart/>
                      </el-icon>
                      <span class="likes-count">{{ comment.likeCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty
                  v-if="comments.length === 0"
                  description="暂无评论，快来抢沙发~"
              />
            </el-scrollbar>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import {computed, reactive, ref, watch} from "vue";
import {BiHeart, BiPause, BiPlay, BiSkipNext, BiSkipPrevious, BiSolidHeart,} from "vue-icons-plus/bi";
import {useStore} from "vuex";
import {AiOutlineUnorderedList} from "vue-icons-plus/ai";
import {LiaRandomSolid} from "vue-icons-plus/lia";
import {IpPlayCycle} from "vue-icons-plus/ip";
import {publishComment, toggleFavoriteComment,} from "../../utils/userComment.js";

const store = useStore();

const props = defineProps({
  currentTime: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    default: 0,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  comments: {
    type: Array,
    default: [],
  },
});

const emit = defineEmits([
  "play",
  "pause",
  "next",
  "previous",
  "on-progress-change",
  "back",
  "toggle-favorite",
  "fetch-comments",
]);

const localCurrentTime = ref(props.currentTime);

const localPlayMode = computed(() => store.state.PLAY_MODE || 0);

const commentForm = reactive({
  content: "",
  songId: store.state.CURRENT_SONG.id,
  type: 0,
});

const formRef = ref(null);

const rules = {
  content: [
    {required: true, message: "请输入评论内容", trigger: "change"},
    {
      min: 1,
      max: 180,
      message: "评论长度在 1 到 180 个字符",
      trigger: "blur",
    },
  ],
};

const currentSong = computed(() => store.state.CURRENT_SONG || {});

const localIsPlaying = computed(() => store.state.IS_PLAYING || false);

// 显示播放模式名称
const showPlayMode = () => {
  switch (localPlayMode.value) {
    case 0:
      return "顺序播放";
    case 1:
      return "随机播放";
    case 2:
      return "单曲循环";
  }
};

// 播放模式切换
const onPlayModeChange = () => {
  store.commit("SET_PLAY_MODE", (localPlayMode.value + 1) % 3);
};

const toggleFavorite = () => {
  emit("toggle-favorite");
};

const back = () => {
  emit("back");
};

const onProgressChange = (value) => {
  emit("on-progress-change", value);
};

const formateDate = (date) => {
  const options = {year: "numeric", month: "long", day: "numeric"};
  return new Date(date).toLocaleDateString(undefined, options);
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const togglePlay = () => {
  if (localIsPlaying.value) {
    emit("pause");
  } else {
    emit("play");
  }
};

const previousSong = () => {
  emit("previous");
};

const nextSong = () => {
  emit("next");
};

const submitComment = async () => {
  const res = await publishComment(store, commentForm);
  if (res) {
    commentForm.content = "";
    fetchComments();
  }
};

const likeComment = async (id) => {
  const res = await toggleFavoriteComment(store, id);
  if (res) fetchComments();
};

const fetchComments = () => {
  emit("fetch-comments");
};

watch(
    () => props.currentTime,
    (newVal) => {
      localCurrentTime.value = newVal;
    },
);
</script>

<style scoped>
.back-icon {
  cursor: pointer;
}

.back-icon:hover {
  color: #5858e7;
  transition: color 0.3s ease-in-out;
}

:deep(.el-row) {
  margin-bottom: 20px;
}

.song-detail-container {
  gap: 60px;
  padding: 40px;
  height: 100%;
  background: linear-gradient(135deg, #ffebf5 0%, #ffffff 100%);
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.left-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.cover-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.song-cover {
  width: 280px;
  height: 280px;
  border-radius: 8px;
  object-fit: cover;
  z-index: 2;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.vinyl-record {
  position: absolute;
  width: 270px;
  height: 270px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a1a 0%, #706d6d 100%);
  z-index: 1;
  left: 45%;
}

.vinyl-record_active {
  position: absolute;
  width: 270px;
  height: 270px;
  border-radius: 50%;
  background: linear-gradient(135deg, black 0%, #706d6d 100%);
  animation: rotate 5s linear infinite;
  z-index: 1;
  left: 45%;
}

.vinyl-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
}

.vinyl-image {
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.song-info {
  text-align: center;
}

.song-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.song-artist {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.progress-section {
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-text {
  font-size: 12px;
  color: #666;
  min-width: 45px;
  text-align: center;
}

.progress-slider {
  flex: 1;
}

.progress-slider :deep(.el-slider__runway) {
  height: 4px;
}

.progress-slider :deep(.el-slider__bar) {
  height: 4px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.control-icon {
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.control-icon:hover {
  color: #333;
}

.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.play-btn:hover {
  background-color: #66b1ff;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.song-meta {
  background: rgba(255, 255, 255, 0.6);
  padding: 24px;
  border-radius: 12px;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  gap: 40px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #666;
}

.value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.comments-section {
  flex: 1;
}

.comment-input-wrapper {
  margin-bottom: 24px;
  width: 100%;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-count {
  font-size: 12px;
  color: #999;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 16px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  margin-bottom: 8px;
  display: flex;
  justify-content: left;
}

.comment-user {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.comment-text {
  font-size: 14px;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.5;
  text-align: left;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-date {
  font-size: 12px;
  color: #999;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 20px;
}

.action-icon {
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.action-icon:hover {
  color: #ff69b4;
}

.likes-count {
  font-size: 12px;
  color: #999;
}
</style>
