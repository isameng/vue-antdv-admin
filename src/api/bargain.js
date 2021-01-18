import request from "@/utils/http";

export function listRecycleNegotiationOrders(params) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/customer/listRecycleNegotiationOrders",
    method: "get",
    params: { ...params }
  });
}

export function getRecycleNegotiationOrderResult(orderId) {
  return request({
    url:
      "/idlefish-recycle-api/admin/ir/customer/getRecycleNegotiationOrderResult",
    method: "get",
    params: { orderId }
  });
}

export function saveRecycleNegotiationOrderResult(data) {
  return request({
    url:
      "/idlefish-recycle-api/admin/ir/customer/saveRecycleNegotiationOrderResult",
    method: "post",
    data
  });
}
