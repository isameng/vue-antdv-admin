const state = {
    release: {
      status: 0,
      name:"",
      rentTimes:[],
      customizeRentTime: false,
      freightTemplateId:"",
      alipayPreAuthCategoryCode: "",
      desc:"",
      accessories: [],
      brandId:"",
      categoryIds:"",
      enableBuyout: false,
      enableRenew: false,
      enableVirtualStock: false,
      productId: false,
      skus:[],
      tags:[],
      regulationIds: [],
      channelIds:[],
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
  