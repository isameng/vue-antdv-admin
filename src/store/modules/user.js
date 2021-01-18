import { login } from "@/api/user";

export default {
  namespaced: true,
  state: {
    token: localStorage.getItem("token"),
    auth: false,
    userInfo: JSON.parse(localStorage.getItem("userInfo"))
  },

  mutations: {
    setToken(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    clearToken(state) {
      state.token = "";
      localStorage.setItem("token", "");
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      state.auth = true;
    },
    clearUserInfo(state) {
      state.userInfo = {};
      localStorage.removeItem("userInfo")
      state.auth = false;
    }
  },

  actions: {
    async login({ commit }, loginData) {
      const { details } = await login(loginData);
      const userInfo = {
        userName: details.userName,
        realName: details.realName
      };
      commit("setUserInfo", userInfo);
      commit("setToken", details.token);
      return userInfo;
    }
  }
};
