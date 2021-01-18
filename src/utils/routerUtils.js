//格式化后端的数据 变成我们需要的结果 并且返回目录名字集合作为筛选需要动态展示的路由
//暂时用不到这个方法
export const formatMenuList = menuList => {
  const names = [];
  for (let item of menuList) {
    //取路径作为名称
    item.name = item.routePath.substring(item.routePath.lastIndexOf("/") + 1);
    names.push(item.name);
    item.path = item.routePath;
    item.meta = {
      title: item.menuName,
      icon: item.menuIcon || "",
      authority: item.roleTags
    };
    if (item.subMenus) {
      item.children = item.subMenus;
      names.push(...formatMenuList(item.children));
    }
  }
  return names;
};

//获取目录相关的路由
export const getNeedRouters = (menuNames, authRoutes) => {
  function r(authRoutes) {
    return authRoutes.filter(route => {
      if (menuNames.includes(route.name)) {
        if (route.children) {
          route.children = r(route.children);
        }
        return true;
      }
    });
  }
  return r(authRoutes.children);
};

//获取用户拥有权限的目录
export const getNeedMenuList = (auth, menuList) => {
  function r(menuList) {
    return menuList.filter(menu => {
      if (menu.roleTags.some(item => auth.includes(item))) {
        if (menu.children) {
          menu.children = r(menu.children);
        }
        return true;
      }
    });
  }
  return r(menuList);
};

/**
 *
 * @param  {Array} userRouter 后台返回的用户权限json
 * @param  {Array} allRouter  前端配置好的所有动态路由的集合
 * @return {Array} realRoutes 过滤后的路由
 */
export function recursionRouter(userRouter = [], allRouter = []) {
  var realRoutes = [];
  allRouter.forEach(v => {
    // console.log(v.meta.title);
    userRouter.forEach(item => {
      // console.log(item.menuName);
      if (item.menuName === v.meta.title || item.menuName === v.meta.activeMenuTitle) {
        if (item.roleTags && item.roleTags.length > 0) {
          v.meta.authority = item.roleTags;
        }
        if (item.children && item.children.length > 0) {
          v.children = recursionRouter(item.children, v.children);
        } else if (v.children) {
          delete v.children;
        }
        realRoutes.push(v);
      }
    });
  });
  return realRoutes;
}
