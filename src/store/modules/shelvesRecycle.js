const state = {
  release: {
    status: 0,
    categories: [],
    productId: "",
    questions: [],
    image: "",
    quoteTemplateId: "",
    recycleMarketPrice: "",
    quantity: ""
  }
};

const mutations = {
  saveReleaseFormData(state, { payload }) {
    state.release = {
      ...state.release,
      ...payload
    };
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
