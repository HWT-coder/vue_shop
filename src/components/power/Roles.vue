<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!--展开列  -->
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 栅格 -->
            <el-row
              :class="['bdbottom',i1 ===0 ? 'bdtop' :'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 第一列：渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  type="primary"
                  closable
                  @close="removeRightsById(scope.row,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二列：渲染二级权限和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2===0 ?'':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightsById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column width="300px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(scope.row.id)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <!-- 分配角色按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="SetRightdialogVisible"
      width="50%"
      @close="SetRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色信息对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editRoleForm"
        :rules="editRoleRules"
        ref="editRoleFormRef"
        label-width="80px"
      >
        <el-form-item label="角色ID">
          <el-input v-model="editRoleForm.roleId" readonly disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addRoleForm" :rules="editRoleRules" ref="addRoleRef" label-width="80px">
        <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 角色列表数据
      roleList: [],
      //   控制是否显示分配权限对话框
      SetRightdialogVisible: false,
      //   所有权限的数据
      rightsList: [],
      //   树形控件的属性绑定对象
      treeProps: {
        // 父子嵌套属性
        children: 'children',
        // 标签属性
        label: 'authName'
      },
      // 默认选中的节点Id值数据
      defKeys: [],
      //   当前即将分配权限的角色id
      roleId: '',
      //   控制是否显示修改角色信息对话框
      editRoleDialogVisible: false,
      // 修改角色信息表单
      editRoleForm: [],
      // 编辑角色信息的表单校验规则
      editRoleRules: {
        // 角色名称校验规则
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10个字符', trigger: 'blur' }
        ],
        // 角色描述校验规则
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15个字符', trigger: 'blur' }
        ]
      },
      // 控制是否显示添加角色对话框
      addRoleDialogVisible: false,
      // 添加角色表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      }
    }
  },
  // 在页面创建完成的生命周期函数中获取角色列表
  created () {
    // 获取角色列表
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      // 发起网络请求获取角色列表
      const { data: res } = await this.$http.get('roles')
      // 获取角色列表失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      // 获取角色列表成功
      // console.log(res)
      this.roleList = res.data
    },
    // 根据id删除对应的权限
    async removeRightsById (role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 判断用户是否取消了删除
      if (confirmResult !== 'confirm') {
        // 弹框提示用户已取消删除
        return this.$message.info('已取消删除')
      }
      // 确认了删除
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // 重新刷新角色列表会使页面关闭，不建议使用
      // this.getRolesList()
      // 服务器返回的是最新的权限数据，重新给角色赋值即可
      role.children = res.data
      // 删除成功
      this.$message.success('删除权限成功')
    },
    // 展示分配用户权限的对话框
    async showSetRightDialog (role) {
      // 将角色的id保存在data中
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      // 获取权限列表失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 把获取到权限数据保存到data中
      this.rightsList = res.data
      // 获取权限列表成功
      //   console.log(this.rightsList)
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      // 显示对话框
      this.SetRightdialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id,并保存到defKeys中
    getLeafKeys (node, arr) {
      // 判断是否为三级节点，只需要看有无children属性
      if (!node.children) {
        return arr.push(node.id)
      }
      // 不是三级节点就递归查找
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 设置权限对话框关闭事件
    SetRightDialogClosed () {
      // 清空当前的defKeys,不清空会出bug，之前角色的三级id会一直待在defkeys，导致其它角色的权限增加
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      // 拿到所有半选或全选状态下的id放进数组
      const keys = [
        // ...是展开运算符
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      // 发送网络请求分配角色权限
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      // 分配权限失败
      if (res.meta.status !== 200) {
        this.$message.error('分配角色权限失败')
      }
      // 分配权限成功
      this.$message.success('分配角色权限成功')
      // 重新刷新角色列表
      this.getRolesList()
      // 关闭对话框
      this.SetRightdialogVisible = false
    },
    // 点击展示修改角色信息对话框
    async showEditRoleDialog (id) {
      // 根据id查询信息
      const { data: res } = await this.$http.get('roles/' + id)
      // 查询角色信息失败
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      // 查询成功渲染到表单
      // console.log(res.data)
      this.editRoleForm = res.data
      // 展示对话框
      this.editRoleDialogVisible = true
    },
    // 关闭编辑角色信息对话框清空表单
    editRoleClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 点击确定修改角色信息
    editRole () {
      // 表单预校验
      this.$refs.editRoleFormRef.validate(async valid => {
        // console.log(valid)
        // 校验结果不通过直接return
        if (!valid) return
        // 发起网络请求修改角色信息
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )
        // 修改角色信息失败
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败')
        }
        // 提示用户成功
        this.$message.success('修改角色信息成功')
        // 关闭对话框
        this.editRoleDialogVisible = false
        // 重新刷新角色列表
        this.getRolesList()
      })
    },
    // 点击删除角色
    async removeRoleById (id) {
      // console.log(id)
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户取消了删除，则返回字符串 cancel
      // 如果用户确定删除，则返回字符串 confirm
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // console.log('确认了删除')
      // 发起网络请求删除角色
      const { data: res } = await this.$http.delete('roles/' + id)
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      // 删除成功
      this.$message.success('删除角色成功')
      // 更新角色列表
      this.getRolesList()
    },
    // 点击展示添加角色对话框
    showAddRoleDialog () {
      this.addRoleDialogVisible = true
    },
    // 点击添加角色
    addRole () {
      // 校验表单
      this.$refs.addRoleRef.validate(async valid => {
        // 校验表单不通过直接return
        if (!valid) return
        // 校验通过发起网络请求
        const { data: res } = await this.$http.post('roles', { roleName: this.addRoleForm.roleName, roleDesc: this.addRoleForm.roleDesc })
        // 创建角色失败
        if (res.meta.status !== 201) {
          this.$message.error('创建角色失败')
        }
        // 创建角色成功
        this.$message.success('创建角色成功')
        // console.log(res)
        // 刷新角色列表
        this.getRolesList()
        // 隐藏添加角色对话框
        this.addRoleDialogVisible = false
      })
    },
    // 点击关闭添加角色对话框事件
    addRoleClosed () {
      // 清空表单
      this.$refs.addRoleRef.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
// 标签样式
.el-tag {
  margin: 7px;
}
// 展开列第一行的样式
.bdtop {
  border-top: 1px solid #eee;
}
// 展开列每一行的样式
.bdbottom {
  border-bottom: 1px solid #eee;
}
// 纵向居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>
