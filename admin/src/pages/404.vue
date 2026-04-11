<template>
    <el-result title="404" sub-title="Sorry, request error" icon="warning">
        <template #extra>
            <el-button type="primary" @click="$router.push('/')">Back</el-button>
        </template>
    </el-result>
</template>