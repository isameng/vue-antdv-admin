import request from "@/utils/http";

export function productList(params) {
  return request({
    url: "/product-api/admin/rent/product/list",
    method: "get",
    params: { ...params }
  });
}

export function updateStatus(data) {
  return request({
    url: "/product-api/admin/rent/product/updateStatus",
    method: "PUT",
    data
  });
}


export function productDelete(rentProductId) {
  return request({
    url: "/product-api/admin/rent/product/delete",
    method: "DELETE",
    params: { rentProductId }
  });
}


export function productInit() {
  return request({
    url: "/product-api/admin/rent/product/init",
    method: "get",
  });
}

export function simpleInfoList(params) {
  return request({
    url: "/product-api/admin/product/simpleInfoList",
    method: "get",
    params: { ...params }
  });
}

export function skuList(params) {
  return request({
    url: "/product-api/admin/rent/product/skuList",
    method: "get",
    params: { ...params }
  });
}

export function productDetail(id) {
  return request({
    url: `/product-api/admin/rent/product/detail/${id}`,
    method: "get"
  });
}

export function productSaveOrUpdate(data) {
  return request({
    url: "/product-api/admin/rent/product/saveOrUpdate",
    method: "post",
    data
  });
}