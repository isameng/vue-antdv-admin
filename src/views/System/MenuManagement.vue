<template>
  <div>
    <a-card class="theme-bg" :bordered="false">
      <a-button type="primary" icon="plus" class="m-bottom-12" @click="showModal(false)">一级菜单</a-button>
      <a-table
        size="middle"
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :loading="tableLoading"
        :row-key="record => record.menuId"
      >
        <template slot="menuType" slot-scope="text">
          <a-tag :color="text === 0 ? 'green' : 'orange'">
            {{ text === 0 ? "菜单" : "功能" }}
          </a-tag>
        </template>

        <template slot="operation" slot-scope="record">
          <a-button type="primary" icon="edit" size="small" class="m-right-6" @click="showModal(true, record)">
            编辑
          </a-button>
          <a-button
            v-if="record.menuType === 0"
            type="primary"
            icon="plus"
            size="small"
            class="m-right-6"
            @click="showModal(false, record)"
          >
            新增
          </a-button>
          <a-button type="danger" icon="delete" size="small" class="m-right-6" @click="menuDelete(record.menuId)">
            删除
          </a-button>
        </template>
      </a-table>
    </a-card>
    <a-modal
      :title="!isEdit ? '添加菜单' : '修改菜单'"
      width="600px"
      :visible="modalVisible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form-model
        style="width: 700px"
        ref="ruleForm"
        :model="form"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-model-item ref="parentMenu" label="上级菜单" prop="parentMenu" v-if="!isEdit">
          <a-input v-model.trim="form.parentMenu" :disabled="true" />
        </a-form-model-item>
        <a-form-model-item label="菜单类型" prop="menuType">
          <a-radio-group v-model="form.menuType" @change="menuTypeChange">
            <a-radio :value="0">
              菜单
            </a-radio>
            <a-radio :value="1">
              功能
            </a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item ref="menuName" :label="form.menuType === 0 ? '菜单名称' : '接口名称'" prop="menuName">
          <a-input v-model.trim="form.menuName" />
        </a-form-model-item>
        <a-form-model-item ref="sort" label="显示排序" prop="sort" v-if="form.menuType === 0">
          <a-input v-model.trim="form.sort" />
        </a-form-model-item>
        <a-form-model-item ref="perms" label="权限标识" prop="perms" v-if="form.menuType === 1">
          <a-input v-model.trim="form.perms" />
          <a-alert
            message="控制器中定义的权限字符，如：@PreAuthorize(permission = 'system:role:list')"
            type="info"
            show-icon
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { saveOrUpdate, getMenus, menuDelete } from "@/api/menu";
// import omit from "lodash/omit";
const columns = [
  {
    title: "菜单名称",
    dataIndex: "menuName",
    width: "20%"
  },
  {
    title: "排序",
    dataIndex: "sort"
  },
  {
    title: "类型",
    dataIndex: "menuType",
    scopedSlots: { customRender: "menuType" }
  },
  {
    title: "权限标识",
    dataIndex: "perms"
  },
  {
    title: "操作",
    scopedSlots: { customRender: "operation" }
  }
];

export default {
  name: "MenuManagement",
  data() {
    return {
      data: [],
      columns,
      modalVisible: false,
      confirmLoading: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      form: {
        menuName: "",
        sort: "",
        menuType: 0, //菜单类型:0.菜单;1.功能(接口)
        perms: "", //权限标识
        parentMenu: "无"
      },
      rules: {
        menuName: [{ required: true, message: "请输入名称", trigger: "blur" }],
        menuType: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
        sort: [{ required: true, message: "请输入排序值", trigger: "blur" }],
        perms: [{ required: true, message: "请输入权限标识", trigger: "blur" }]
      },
      pageSize: 100,
      tableLoading: false,
      operationRecord: "",
      isEdit: false
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      this.tableLoading = true;
      getMenus(this.pageSize)
        .then(response => {
          const { data } = response;
          this.tableLoading = false;
          this.data = data;
        })
        .catch(() => {
          this.tableLoading = false;
        });
    },
    showModal(isEdit = false, record) {
      this.isEdit = isEdit;
      if (isEdit) {
        this.form.menuName = record.menuName;
        this.form.menuType = record.menuType;
        if (record.menuType === 0) {
          this.form.sort = record.sort;
        } else {
          this.form.perms = record.perms;
        }
      }
      if (record) {
        this.operationRecord = record;
        this.form.parentMenu = record.menuName;
      }
      this.modalVisible = true;
    },

    menuDelete(menuId) {
      const that = this;
      this.$modal.confirm({
        title: "确定删除该条菜单信息吗？",
        // content: "When clicked the OK button, this dialog will be closed after 1 second",
        okType: "danger",
        onOk() {
          return new Promise((resolve, reject) => {
            menuDelete(menuId)
              .then(() => {
                resolve();
                that.$message.success("删除成功!");
                that.fetchData();
              })
              .catch(reject);
          });
        }
      });
    },

    handleOk() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.isEdit && this.form.menuType === 1 && this.operationRecord.children) {
            this.$message.error("不能变更类型，功能类型不允许有子集！");
            return;
          }
          this.confirmLoading = true;
          const requestData = {};
          requestData.menuType = this.form.menuType;
          requestData.menuName = this.form.menuName;
          if (this.form.menuType === 0) {
            requestData.sort = this.form.sort;
          } else {
            requestData.perms = this.form.perms;
          }
          if (this.isEdit) {
            requestData.id = this.operationRecord.menuId;
          } else if (this.operationRecord) {
            requestData.parentId = this.operationRecord.menuId;
          }

          saveOrUpdate(requestData)
            .then(() => {
              this.modalVisible = false;
              this.confirmLoading = false;
              if (this.isEdit) {
                this.$message.success("修改成功");
                this.isEdit = false;
              } else {
                this.$message.success("新增成功");
              }
              this.operationRecord = "";
              this.initFormFields();
              this.fetchData();
            })
            .catch(() => {
              this.confirmLoading = false;
            });
        } else {
          return false;
        }
      });
    },
    handleCancel() {
      this.modalVisible = false;
      this.initFormFields();
      this.$refs.ruleForm.clearValidate();
      this.operationRecord = "";
    },

    menuTypeChange() {
      //切换菜单类型的时候移除表单项的校验结果
      this.$refs.ruleForm.clearValidate();
    },

    //重置表单数据
    initFormFields() {
      this.form = {
        menuName: "",
        sort: "",
        menuType: 0, //菜单类型:0.菜单;1.功能(接口)
        perms: "", //权限标识
        parentMenu: "无"
      };
    }
  }
};

// const getNeedMenus = menus => {
//   function r(menus) {
//     return menus.filter(menu => {
//       if (menu.children && menu.children.length > 0) {
//         menu.children = r(menu.children);
//       } else {
//         delete menu.children;
//       }
//       return true;
//     });
//   }
//   return r(menus);
// };
</script>

<style></style>
