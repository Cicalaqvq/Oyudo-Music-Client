import request from "../utils/request";

export function login(username, password) {
    return request.post("/admin/login", {username, password});
}

export function getInfo() {
    return request.get("/admin/getInfo");
}

export function logout() {
    return request.post("/admin/logout");
}

export function updatePassword(oldPassword, newPassword) {
    return request.post("/admin/updatePassword", {oldPassword, newPassword});
}

export function getUserList(params) {
    return request.get("/admin/getUserList", {params});
}

export function updateUserStatus(id, status) {
    return request.post("/admin/updateUserStatus", {
        'id': id,
        'status': status
    });
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
    return request.put("/admin/updateUser", user);
}

export function addUser(user) {
    return request.post("/admin/addUser", user);
}

export function deleteUsers(ids) {
    return request.delete("/admin/deleteUsers", {data: ids});
}

export function getArtistList(params) {
    return request.get("/admin/getArtistList", {params});
}

export function updateArtist(artist) {
    return request.put("/admin/updateArtist", artist);
}

export function addArtist(artist) {
    return request.post("/admin/addArtist", artist);
}

export function deleteArtists(ids) {
    return request.delete("/admin/deleteArtists", {data: ids});
}

export function getSongList(params) {
    return request.get("/admin/getSongList", {params});
}

export function addSong(song) {
    return request.post("/admin/addSong", song);
}

export function uploadAudio(formData) {
    return request.post("/common/uploadAudio", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export function updateSong(song) {
    return request.put("/admin/updateSong", song);
}

export function deleteSongs(ids) {
    return request.delete("/admin/deleteSongs", {data: ids});
}

export function getPlaylists(params) {
    return request.get("/admin/getPlaylists", {params});
}

export function updatePlaylist(playlist) {
    return request.put("/admin/updatePlaylist", playlist);
}

export function addPlaylist(playlist) {
    return request.post("/admin/addPlaylist", playlist);
}

export function deletePlaylists(ids) {
    return request.delete("/admin/deletePlaylists", {data: ids});
}

export function getFeedbacks(params) {
    return request.get("/admin/getFeedbacks", {params});
}

export function deleteFeedbacks(ids) {
    return request.delete("/admin/deleteFeedbacks", {data: ids});
}

export function getBanners(params) {
    return request.get("/admin/getBanners", {params});
}

export function updateBanner(banner) {
    return request.put("/admin/updateBanner", banner);
}

export function addBanner(banner) {
    return request.post("/admin/addBanner", banner);
}

export function deleteBanners(ids) {
    return request.delete("/admin/deleteBanners", {data: ids});
}

export function getSongsOfPlaylist(params) {
    return request.get("/admin/getSongsOfPlaylist", {params});
}

export function updateSongToPlaylist(song) {
    return request.put("/admin/updateSongToPlaylist", song);
}

export function getTotal(begin, end) {
    return request.get("/admin/getTotal", {
        params: {
            begin,
            end
        }
    });
}

export function getSongStyleReport() {
    return request.get("/admin/getSongStyleReport");
}

export function getArtistCountryTop5() {
    return request.get("/admin/getArtistCountryTop5");
}