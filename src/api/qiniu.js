import request from "@/utils/http";

export function getToken() {
  return request({
    url: "/aggregation-api/admin/aggregation/common/qiNiuToken",
    method: "get"
  });
}
