<template>
  <div class="common-layout">
    <el-container>
      <el-aside :style="{ width: isCollapse ? '64px' : '230px' }">
        <f-menu v-model:is-collapse="isCollapse"/>
      </el-aside>

      <el-container>
        <el-header>
          <f-header/>
        </el-header>

        <el-main>
          <router-view v-slot="{ Component,route }">
            <transition mode="out-in" name="fade">
              <component :is="Component" :key="route.path"/>
            </transition>
          </router-view>
        </el-main>

        <el-footer>
          <f-footer/>
        </el-footer>

      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import FHeader from "./components/Fheader.vue";
import FMenu from "./components/Fmenu.vue";
import FFooter from "./components/Ffooter.vue";
import {ref} from "vue";
const isCollapse = ref(false);
</script>

<style scoped>
.common-layout {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.el-container {
  height: 100vh;
}

.el-header {
  padding: 0;
}

.el-main {
  height: auto;
  overflow: auto;
  background-color: #f9f9f9;
}

.el-footer {
  text-align: center;
  height: auto;
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0;
  padding: 0;
  z-index: 1000;
}

.el-aside {
  transition: width 0.3s;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
