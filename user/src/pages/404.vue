<template>
  <el-result icon="warning" sub-title="Sorry, request error" title="404">
    <template #extra>
      <el-button type="primary" @click="handleClick">Back</el-button>
    </template>
  </el-result>
</template>
<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
const handleClick = () => {
  router.push({ path: "/" });
};
</script>
