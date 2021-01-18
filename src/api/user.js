import request from "@/utils/http";

export function login(data) {
  return request({
    url: "/auth-api/admin/user/login",
    method: "post",
    data
  });
}

export function fetchUserInfo() {
  return request({
    url: "/auth-api/admin/user/info",
    method: "get",
  });
}

export function logout() {
  return request({
    url: "/auth-api/admin/user/logout",
    method: "get"
  });
}

export function editPassword(data) {
  return request({
    url: "/auth-api/admin/user/editPassword",
    method: "put",
    data
  });
}


export function initUser(userId) {
  return request({
    url: "/auth-api/admin/user/init",
    method: "get",
    params: { userId }
  });
}

export function getUsers(pageSize) {
  return request({
    url: "/auth-api/admin/user/listPage",
    method: "get",
    params: { pageSize }
  });
}

export function updateState(data) {
  return request({
    url: "/auth-api/admin/user/updateState",
    method: "put",
    data
  });
}

export function saveOrUpdate(data) {
  return request({
    url: "/auth-api/admin/user/saveOrUpdate ",
    method: "post",
    data
  });
}

export function deleteUser(userId) {
  return request({
    url: "/auth-api/admin/user/delete",
    method: "delete",
    params: { userId }
  });
}

export function resetPassword(data) {
  return request({
    url: "/auth-api/admin/user/resetPassword",
    method: "put",
    data
  });
}
