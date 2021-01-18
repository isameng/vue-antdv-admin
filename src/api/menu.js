import request from "@/utils/http";

export function saveOrUpdate(data) {
  return request({
    url: "/auth-api/admin/menu/saveOrUpdate",
    method: "post",
    data
  });
}


export function getMenus(pageSize) {
  return request({
    url: "/auth-api/admin/menu/listPage",
    method: "get",
    params: { pageSize }
  });
}


export function menuDelete(menuId) {
  return request({
    url: "/auth-api/admin/menu/delete",
    method: "DELETE",
    params: { menuId }
  });
}
