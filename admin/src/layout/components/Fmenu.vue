<template>
  <div class="menu-container">
    <el-menu :collapse="localCollapse" :default-active="activePath" @select="handleSelect">
      <el-menu-item>
        <el-icon class="title-el-icon">
          <HiOutlineMusicalNote/>
        </el-icon>
        <span class="title-text">OyudoMusic-Admin</span>
      </el-menu-item>
      <template v-for="(item) in menuList" :key="item.path">
        <!--无子菜单-->
        <el-menu-item v-if="!item.child || item.child.length===0" :index="item.path">
          <el-icon>
            <component :is="item.icon"/>
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>

        <!--有子菜单-->
        <el-sub-menu v-else :index="item.path">
          <template #title>
            <el-icon>
              <component :is="item.icon"/>
            </el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item v-for="(item2,index2) in item.child" :key="index2" :index="item2.path">{{ item2.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
    <div class="toggle-btn-container">
      <el-button
          :icon="localCollapse ? 'Expand' : 'Fold'"
          circle
          size="large"
          @click="toggleCollapse"
      />
    </div>
  </div>
</template>
<script setup>
import {menuList} from "../../utils/menus.js";
import {useRoute, useRouter} from "vue-router";
import {computed} from "vue";

const router = useRouter();
const route = useRoute();


// 当前激活的菜单
const activePath = computed(() => route.path);

// 处理菜单点击
const handleSelect = (index) => {
  router.push(index);
};

const props = defineProps({
  isCollapse: Boolean,
  default: false
})
const emit = defineEmits(['update:isCollapse'])
const localCollapse = computed({
  get: () => props.isCollapse,
  set: (value) => emit('update:isCollapse', value)
});
const toggleCollapse = () => {
  localCollapse.value = !localCollapse.value;
};
</script>
<style scoped>
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
  margin-left: 2px;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  transition: all 0.3s;
}

.el-menu {
  border-right: none;
  /* box-shadow: none;    */
}

.toggle-btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid #e6e6e6;
}

/*去除默认的边框*/
.el-button:focus {
  outline: none;
}

</style>