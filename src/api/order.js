import request from "@/utils/http";

export function reportOfPredict(id) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/reportOfPredict",
    method: "get",
    params: { id }
  });
}

export function reportOfQc(id) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/reportOfQc",
    method: "get",
    params: { id }
  });
}

export function updateOrderRemark(data) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/updateOrderRemark",
    method: "post",
    data
  });
}

export function recycleOrderList(params) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/recycleOrderListPage",
    method: "get",
    params: { ...params }
  });
}

export function returnGoods(data) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/confirmReturnGoods",
    method: "post",
    data
  });
}

//确认收货
export function takeGoods(data) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/confirmTakeGoods",
    method: "post",
    data
  });
}

export function cancelOrder(data) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/cancelOrder",
    method: "post",
    data
  });
}

export function recycleOrderDetail(id) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/recycleOrderDetail",
    method: "get",
    params: {
      id
    }
  });
}

export function tracking(id) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/tracking",
    method: "get",
    params: {
      id
    }
  });
}

export function tradingRecord(id) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/tradingRecord",
    method: "get",
    params: {
      id
    }
  });
}

//预约取件
export function takeToAppointment(data) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/takeToAppointment",
    method: "post",
    data
  });
}

//取消预约
export function cancelAppointment(id) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/cancelAppointment",
    method: "get",
    params: {
      id
    }
  });
}

//转账
export function fundTransUniTransfer(id, transferType) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/fundTransUniTransfer",
    method: "get",
    params: { id, transferType }
  });
}

//手动代扣
export function executePayPlan(id) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/executePayPlan",
    method: "get",
    params: { id }
  });
}

//物流信息变更
export function editLogisticsInfo(data) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/editLogisticsInfo",
    method: "post",
    data
  });
}

//物流信息变更记录
export function getOrderLogisticsModify(id, type) {
  return request({
    url: "/idlefish-recycle-api/admin/ir/orders/getOrderLogisticsModify",
    method: "get",
    params: { id, type }
  });
}
