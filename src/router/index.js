import Vue from "vue";
import Router from "vue-router";
import NotFound from "@/views/404";
import Forbidden from "@/views/403";
import RenderRouterView from "@/components/RenderRouterView";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
// import findLast from "lodash/findLast";
// import { check } from "@/utils/auth";
// import { notification } from "ant-design-vue";
import store from "@/store";

Vue.use(Router);

// 解决导航栏重复点击的问题
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

/* 初始路由 */
const defaultRoutes = [
  {
    path: "/user",
    // component: { render: h => h("router-view") },
    hideInMenu: true,
    component: () => import(/* webpackChunkName: "layout" */ "@/layouts/UserLayout"),
    children: [
      {
        path: "/user",
        redirect: "/user/login"
      },
      {
        path: "/user/login",
        name: "login",
        component: () => import(/* webpackChunkName: "user" */ "@/views/User/Login")
      },
      {
        path: "/user/register",
        name: "register",
        component: () => import(/* webpackChunkName: "user" */ "@/views/User/Register")
      }
    ]
  }
];

/* 准备动态添加的路由 */
export const authRoutes = [
  {
    path: "/",
    meta: { requiresAuth: true },
    component: () =>
      //异步加载 webpack打包
      import(/* webpackChunkName: "layout" */ "@/layouts/BasicLayout"),
    children: [
      {
        path: "/",
        redirect: "/dashboard/analysis"
      },
      {
        path: "/redirect",
        component: RenderRouterView,
        hideInMenu: true,
        children: [
          {
            path: "/redirect/:path(.*)",
            name: "redirect",
            component: () => import("@/views/Redirect/index")
          }
        ]
      },
      //首页
      {
        path: "/dashboard",
        name: "dashboard",
        meta: { icon: "home", title: "首页", noBreadcrumb: true },
        // component: { render: h => h("router-view") },
        component: RenderRouterView,
        children: [
          {
            path: "/dashboard/analysis",
            name: "analysis",
            meta: { title: "分析页" },
            component: () => import(/* webpackChunkName: "dashboard" */ "@/views/Dashboard/Analysis")
          }
        ]
      }
    ]
  },
  {
    path: "/403",
    name: "403",
    hideInMenu: true,
    component: Forbidden
  },
  {
    path: "*",
    name: "404",
    hideInMenu: true,
    component: NotFound
  }
];

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: defaultRoutes
});

router.beforeEach((to, from, next) => {
  if (to.path !== from.path) {
    NProgress.start();
  }

  if (!store.state.user.token) {
    // console.log(to.matched);
    if (to.matched.length > 0 && !to.matched.some(record => record.meta.requiresAuth)) {
      next();
    } else {
      //   console.log(to);
      if (to.path !== "/user/login") {
        next({
          path: "/user/login"
        });
      }
    }
  } else {
    if (!store.state.permission.permissionList) {
      store.dispatch("permission/fetchPermission").then(() => {
        //next传参数后，当前要进入的路由会被废止，转而进入参数对应的路由，虽然是同一个路由，这么做主要是为了确保addRoutes生效了。
        next({ path: to.path });
      });
    } else {
      if (to.path !== "/user/login") {
        next();
      } else {
        next(from.fullPath);
      }
    }
    // const record = findLast(to.matched, record => record.meta.authority);
    // if (record && !check(record.meta.authority)) {
    //   if (to.path !== "/403") {
    //     notification.error({
    //       message: "403",
    //       description: "你没有权限，请联系斌爷"
    //     });
    //     next({
    //       path: "/403"
    //     });
    //   }
    // }
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
