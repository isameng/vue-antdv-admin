<template>
  <div>
    <a-card class="theme-bg" :bordered="false">
      <a-button type="primary" icon="plus" class="m-bottom-12" @click="showModal(false)">新增</a-button>
      <a-table
        size="middle"
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :loading="tableLoading"
        :row-key="record => record.id"
      >
        <template slot="roleTag" slot-scope="text">
          <a-tag color="#87d068">
            {{ text }}
          </a-tag>
        </template>

        <template slot="state" slot-scope="state, record">
          <a-switch :checked="state === 1" @click="statusClick(record.id, state, 'state')">
            <a-icon slot="checkedChildren" type="check" />
            <a-icon slot="unCheckedChildren" type="close" />
          </a-switch>
        </template>

        <template slot="operation" slot-scope="record">
          <a-button type="primary" icon="edit" size="small" class="m-right-6" @click="showModal(true, record)">
            编辑
          </a-button>
          <a-button type="danger" icon="delete" size="small" class="m-right-6" @click="userDelete(record.id)">
            删除
          </a-button>
          <a-button icon="key" size="small" @click="showRestModal(record)">
            重置密码
          </a-button>
        </template>
      </a-table>
    </a-card>

    <a-modal
      :title="!isEdit ? '添加用户' : '修改用户'"
      width="800px"
      :visible="modalVisible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form-model
        style="width: 800px"
        ref="ruleForm"
        :model="form"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item ref="userName" label="账号名称" prop="userName">
          <a-input v-model.trim="form.userName">
            <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item ref="password" label="登录密码" prop="password" v-if="!isEdit">
          <a-input-password v-model.trim="form.password">
            <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)" />
          </a-input-password>
        </a-form-model-item>
        <a-form-model-item ref="realName" label="真实姓名" prop="realName">
          <a-input v-model.trim="form.realName" />
        </a-form-model-item>
        <a-form-model-item label="状态" prop="state">
          <a-switch v-model="form.state">
            <a-icon slot="checkedChildren" type="check" />
            <a-icon slot="unCheckedChildren" type="close" />
          </a-switch>
        </a-form-model-item>
        <a-form-model-item ref="userPhone" label="手机号" prop="userPhone">
          <a-input v-model.trim="form.userPhone" />
        </a-form-model-item>
        <a-form-model-item label="角色">
          <a-checkbox-group v-model="chooseRoles">
            <a-checkbox v-for="item in roleData" :key="item.id" :value="item.id">
              {{ item.roleName }}
            </a-checkbox>
          </a-checkbox-group>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal
      title="重置密码"
      :visible="resetVisible"
      :confirm-loading="confirmLoading"
      @ok="resetOk"
      @cancel="resetCancel"
    >
      <a-form-model
        ref="restForm"
        :model="restForm"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item ref="userName" label="账号名称" prop="userName">
          <a-input v-model.trim="restForm.userName" :disabled="true">
            <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item ref="password" label="登录密码" prop="password">
          <a-input-password v-model.trim="restForm.password">
            <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)" />
          </a-input-password>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { getUsers, updateState, saveOrUpdate, deleteUser, resetPassword, initUser } from "@/api/user";
import { hex_md5 } from "@/utils/md5";
const columns = [
  {
    title: "用户ID",
    dataIndex: "id"
  },
  {
    title: "账号名称",
    dataIndex: "userName"
  },
  {
    title: "真实姓名",
    dataIndex: "realName"
  },
  {
    title: "手机号",
    dataIndex: "userPhone"
  },
  {
    title: "用户状态",
    dataIndex: "state",
    scopedSlots: { customRender: "state" }
  },
  {
    title: "创建时间",
    dataIndex: "gmtCreate"
  },
  {
    title: "创建人名称",
    dataIndex: "creatorName"
  },
  {
    title: "操作",
    scopedSlots: { customRender: "operation" }
  }
];

