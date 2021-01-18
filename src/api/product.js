import request from "@/utils/http";

export function productInfo(id) {
  return request({
    url: `/product-api/admin/product/info/${id}`,
    method: "get"
  });
}

export function productList(params) {
  return request({
    url: "/product-api/admin/product/list",
    method: "get",
    params: { ...params }
  });
}

export function skuList(productId) {
  return request({
    url: `/product-api/admin/product/skuList/${productId}`,
    method: "get"
  });
}
