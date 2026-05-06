export const menuList = [
  {
    title: "推荐",
    meta: {
      title: "推荐",
    },
    path: "/recommend",
    component: "Recommend",
    icon: "SlHome",
  },
  {
    title: "发现",
    group: [
      {
        title: "曲库",
        meta: {
          title: "曲库",
        },
        path: "/library",
        component: "Library",
        icon: "SlMusicToneAlt",
      },
      {
        title: "歌手",
        meta: {
          title: "歌手",
        },
        path: "/artist",
        component: "Artist",
        icon: "Mic",
      },
      {
        title: "歌单",
        meta: {
          title: "歌单",
        },
        path: "/playlist",
        component: "Playlist",
        icon: "IpRecordDisc",
      },
    ],
  },
  {
    title: "我的",
    group: [
      {
        title: "喜欢",
        meta: {
          title: "喜欢",
        },
        path: "/like",
        component: "Like",
        icon: "IpLike",
      },
      {
        title: "个人信息",
        meta: {
          title: "个人信息",
        },
        path: "/user",
        component: "User",
        icon: "User",
      },
      {
        title: "评论管理",
        meta: {
          title: "评论管理",
        },
        path: "/comment",
        component: "Comment",
        icon: "ChatLineSquare",
      },
    ],
  },
];
