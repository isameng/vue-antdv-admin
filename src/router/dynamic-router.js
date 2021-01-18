import RenderRouterView from "@/components/RenderRouterView";

const dynamicRoutes = [
  //货架管理
  {
    path: "/shelves",
    name: "shelves",
    meta: { icon: "shop", title: "货架管理" },
    // component: { render: h => h("router-view") },
    component: RenderRouterView,
    children: [
      {
        path: "/shelves/shelves-recycle",
        name: "shelves-recycle",
        meta: { title: "回收货架" },
        component: () => import(/* webpackChunkName: "shelves" */ "@/views/Shelves/ShelvesRecycle/ShelvesRecycle")
      },
      {
        path: "/shelves/shelves-recycle-release",
        name: "shelves-recycle-release",
        meta: {
          title: "发布商品",
          activeMenu: "/shelves/shelves-recycle",
          activeMenuTitle: "回收货架"
        },
        hideInMenu: true,
        component: () => import(/* webpackChunkName: "shelves" */ "@/views/Shelves/ShelvesRecycle/RecycleManage")
      },
      {
        path: "/shelves/shelves-lease",
        name: "shelves-lease",
        meta: { title: "租赁货架" },
        component: () => import(/* webpackChunkName: "shelves" */ "@/views/Shelves/ShelvesLease/ShelvesLease")
      },
      {
        path: "/shelves/shelves-lease-release",
        name: "shelves-lease-release",
        meta: {
          title: "发布商品",
          activeMenu: "/shelves/shelves-lease",
          activeMenuTitle: "租赁货架"
        },
        hideInMenu: true,
        component: () => import(/* webpackChunkName: "shelves" */ "@/views/Shelves/ShelvesLease/Release")
      }
    ]
  },
  //订单管理
  {
    path: "/order",
    name: "order",
    meta: { icon: "profile", title: "订单管理" },
    component: RenderRouterView,
    children: [
      {
        path: "/order/order-recycle",
        name: "order-recycle",
        meta: { title: "回收订单" },
        component: () => import(/* webpackChunkName: "order" */ "@/views/Order/OrderRecycle")
      },
      {
        path: "/order/order-recycle-detail",
        name: "order-recycle-detail",
        meta: {
          title: "订单详情",
          activeMenu: "/order/order-recycle",
          activeMenuTitle: "回收订单"
        },
        hideInMenu: true,
        component: () => import(/* webpackChunkName: "order" */ "@/views/Order/OrderRecycleDetail")
      }
    ]
  },
  //客服中心
  {
    path: "/service",
    name: "service",
    meta: {
      icon: "customer-service",
      title: "客服中心"
    },
    // component: { render: h => h("router-view") },
    component: RenderRouterView,
    children: [
      {
        path: "/service/service-bargain",
        name: "service-bargain",
        meta: { title: "回收议价" },
        component: () => import(/* webpackChunkName: "service" */ "@/views/Service/ServiceBargain")
      }
    ]
  },
  //入库管理
  {
    path: "/entering-warehouse",
    name: "entering-warehouse",
    meta: {
      icon: "reconciliation",
      title: "入库管理"
    },
    // component: { render: h => h("router-view") },
    component: RenderRouterView,
    children: [
      {
        path: "/entering-warehouse/recycle",
        name: "recycle",
        meta: { title: "回收入库" },
        component: () => import(/* webpackChunkName: "enteringWarehouse" */ "@/views/EnteringWarehouse/Recycle")
      }
    ]
  },
  //库存管理
  {
    path: "/inventory",
    name: "inventory",
    meta: {
      icon: "file-search",
      title: "库存管理"
    },
    // component: { render: h => h("router-view") },
    component: RenderRouterView,
    children: [
      {
        path: "/inventory/inventory-list",
        name: "inventory-list",
        meta: { title: "库存列表" },
        component: () => import(/* webpackChunkName: "inventory" */ "@/views/Inventory/InventoryList")
      }
    ]
  },
  //商品管理
  {
    path: "/product",
    name: "product",
    meta: {
      icon: "file-protect",
      title: "商品管理"
    },
    component: RenderRouterView,
    children: [
      {
        path: "/product/product-list",
        name: "product-list",
        meta: { title: "商品列表" },
        component: () => import(/* webpackChunkName: "product" */ "@/views/Product/ProductList")
      },
      {
        path: "/product/product-detail-list",
        name: "product-detail-list",
        hideInMenu: true,
        meta: {
          title: "商品明细",
          activeMenu: "/product/product-list",
          activeMenuTitle: "商品列表"
        },
        component: () => import(/* webpackChunkName: "product" */ "@/views/Product/ProductDetailList")
      },
      {
        path: "/product/product-list",
        name: "product-list",
        meta: { title: "商品分类" },
        component: () => import(/* webpackChunkName: "product" */ "@/views/Product/ProductList")
      },
    ]
  },
  //系统管理
  {
    path: "/system",
    name: "system",
    meta: {
      icon: "setting",
      title: "系统管理"
    },
    component: RenderRouterView,
    children: [
      {
        path: "/system/user-management",
        name: "user-management",
        meta: { title: "用户管理" },
        component: () => import(/* webpackChunkName: "system" */ "@/views/System/UserManagement")
      },
      {
        path: "/system/menu-management",
        name: "menu-management",
        meta: { title: "菜单管理" },
        component: () => import(/* webpackChunkName: "system" */ "@/views/System/MenuManagement")
      },
      {
        path: "/system/role-management",
        name: "role-management",
        meta: { title: "角色管理" },
        component: () => import(/* webpackChunkName: "system" */ "@/views/System/RoleManagement")
      }
    ]
  }
];

export default dynamicRoutes;
