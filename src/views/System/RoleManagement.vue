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
          <a-button type="danger" icon="delete" size="small" class="m-right-6" @click="roleDelete(record.id)">
            删除
          </a-button>
        </template>
      </a-table>
    </a-card>

    <a-modal
      :title="!isEdit ? '添加角色' : '修改角色'"
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
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-model-item ref="roleName" label="角色名称" prop="roleName">
          <a-input v-model.trim="form.roleName" />
        </a-form-model-item>
        <a-form-model-item ref="roleTag" label="角色标识" prop="roleTag">
          <a-input v-model.trim="form.roleTag" />
        </a-form-model-item>
        <a-form-model-item label="状态" prop="state">
          <a-switch v-model="form.state">
            <a-icon slot="checkedChildren" type="check" />
            <a-icon slot="unCheckedChildren" type="close" />
          </a-switch>
        </a-form-model-item>
        <a-form-model-item ref="roleDesc" label="角色描述" prop="roleDesc">
          <a-input v-model.trim="form.roleDesc" />
        </a-form-model-item>
        <a-form-model-item label="菜单权限">
          <!-- checkStrictly
            :tree-data="treeData"
            v-model="chooseMenus"
            :replace-fields="replaceFields" 
                 @check="onCheck"-->
          <a-tree checkable checkStrictly :tree-data="treeData" v-model="chooseMenus" :replace-fields="replaceFields">
            <template slot="menuName" slot-scope="{ dataRef }">
              <span style="margin-right: 8px">{{ dataRef.menuName }}</span>
              <a-tag :color="dataRef.menuType === 0 ? 'green' : 'orange'">
                {{ dataRef.menuType === 0 ? "菜单" : "功能" }}
              </a-tag>
              <a-dropdown v-if="dataRef.children && dataRef.children.length" style="padding: 0 0 0 5px;">
                <a class="ant-dropdown-link">
                  <a-icon type="bars" />
                </a>
                <a-menu slot="overlay">
                  <a-menu-item @click="changeTreeAll(dataRef)">
                    全选
                  </a-menu-item>
                  <a-menu-item @click="clearTreeAll(dataRef)">
                    清除
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </template>
          </a-tree>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { getRoles, saveOrUpdate, updateState, deleteRole, initRole } from "@/api/role";

const columns = [
  {
    title: "角色编号",
    dataIndex: "id"
  },
  {
    title: "角色名称",
    dataIndex: "roleName"
  },
  {
    title: "角色标识",
    dataIndex: "roleTag",
    scopedSlots: { customRender: "roleTag" }
  },
  {
    title: "角色描述",
    dataIndex: "roleDesc"
  },
  {
    title: "角色状态",
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
  name: "RoleManagement",

  data() {
    return {
      data: [],
      treeData: [],
      replaceFields: {
        title: "menuName",
        key: "menuId"
      },
      columns,
      modalVisible: false,
      confirmLoading: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      form: {
        roleName: "",
        roleTag: "",
        state: false,
        roleDesc: ""
      },
      rules: {
        roleName: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        roleTag: [{ required: true, message: "请输入角色标识", trigger: "blur" }]
      },
      pageSize: 100,
      tableLoading: false,
      operationRecord: "",
      isEdit: false,
      chooseMenus: []
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      this.tableLoading = true;
      getRoles(this.pageSize)
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
        this.form.roleName = record.roleName;
        this.form.roleTag = record.roleTag;
        this.form.state = record.state === 1 ? true : false;
        this.form.roleDesc = record.roleDesc;
        this.operationRecord = record;
      }
      initRole(isEdit ? record.id : "").then(response => {
        const { details } = response;
        this.treeData = getNeedMenus(details.menus);
        // this.treeData = details.menus;
        this.chooseMenus = details.chooseMenus || [];
      });
      this.modalVisible = true;
    },

    handleOk() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.confirmLoading = true;
          const requestData = {};
          requestData.roleName = this.form.roleName;
          requestData.roleTag = this.form.roleTag;
          requestData.roleDesc = this.form.roleDesc;
          requestData.state = this.form.state ? 1 : 0;
          if (Object.prototype.toString.call(this.chooseMenus) === "[object Object]") {
            requestData.menuIds = this.chooseMenus.checked;
          } else {
            requestData.menuIds = this.chooseMenus;
          }
          if (this.isEdit) {
            requestData.id = this.operationRecord.id;
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

    onCheck(checkedKeys, e) {
      console.log("onCheck", checkedKeys);
      console.log("onCheck", e);
    },

    // onSelect(selectedKeys, e) {
    //   console.log("onSelect", selectedKeys);
    //   console.log("onSelect", e);
    // },

    roleDelete(roleId) {
      const that = this;
      this.$modal.confirm({
        title: "确定删除该条角色信息吗？",
        // content: "When clicked the OK button, this dialog will be closed after 1 second",
        okType: "danger",
        onOk() {
          return new Promise((resolve, reject) => {
            const dataSource = [...that.data];
            const target = dataSource.find(item => item.id === roleId);
            if (target) {
              deleteRole(roleId)
                .then(() => {
                  dataSource.splice(dataSource.indexOf(target), 1);
                  that.data = dataSource;
                  that.$message.success("删除成功!");
                  resolve();
                  //   that.fetchData();
                })
                .catch(reject);
            } else {
              that.$message.error("删除角色出现问题，请重试！");
              resolve();
            }
          });
        }
      });
    },

    statusClick(id, state, dataIndex) {
      const that = this;
      this.$modal.confirm({
        title: state === 1 ? "确认要停用角色吗？" : "确认要启用角色吗？",
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

    //重置表单数据
    initFormFields() {
      this.form = {
        roleName: "",
        roleTag: "",
        state: false,
        roleDesc: ""
      };
    },

    changeTreeAll(treeData) {
      console.log(treeData);
      // console.log(this.chooseMenus);
      // console.log(Object.prototype.toString.call(this.chooseMenus) === "[object Object]");

      let checkeds = [];
      if (Object.prototype.toString.call(this.chooseMenus) === "[object Object]") {
        checkeds = this.chooseMenus.checked;
      } else {
        checkeds = this.chooseMenus;
      }
      this.chooseMenus = [...checkeds, ...getAllMenuIds([treeData])];
      console.log(this.chooseMenus);
    },

    clearTreeAll(treeData) {
      console.log(treeData);
      // console.log(this.chooseMenus);
      const chooseIds = getAllMenuIds([treeData]);
      let checkeds = [];
      if (Object.prototype.toString.call(this.chooseMenus) === "[object Object]") {
        checkeds = this.chooseMenus.checked;
      } else {
        checkeds = this.chooseMenus;
      }
      this.chooseMenus = checkeds.filter(item => !chooseIds.includes(item));
      console.log(this.chooseMenus);
    }
  }
};

const getAllMenuIds = treeData => {
  let values = [];
  for (let item of treeData) {
    values.push(item.menuId);
    if (item.children && item.children.length > 0) {
      values = values.concat(getAllMenuIds(item.children));
    }
  }
  return values;
};

const getNeedMenus = menus => {
  function r(menus) {
    return menus.filter(menu => {
      menu.scopedSlots = { title: "menuName" };
      if (menu.children && menu.children.length > 0) {
        menu.children = r(menu.children);
      }
      return true;
    });
  }
  return r(menus);
};
</script>

<style></style>
