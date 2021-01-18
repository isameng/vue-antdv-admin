import request from "@/utils/http";

export function listStockRecycles(params) {
  return request({
    url: "/stock-service/admin/stocks/recycle/listStockRecycles",
    method: "get",
    params: { ...params }
  });
}

export function listStockRecycleRecords(params) {
  return request({
    url: "/stock-service/admin/stocks/recycle/listStockRecycleRecords",
    method: "get",
    params: { ...params }
  });
}

export function enterWarehouse(data) {
  return request({
    url: "/stock-service/admin/stocks/recycle/enterWarehouse",
    method: "post",
    data
  });
}
