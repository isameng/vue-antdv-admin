import request from "@/utils/http";

export function listStocks(params) {
  return request({
    url: "/stock-api/admin/stocks/listStocks",
    method: "get",
    params: { ...params }
  });
}
