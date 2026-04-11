<script setup>
</script>

<template>
  <router-view/>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.el-dialog {
  .el-dialog__header {
    display: flex;
    justify-content: left;
  }
  .el-dialog__title {
    font-size: 20px;
  }
}

.el-card {
  --el-box-shadow-light: none;
}

</style>
