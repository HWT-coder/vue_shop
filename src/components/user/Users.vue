<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" readonly disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    //自定义手机号校验规则
    var checkMobile = (rule, value, cb) => {
      //   验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 校验通过
        return cb()
      }
      // 非法手机号
      cb(new Error('请输入合法的手机号'))
    }
    //自定义校验邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 校验通过
        return cb()
      }
      // 非法的邮箱
      cb(new Error('请输入合法的邮箱'))
    }
    return {
      //获取用户列表的参数
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      //用户列表
      userList: [],
      //总数据条数
      total: 0,
      //控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //控制修改用户信息对话框的显示与隐藏
      editDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        //   用户名
        username: '',
        //   密码
        password: '',
        //   邮箱
        email: '',
        //   手机
        mobile: ''
      },
      //添加用户的表单校验规则对象
      addFormRules: {
        //   用户名校验规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10个字符', trigger: 'blur' }
        ],
        //   密码校验规则
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15个字符', trigger: 'blur' }
        ],
        // 邮箱校验规则
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 手机校验规则
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //修改用户信息表单
      editForm: {},
      //修改用户表单校验规则
      editFormRules: {
        // 邮箱校验规则
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 手机校验规则
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制是否显示分配角色对话框
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 角色列表数据
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: ''
    }
  },
  created() {
    // 获取用户列表
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // 获取用户列表失败
      if (res.meta.status !== 200)
        return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      // 重新发起请求
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      // 重新发起请求
      this.getUserList()
    },
    // 监听 switch 开关状态的改变
    async userStateChanged(userinfo) {
      // console.log(userinfo)
      // 发送请求修改状态
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      // 修改失败
      if (res.meta.status !== 200) {
        //数据库没修改成功也应该把页面状态也改回去
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      // 修改成功
      this.$message.success('更新用户状态成功')
    },
    // 对话框关闭后清空表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新用户
    addUser() {
      // 表单预校验
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        // 校验结果不通过直接return
        if (!valid) return
        // 校验通过，可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        // 添加失败
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
          // 隐藏对话框
          this.addDialogVisible = false
        }
        // 添加成功
        this.$message.success('添加用户成功')
        // 隐藏对话框
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 点击弹出修改用户信息的对话框
    async showEditDialog(id) {
      // console.log(id)
      // 发起网络请求根据id查询用户信息
      const { data: res } = await this.$http.get(`users/${id}`)
      // console.log(res)
      // 查询失败
      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败')
      }
      // 数据获取成功
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改用户信息对话框关闭的事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮修改用户信息
    editUserInfo() {
      // 表单预校验
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        // 校验结果不通过直接return
        if (!valid) return
        // 校验通过，可以发起添加用户的网络请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        // 修改用户信息失败
        if (res.meta.status !== 200) {
          this.$message.error('更新用户信息失败')
          // 隐藏对话框
          this.editDialogVisible = false
        }
        // 修改用户信息成功
        this.$message.success('更新用户信息成功')
        // 隐藏对话框
        this.editDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 点击按钮根据id删除用户信息
    async removeUserById(id) {
      // console.log(id)
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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
      // 发起网络请求删除用户
      const { data: res } = await this.$http.delete('users/' + id)
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      // 删除成功
      this.$message.success('删除用户成功')
      // 更新用户列表
      this.getUserList()
    },
    // 点击展示分配用户角色对话框
    async setRole(userInfo) {
      // 把用户信息保存到data中
      this.userInfo = userInfo
      // 在展示对话框之前获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      // 获取角色列表失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      // 获取角色列表成功
      console.log(res.data)
      // 将返回的角色列表数据保存到data
      this.rolesList = res.data
      // 展示对话框
      this.setRoleDialogVisible = true
    },
    // 点击分配用户角色信息
    async saveRoleInfo() {
      // 判断是否选择分配角色，selectedRoleId为空即未选择
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      // 选择了角色，发起请求分配用户角色
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      // 请求成功
      this.$message.success('更新角色成功')
      // 更新用户列表
      this.getUserList()
      // 关闭对话框
      this.setRoleDialogVisible = false
    },
    // 分配角色对话框关闭事件
    setRoleDialogClosed(){
      // 选中的角色id置为空
      this.selectedRoleId=''
      // 即将分配角色的用户信息置为空
      this.userInfo=''
    }
  }
}
</script>
<style lang="less" scoped>
</style>