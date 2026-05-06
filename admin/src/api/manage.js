import request from "../utils/request";

export function login(username, password) {
    return request.post("/admin/admin/login", {username, password});
}

export function getInfo() {
    return request.get("/admin/admin/getInfo");
}

export function logout() {
    return request.post("/admin/admin/logout");
}

export function updatePassword(oldPassword, newPassword) {
    return request.post("/admin/admin/updatePassword", {oldPassword, newPassword});
}

export function getUserList(params) {
    return request.get("/admin/user/getUserList", {params});
}

export function uploadImg(formData) {
    return request.post("/common/uploadImg", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}

export function updateUser(user) {
    return request.put("/admin/user/updateUser", user);
}

export function addUser(user) {
    return request.post("/admin/user/addUser", user);
}

export function deleteUsers(ids) {
    return request.delete("/admin/user/deleteUsers", {data: ids});
}

export function getArtistList(params) {
    return request.get("/admin/artist/getArtistList", {params});
}

export function updateArtist(artist) {
    return request.put("/admin/artist/updateArtist", artist);
}

export function addArtist(artist) {
    return request.post("/admin/artist/addArtist", artist);
}

export function deleteArtists(ids) {
    return request.delete("/admin/artist/deleteArtists", {data: ids});
}

export function getSongList(searchForm) {
    return request.get("/admin/song/getSongList", {
        params: searchForm,
    });
}

export function addSong(song) {
    return request.post("/admin/song/addSong", song);
}

export function uploadAudio(formData) {
    return request.post("/common/file/uploadAudio", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export function updateSong(song) {
    return request.put("/admin/song/updateSong", song);
}

export function deleteSongs(ids) {
    return request.delete("/admin/song/deleteSongs", {data: ids});
}

export function getPlaylists(params) {
    return request.get("/admin/playlist/getPlaylists", {params});
}

export function updatePlaylist(playlist) {
    return request.put("/admin/playlist/updatePlaylist", playlist);
}

export function addPlaylist(playlist) {
    return request.post("/admin/playlist/addPlaylist", playlist);
}

export function deletePlaylists(ids) {
    return request.delete("/admin/playlist/deletePlaylists", {data: ids});
}

export function getFeedbacks(params) {
    return request.get("/admin/feedback/getFeedbacks", {params});
}

export function deleteFeedbacks(ids) {
    return request.delete("/admin/feedback/deleteFeedbacks", {data: ids});
}

export function getBanners(params) {
    return request.get("/admin/banner/getBanners", {params});
}

export function updateBanner(banner) {
    return request.put("/admin/banner/updateBanner", banner);
}

export function addBanner(banner) {
    return request.post("/admin/banner/addBanner", banner);
}

export function deleteBanners(ids) {
    return request.delete("/admin/banner/deleteBanners", {data: ids});
}

export function getSongsOfPlaylist(params) {
    return request.get("/admin/songPlaylist/getSongsOfPlaylist", {params});
}

export function updateSongToPlaylist(song) {
    return request.put("/admin/songPlaylist/updateSongToPlaylist", song);
}

export function getTotal(begin, end) {
    return request.get("/admin/statistics/getTotal", {
        params: {
            begin,
            end
        }
    });
}

export function getSongStyleReport() {
    return request.get("/admin/statistics/getSongStyleReport");
}

export function getArtistCountryTop5() {
    return request.get("/admin/statistics/getArtistCountryTop5");
}

export function getLogs(searchForm) {
    return request.get("/admin/log/getLogs", {
        params: searchForm,
    });
}

export function deleteLogs(ids) {
    return request.delete("/admin/log/deleteLogs", {data: ids});
}