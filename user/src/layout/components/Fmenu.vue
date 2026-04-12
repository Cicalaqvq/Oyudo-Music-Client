<template>
  <div class="menu-container">
    <el-menu :default-active="activePath" active-text-color="#303133" router>
      <el-menu-item index="/">
        <el-icon class="title-el-icon">
          <HiOutlineMusicalNote/>
        </el-icon>
        <span class="title-text">Oyudo Music</span>
      </el-menu-item>
      <template v-for="item in menuList" :key="item.path">
        <!--无分组菜单-->
        <el-menu-item
            v-if="!item.group || item.group.length === 0"
            :index="item.path"
        >
          <el-icon class="menu-el-icon">
            <component :is="item.icon"/>
          </el-icon>
          <span class="menu-text">{{ item.title }}</span>
        </el-menu-item>

        <!--分组菜单-->
        <el-menu-item-group v-else>
          <template #title>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
              v-for="(item2, index2) in item.group"
              :key="index2"
              :index="item2.path"
          >
            <el-icon class="menu-el-icon">
              <component :is="item2.icon"/>
            </el-icon>
            <span class="menu-text">{{ item2.title }}</span>
          </el-menu-item>
        </el-menu-item-group>
      </template>

      <el-menu-item-group v-if="localIslogin">
        <template #title>
          <span>收藏的歌单 ({{ favoritePlaylists.length }})</span>
        </template>
        <el-scrollbar height="400">
          <el-menu-item
              v-for="playlist in favoritePlaylists"
              :key="playlist.id"
              :index="'/playlist/' + playlist.id"
              class="playlist-item-container"
              @click="handleClick(playlist)"
          >
            <div class="playlist-cover">
              <el-image
                  :src="playlist.coverUrl"
                  fit="cover"
                  style="width: 50px; height: 50px"
              />
            </div>
            <span class="playlist-text">{{ playlist.title }}</span>
          </el-menu-item>
        </el-scrollbar>
      </el-menu-item-group>
    </el-menu>
  </div>
</template>
<script setup>
import {menuList} from "../../utils/menus.js";
import {useRoute} from "vue-router";
import {computed, ref, watch} from "vue";
import {useStore} from "vuex";

const store = useStore();
const route = useRoute();

const localIslogin = computed(() => store.state.IS_LOGIN);

const favoritePlaylists = computed(() => store.state.USER_FAVORITE_PLAYLISTS);

// 当前激活的菜单
const activePath = ref(route.path);

const handleClick = (playlist) => {
  store.commit("SET_SELECTED_PLAYLIST", playlist);
};

watch(() => route.path, (newVal) => {
  activePath.value = newVal;
})
</script>
<style scoped>
.playlist-item-container {
  padding: 5px !important;
  overflow: hidden;
}

.playlist-cover {
  object-fit: cover;
  aspect-ratio: 1;
  padding-bottom: 6px;
}

.playlist-text {
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
  color: #303133;
  padding-left: 10px;
}

.menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.title-el-icon {
  font-size: 23px;
  width: 35px;
  height: 35px;
  color: blue;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.title-text {
  gap: 0.5rem;
  font-size: 20px;
  font-weight: bold;
  white-space: nowrap;
  transition: all 0.3s;
}

.menu-text {
  font-size: 16px;
  white-space: nowrap;
  transition: all 0.3s;
}

.el-menu {
  border-right: none;
  /* box-shadow: none;    */
}

.el-menu-item {
  margin-left: 5px;
  margin-right: 5px;
  border-radius: 0.5rem;
  --el-menu-text-color: #303133;
  --el-menu-text-color-active: #303133;
}

.el-menu-item:hover {
  background-color: #e8e7e7 !important;
}

.el-menu-item.is-active {
  background-color: #cde5f8 !important;
}

.menu-el-icon {
  font-size: 16px;
  width: 20px;
  height: 20px;
  padding-right: 5px;
}
</style>
