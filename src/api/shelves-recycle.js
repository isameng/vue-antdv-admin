import request from "@/utils/http";

export function productList(params) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/product/list",
    method: "get",
    params: { ...params }
  });
}

export function productDelete(recycleProductId) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/product/delete",
    method: "DELETE",
    params: { recycleProductId }
  });
}

export function productUpdateProps(data) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/product/updateProps",
    method: "PUT",
    data
  });
}

export function productQuoteInfo(id) {
  return request({
    url: `/idlefish-recycle-api/admin/ir/product/productQuoteInfo/${id}`,
    method: "get"
  });
}

export function productDetail(id) {
  return request({
    url: `/idlefish-recycle-api/admin/ir/product/detail/${id}`,
    method: "get"
  });
}

export function productSaveOrUpdate(data) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/product/saveOrUpdate",
    method: "post",
    data
  });
}
