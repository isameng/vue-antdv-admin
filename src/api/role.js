import request from "@/utils/http";

export function initRole(roleId) {
  return request({
    url: "/auth-api/admin/role/init",
    method: "get",
    params: { roleId }
  });
}

export function getRoles(pageSize) {
  return request({
    url: "/auth-api/admin/role/listPage",
    method: "get",
    params: { pageSize }
  });
}

export function saveOrUpdate(data) {
  return request({
    url: "/auth-api/admin/role/saveOrUpdate",
    method: "post",
    data
  });
}

export function updateState(data) {
  return request({
    url: "/auth-api/admin/role/updateState",
    method: "put",
    data
  });
}

export function deleteRole(roleId) {
  return request({
    url: "/auth-api/admin/role/delete",
    method: "delete",
    params: { roleId }
  });
}
