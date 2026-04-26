import request from "../utils/request";

export function getBanners() {
    return request.get("/user/getBanners");
}


export function getCommentOfSong(songId) {
    return request.get("/user/getCommentOfSong", {
        params: {
            songId: songId,
        },
    });
}

export function getAllSongs(searchForm) {
    return request.get("/user/getAllSongs", {
        params: searchForm,
    });
}

export function getArtists(searchForm) {
    return request.get("/user/getArtists", {
        params: searchForm,
    });
}

export function getArtistDetail(artistId) {
    return request.get("/user/getArtistDetail", {
        params: {
            id: artistId,
        },
    });
}

export function getAllPlaylists(searchForm) {
    return request.get("/user/getAllPlaylists", {
        params: searchForm,
    });
}

export function getPlaylistDetail(playlistId) {
    return request.get("/user/getPlaylistDetail", {
        params: {
            id: playlistId,
        },
    });
}

export function getSongsOfPlaylist(playlistId) {
    return request.get("/user/getSongsOfPlaylist", {
        params: {
            id: playlistId,
        },
    });
}

export function getCommentOfPlaylist(playlistId) {
    return request.get("/user/getCommentOfPlaylist", {
        params: {
            playlistId: playlistId,
        },
    });
}

// 需要验证的操作
export function login(loginForm) {
    return request.post("/user/login", loginForm);
}

export function register(registerForm) {
    return request.post("/user/register", registerForm);
}

export function logout() {
    return request.post("/user/logout");
}

export function getCode(email) {
    return request.get("/user/getCode", {params: {email: email}});
}

export function likeSong(songIds) {
    return request.post("/user/addFavorite", {
        songIds: songIds,
        type: 0,
    });
}

export function unlikeSong(songIds) {
    return request.delete("/user/removeFavorite", {
        params: {
            songIds: songIds,
            type: 0,
        },
    });
}

export function likePlaylist(playlistIds) {
    return request.post("/user/addFavorite", {
        playlistIds: playlistIds,
        type: 1,
    });
}

export function unlikePlaylist(playlistIds) {
    return request.delete("/user/removeFavorite", {
        params: {
            playlistIds: playlistIds,
            type: 1,
        },
    });
}

export function getSongFavorite(songIds) {
    return request.get("/user/getFavorite", {
        params: {
            songIds: songIds,
            type: 0,
        },
    });
}

export function getPlaylistFavorite(playlistIds) {
    return request.get("/user/getFavorite", {
        params: {
            playlistIds: playlistIds,
            type: 1,
        },
    });
}

export function getUserInfo() {
    return request.get("/user/getUserInfo");
}

export function updateUserInfo(userForm) {
    return request.put("/user/updateUser", userForm);
}

export function resetPwd(resetPwdForm) {
    return request.put("/user/resetPwd", resetPwdForm);
}

export function addComment(commentForm) {
    return request.post("/user/addComment", commentForm);
}

export function likeComment(commentId) {
    return request.put(`/user/likeComment/${commentId}`);
}

export function uploadImg(formData) {
    return request.post("/common/file/uploadImg", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}

export function updateEmail(emailForm){
    return request.put("/user/updateEmail", emailForm);
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

export function refreshRecommendSongs(){
    return request.get("/common/recommend/refreshRecommendSongs");
}

export function refreshRecommendPlaylists(){
    return request.get("/common/recommend/refreshRecommendPlaylists");
}