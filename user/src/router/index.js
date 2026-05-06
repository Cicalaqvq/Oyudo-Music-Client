import {createRouter, createWebHistory} from "vue-router";
import {hideFullLoading, showFullLoading} from "../utils/fullLoading.js";
import {message} from "../utils/message.js";
import store from "../store/index.js";
import {menuList} from "../utils/menus.js";

const routes = [
    {
        path: "/",
        component: () => import("../layout/Client.vue"),
        redirect: "/recommend",
        children: [
            {
                path: "/:pathMatch(.*)*",
                title: "NotFound",
                component: () => import("../pages/404.vue"),
            },
            {
                path: "/recommend",
                component: () => import("../pages/Recommend.vue"),
                meta: {
                    title: "推荐",
                },
            },
            {
                path: "/library",
                component: () => import("../pages/Library.vue"),
                meta: {
                    title: "曲库",
                },
            },
            {
                path: "/artist",
                component: () => import("../pages/Artist.vue"),
                meta: {
                    title: "歌手",
                },
            },
            {
                path: "/artist/:id",
                component: () => import("../pages/ArtistDetail.vue"),
                meta: {
                    title: "歌手详情",
                },
            },
            {
                path: "/playlist",
                component: () => import("../pages/Playlist.vue"),
                meta: {
                    title: "歌单",
                },
            },
            {
                path: "/playlist/:id",
                component: () => import("../pages/PlaylistDetail.vue"),
                meta: {
                    title: "歌单详情",
                },
            },
            {
                path: "/like",
                component: () => import("../pages/Like.vue"),
                meta: {
                    title: "喜欢",
                },
            },
            {
                path: "/user",
                component: () => import("../pages/User.vue"),
                meta: {
                    title: "个人信息",
                },
            },
            {
                path: "/comment",
                component: () => import("../pages/Comment.vue"),
                meta: {
                    title: "评论管理",
                },
            },
        ],
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 设置全局路由守卫
router.beforeEach(async (to, from, next) => {
    showFullLoading();
    if (store.state.IS_LOGIN) {
        await store.dispatch("getUserInfo");
    }
    if (menuList.some(item => item.title === "我的" && item.group.some(item => item.path === to.path))) {
        if (!store.state.IS_LOGIN) {
            message("请先登录", "warning");
            if (from.path === "/") {
                next("/");
            } else {
                store.commit("SET_SHOW_LOGIN_DIALOG", true);
                next(false);
            }
            return;
        }
    }
    document.title = "Oyudo Music" + " - " + (to.meta.title || "无标题");
    next();
});

router.afterEach((to, from) => {
    hideFullLoading();
});
export default router;
