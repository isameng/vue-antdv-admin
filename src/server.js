const express = require("express");
const app = express();
app.use("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
app.get("/login", (req, res) => {
  res.json({
    details: {
      userName: "账号01",
      realName: "123",
      token:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHQiOjE2MDMzMzI0MjE1MTMsInVpZCI6MSwicmVhbE5hbWUiOiIxMjMiLCJjdXJ0IjoxNjAwNzQwNDIxNTEzfQ.w_RA4gHhRqFCfXY4X2oKqOqWjKTQ0zkAQGj0MHcgARg",
      menus: [],
      roleNames: ["admin"]
    }
  });
});

app.get("/role", (req, res) => {
  res.json({
    details: {
      menus: [
        {
          menuName: "首页",
          roleNames: ["admin", "ameng"],
          subMenus: [
            {
              menuName: "分析页",
              roleNames: ["admin", "ameng"]
            }
          ]
        },
        {
          menuName: "货架管理",
          roleNames: ["admin", "ameng"],
          subMenus: [
            {
              menuName: "回收货架",
              roleNames: ["admin", "ameng"]
            }
          ]
        },
        {
          menuName: "订单管理",
          roleNames: ["admin", "ameng"],
          subMenus: [
            {
              menuName: "回收订单",
              roleNames: ["admin", "ameng"]
            },
            {
              menuName: "订单详情",
              roleNames: ["admin", "ameng"]
            }
          ]
        },
        {
          menuName: "客服中心",
          roleNames: ["admin", "ameng"],
          subMenus: [
            {
              menuName: "回收议价",
              roleNames: ["admin", "ameng"]
            }
          ]
        },
        {
          menuName: "系统管理",
          roleNames: ["admin", "ameng"],
          subMenus: [
            {
              menuName: "菜单管理",
              roleNames: ["admin", "ameng"]
            },
            {
              menuName: "角色管理",
              roleNames: ["admin", "ameng"]
            }
          ]
        }
      ],
      roleNames: ["admin", "user"]
    }
  });
});
//监听3000端口
app.listen(3000);
