import request from "@/utils/http";

export function commonConditions(typeIds) {
  return request({
    url: "/aggregation-api/admin/aggregation/common/conditions",
    method: "get",
    params: { typeIds }
  });
}

export function uploadTaoBaoImage(fileUrl) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/manual/uploadTaoBaoImage",
    method: "get",
    params: { fileUrl }
  });
}
