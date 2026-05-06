import {createRouter, createWebHistory} from "vue-router";
import {notification} from "../utils/message.js";
import {hideFullLoading, showFullLoading} from "../utils/fullLoading.js";
import store from "../store/index.js";
import {menuList} from "../utils/menus.js";

const routes = [
    {
        path: "/",
        component: () => import("../layout/admin.vue"),
        redirect: "/index",
        children: menuList.map(menu => ({
            path: menu.path,
            // 根据组件名称动态导入对应的组件
            component: () => {
                // 首页特殊处理
                if (menu.component === 'Index') {
                    return import("../pages/Statistics.vue")
                }
                // 其他管理页面
                return import(`../pages/manage/${menu.component}.vue`)
            },
            meta: menu.meta,
        })),
    },
    {
        path: "/login",
        title: "login",
        component: () => import("../pages/login.vue"),
        meta: {
            title: "登录",
        },
    },
    {
        path: "/:pathMatch(.*)*",
        title: "NotFound",
        component: () => import("../pages/404.vue"),
    },
];
export const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 设置全局路由守卫
router.beforeEach(async (to, from, next) => {
    showFullLoading();
    if (store.state.IS_LOGIN) {
        await store.dispatch("getAdminInfo");
    }
    if (to.path === "/login" && store.state.IS_LOGIN) {
        notification("提示", "已登录，请勿重复登录", "warning");
        next({path: from.path ? from.path : "/"});
    } else if (to.path !== "/login" && !store.state.IS_LOGIN) {
        notification("提示", "请先登录", "warning");
        next({path: "/login"});
    } else {
        next();
    }
    document.title = "Oyudo Music后台" + " - " + (to.meta.title || "无标题");
});

router.afterEach((to, from) => {
    hideFullLoading();
});
export default router;
