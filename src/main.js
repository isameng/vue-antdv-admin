import Vue from "vue";
import App from "./App.vue";
import router from "@/router/index";
import store from "./store";
import {
  Row,
  Col,
  Layout,
  Icon,
  Drawer,
  Radio,
  Menu,
  Form,
  Input,
  Select,
  Dropdown,
  Avatar,
  Skeleton,
  BackTop,
  Breadcrumb,
  Card,
  Button,
  DatePicker,
  Table,
  Tag,
  Divider,
  Pagination,
  ConfigProvider,
  Descriptions,
  Badge,
  Timeline,
  Anchor,
  message,
  Modal,
  inputNumber,
  Steps,
  Checkbox,
  Upload,
  Collapse,
  Spin,
  Result,
  Cascader,
  Alert,
  Empty,
  Popconfirm,
  Switch,
  Popover,
  Tabs,
  FormModel,
  Tree,
  Tooltip,
  Transfer
} from "ant-design-vue";
import "ant-design-vue/dist/antd.less";
import Authorized from "./components/Authorized";
import Auth from "./directives/auth";
import filter from "./utils/filter";
import VueClipboard from "vue-clipboard2";
import "@/styles/global.less";
import "@/styles/transition.less"
import VueParticles from "vue-particles";

Vue.use(Row);
Vue.use(Col);
Vue.use(Layout);
Vue.use(Icon);
Vue.use(Drawer);
Vue.use(Radio);
Vue.use(Menu);
Vue.use(Form);
Vue.use(Input);
Vue.use(Select);
Vue.use(Dropdown);
Vue.use(Avatar);
Vue.use(Skeleton);
Vue.use(BackTop);
Vue.use(Breadcrumb);
Vue.use(Card);
Vue.use(Button);
Vue.use(DatePicker);
Vue.use(Table);
Vue.use(Tag);
Vue.use(Divider);
Vue.use(Pagination);
Vue.use(ConfigProvider);
Vue.use(Descriptions);
Vue.use(Badge);
Vue.use(Timeline);
Vue.use(Anchor);
Vue.use(Modal);
Vue.use(inputNumber);
Vue.use(Steps);
Vue.use(Checkbox);
Vue.use(Upload);
Vue.use(Collapse);
Vue.use(Spin);
Vue.use(Result);
Vue.use(Cascader);
Vue.use(Alert);
Vue.use(Empty);
Vue.use(Popconfirm);
Vue.use(Switch);
Vue.use(Popover);
Vue.use(Tabs);
Vue.use(FormModel);
Vue.use(Tree);
Vue.use(Tooltip);
Vue.use(Transfer);
Vue.component("Authorized", Authorized);
Vue.use(Auth);
Vue.prototype.$message = message;
Vue.prototype.$modal = Modal;
Vue.use(VueClipboard);
Vue.use(VueParticles);

Object.keys(filter).forEach(key => Vue.filter(key, filter[key]));

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
