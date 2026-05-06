import request from "../utils/request";

export function login(loginForm) {
    return request.post("/user/user/login", loginForm);
}

export function getCode(email) {
    return request.get("/user/user/getCode", {params: {email: email}});
}

export function register(registerForm) {
    return request.post("/user/user/register", registerForm);
}

export function getBanners() {
    return request.get("/user/banner/getBanners");
}

export function getAllSongs(searchForm) {
    return request.get("/user/song/getAllSongs", {
        params: searchForm,
    });
}

export function getArtists(searchForm) {
    return request.get("/user/artist/getArtists", {
        params: searchForm,
    });
}

export function getArtistDetail(artistId) {
    return request.get("/user/artist/getArtistDetail", {
        params: {
            id: artistId,
        },
    });
}

export function getAllPlaylists(searchForm) {
    return request.get("/user/playlist/getAllPlaylists", {
        params: searchForm,
    });
}

export function getPlaylistDetail(playlistId) {
    return request.get("/user/playlist/getPlaylistDetail", {
        params: {
            id: playlistId,
        },
    });
}

export function getSongsOfPlaylist(playlistId) {
    return request.get("/user/playlist/getSongsOfPlaylist", {
        params: {
            id: playlistId,
        },
    });
}

export function getComments(searchForm) {
    return request.get("/user/comment/getComments",
        {
            params: searchForm,
        });
}

// 需要登录过才能进行的操作
export function logout() {
    return request.post("/user/user/logout");
}

export function updateEmail(emailForm) {
    return request.put("/user/user/updateEmail", emailForm);
}

export function getUserInfo() {
    return request.get("/user/user/getUserInfo");
}

export function updateUserInfo(userForm) {
    return request.put("/user/user/updateUser", userForm);
}

export function resetPwd(resetPwdForm) {
    return request.put("/user/user/resetPwd", resetPwdForm);
}

export function uploadImg(formData) {
    return request.post("/common/file/uploadImg", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}

export function likeSong(songIds) {
    return request.post("/user/favorite/addFavorite", {
        songIds: songIds,
        type: 0,
    });
}

export function unlikeSong(songIds) {
    return request.delete("/user/favorite/removeFavorite", {
        params: {
            songIds: songIds,
            type: 0,
        },
    });
}

export function likePlaylist(playlistIds) {
    return request.post("/user/favorite/addFavorite", {
        playlistIds: playlistIds,
        type: 1,
    });
}

export function unlikePlaylist(playlistIds) {
    return request.delete("/user/favorite/removeFavorite", {
        params: {
            playlistIds: playlistIds,
            type: 1,
        },
    });
}

export function getSongFavorite() {
    return request.get("/user/favorite/getFavorite", {
        params: {
            type: 0,
        },
    });
}

export function getPlaylistFavorite() {
    return request.get("/user/favorite/getFavorite", {
        params: {
            type: 1,
        },
    });
}

export function addComment(commentForm) {
    return request.post("/user/comment/addComment", commentForm);
}

export function likeComment(commentId) {
    return request.put(`/user/comment/likeComment/${commentId}`);
}

export function addFeedback(feedbackForm) {
    return request.post("/user/feedback/addFeedback", feedbackForm);
}

export function getCommentsByUser(searchForm) {
    return request.get("/user/comment/getCommentsByUser",
        {
            params: searchForm,
        });
}

export function deleteComment(commentId) {
    return request.delete(`/user/comment/deleteComment/${commentId}`,);
}

// 推荐算法
export function addScoreToSong(songId, score) {
    return request.post(`/common/recommend/addScoreToSong`, {score: score, songId: songId})
}

export function addScoreToPlaylist(playlistId, score) {
    return request.post(`/common/recommend/addScoreToPlaylist`, {playlistId: playlistId, score: score});
}

export function getRecommendPlaylists() {
    return request.get("/common/recommend/getRecommendPlaylists");
}

export function getRecommendSongs() {
    return request.get("/common/recommend/getRecommendSongs");
}

export function refreshRecommendSongs() {
    return request.get("/common/recommend/refreshRecommendSongs");
}

export function refreshRecommendPlaylists() {
    return request.get("/common/recommend/refreshRecommendPlaylists");
}