export default {
  name: "UserManagement",
  data() {
    return {
      data: [],
      roleData: [],
      chooseRoles: [],
      replaceFields: {
        title: "menuName",
        key: "menuId"
      },
      columns,
      modalVisible: false,
      resetVisible: false,
      confirmLoading: false,
      pageSize: 100,
      tableLoading: false,
      operationRecord: "",
      isEdit: false,
      form: {
        userName: "",
        password: "",
        realName: "",
        state: false,
        userPhone: ""
      },
      rules: {
        userName: [{ required: true, message: "请输入账号名称", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }]
      },
      restForm: {
        userName: "",
        password: ""
      }
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      this.tableLoading = true;
      getUsers(this.pageSize)
        .then(response => {
          const { data } = response;
          this.tableLoading = false;
          this.data = data;
        })
        .catch(() => {
          this.tableLoading = false;
        });
    },

    userDelete(userId) {
      const that = this;
      this.$modal.confirm({
        title: "确定删除该条用户信息吗？",
        // content: "When clicked the OK button, this dialog will be closed after 1 second",
        okType: "danger",
        onOk() {
          return new Promise((resolve, reject) => {
            const dataSource = [...that.data];
            const target = dataSource.find(item => item.id === userId);
            if (target) {
              deleteUser(userId)
                .then(() => {
                  dataSource.splice(dataSource.indexOf(target), 1);
                  that.data = dataSource;
                  that.$message.success("删除成功!");
                  resolve();
                  //   that.fetchData();
                })
                .catch(reject);
            } else {
              that.$message.error("删除用户出现问题，请重试！");
              resolve();
            }
          });
        }
      });
    },

    statusClick(id, state, dataIndex) {
      const that = this;
      this.$modal.confirm({
        title: state === 1 ? "确认要停用用户吗？" : "确认要启用用户吗？",
        okType: "danger",
        onOk() {
          return new Promise((resolve, reject) => {
            const dataSource = [...that.data];
            const target = dataSource.find(item => item.id === id);

            if (target) {
              updateState({ id, state: state === 1 ? 0 : 1 })
                .then(() => {
                  target[dataIndex] = state === 1 ? 0 : 1;
                  that.data = dataSource;
                  that.$message.success("更改状态成功！");
                  resolve();
                  // that.fetchData();
                })
                .catch(reject);
            } else {
              that.$message.error("修改状态出现问题，请重试！");
              resolve();
            }
          });
        }
      });
    },

    showModal(isEdit = false, record) {
      this.isEdit = isEdit;
      if (isEdit) {
        this.form.userName = record.userName;
        this.form.realName = record.realName;
        this.form.state = record.state === 1 ? true : false;
        this.form.userPhone = record.userPhone;
        this.operationRecord = record;
      }
      initUser(isEdit ? record.id : "").then(response => {
        const { details } = response;
        this.roleData = details.roles;
        this.chooseRoles = details.chooseRoles || [];
      });
      this.modalVisible = true;
    },

    handleOk() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.confirmLoading = true;
          const requestData = {};
          requestData.userName = this.form.userName;
          requestData.realName = this.form.realName;
          requestData.userPhone = this.form.userPhone;
          requestData.state = this.form.state ? 1 : 0;
          requestData.roleIds = this.chooseRoles;
          if (this.isEdit) {
            requestData.id = this.operationRecord.id;
          } else {
            requestData.userPassword = hex_md5(this.form.password);
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

    showRestModal(record) {
      this.operationRecord = record;
      this.restForm.userName = record.userName;
      this.resetVisible = true;
    },

    resetOk() {
      this.$refs.restForm.validate(valid => {
        if (valid) {
          this.confirmLoading = true;
          const requestData = {};
          requestData.userId = this.operationRecord.id;
          requestData.resetPassword = hex_md5(this.restForm.password);

          resetPassword(requestData)
            .then(() => {
              this.resetVisible = false;
              this.confirmLoading = false;
              this.$message.success("重置成功");
              this.operationRecord = "";
              this.initRestFormFields();
            })
            .catch(() => {
              this.confirmLoading = false;
            });
        } else {
          return false;
        }
      });
    },

    resetCancel() {
      this.resetVisible = false;
      this.operationRecord = "";
      this.$refs.restForm.clearValidate();
      this.initRestFormFields();
    },

    //重置表单数据
    initRestFormFields() {
      this.restForm = {
        userName: "",
        password: ""
      };
    },

    //重置表单数据
    initFormFields() {
      this.form = {
        userName: "",
        password: "",
        realName: "",
        state: false,
        userPhone: ""
      };
    }
  }
};

// const getNeedMenus = menus => {
//   function r(menus) {
//     return menus.filter(menu => {
//       menu.scopedSlots = { title: "menuName" };
//       if (menu.children && menu.children.length > 0) {
//         menu.children = r(menu.children);
//       }
//       return true;
//     });
//   }
//   return r(menus);
// };
</script>

<style></style>
