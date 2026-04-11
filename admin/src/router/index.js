import {createRouter, createWebHistory} from "vue-router";
import {getCookies} from "../utils/auth.js";
import {notification} from "../utils/message.js";
import {hideFullLoading, showFullLoading} from "../utils/fullLoading.js";

const routes = [
    {
        path: "/",
        component: () => import("../layout/admin.vue"),
        redirect: "/index",
        children: [
            {
                path: "/index",
                component: () => import("../pages/Statistics.vue"),
                meta: {
                    title: "首页",
                },
            },
            {
                path: "/userManage",
                component: () => import("../pages/manage/UserManage.vue"),
                meta: {
                    title: "用户管理",
                },
            },
            {
                path: "/artistManage",
                component: () => import("../pages/manage/ArtistManage.vue"),
                meta: {
                    title: "歌手管理",
                }
            },
            {
                path: "/songManage",
                component: () => import("../pages/manage/SongManage.vue"),
                meta: {
                    title: "歌曲管理",
                }
            },
            {
                path: "/playlistManage",
                component: () => import("../pages/manage/PlaylistManage.vue"),
                meta: {
                    title: "歌单管理",
                }
            },
            {
                path: "/feedBackManage",
                component: () => import("../pages/manage/FeedbackManage.vue"),
                meta: {
                    title: "反馈管理",
                }
            },
            {
                path: "/bannerManage",
                component: () => import("../pages/manage/BannerManage.vue"),
                meta: {
                    title: "轮播图管理",
                }
            }
        ],
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

    const token = getCookies();

    if (!token && to.path !== "/login") {
        notification("提示", "请先登录", "warning");
        return next({path: "/login"});
    }

    if (token && to.path === "/login") {
        notification("提示", "已登录，请勿重复登录", "warning");
        return next({path: from.path ? from.path : "/"});
    }

    document.title = (to.meta.title || "无标题") + " - " + "音乐管理后台";
    next();
});

router.afterEach((to, from) => {
    hideFullLoading();
});
export default router;
