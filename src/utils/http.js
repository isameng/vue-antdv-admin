import axios from "axios";
import store from "@/store";
import { notification } from "ant-design-vue";
import { logout } from "@/api/user";

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000 // request timeout
});

service.interceptors.request.use(
  config => {
    if (store.state.user.token) {
      config.headers["token"] = store.state.user.token;
    }
    return config;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.head.code !== 0) {
      // 102010001/102010003/102010004/102010005:非法的token; 102010002:Token 过期了; 102030004: 账号已禁用; 102030003:账号已删除; 102030001:账户不存在
      if (
        res.head.code === 102010001 ||
        res.head.code === 102010002 ||
        res.head.code === 102010003 ||
        res.head.code === 102010004 ||
        res.head.code === 102010005 ||
        res.head.code === 102030004 ||
        res.head.code === 102030003
      ) {
        notification.warning({
          // eslint-disable-next-line no-unused-vars
          message: h => (
            <div>
              <span style="color: red"> {res.head.message} </span>
            </div>
          )
        });
        logout();
        localStorage.clear();
        store.commit("user/clearToken");
        store.commit("user/clearUserInfo");
        setTimeout(() => {
          location.reload();
        }, 1000);
      } else {
        notification.error({
          // eslint-disable-next-line no-unused-vars
          message: h => (
            <div>
              请求错误:<span style="color: red"> {res.head.message}</span>
            </div>
          ),
          description: `code: ${res.head.code}`
        });
      }
      return Promise.reject(res.head.message);
    } else {
      return res;
    }
  },
  error => {
    notification.error({
      message: "请求错误",
      description: "服务器异常"
    });
    return Promise.reject(error);
  }
);

export default service;
