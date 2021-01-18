const CONFIG = {
  QINIU_SERVER:
    process.env.VUE_APP_TITLE === "development"
      ? "https://up-z2.qiniup.com"
      : "https://up.qiniup.com",
  IMAGE_HOST:
    process.env.VUE_APP_TITLE === "development"
      ? "http://test.resource.tanwuapp.com/"
      : "https://resource.tanwuapp.com/"
};
export default CONFIG;
