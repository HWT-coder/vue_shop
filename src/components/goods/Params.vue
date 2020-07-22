<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意:只允许为第三级分类设置相关参数!" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            clearable
            v-model="selectedCateKeys"
            :options="CateList"
            :props="cateProps"
            @change="selectedKeysChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tabs标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数按钮 -->
          <el-row>
            <el-col>
              <el-button
                type="primary"
                size="mini"
                :disabled="isBtnDisabled"
                @click="addDialogVisible=true"
              >添加参数</el-button>
            </el-col>
          </el-row>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!--展开列-->
            <el-table-column type="expand">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClosed(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加静态属性按钮 -->
          <el-row>
            <el-col>
              <el-button
                type="primary"
                size="mini"
                :disabled="isBtnDisabled"
                @click="addDialogVisible=true"
              >添加属性</el-button>
            </el-col>
          </el-row>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!--展开列-->
            <el-table-column type="expand">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClosed(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数表单区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改参数表单区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有商品分类列表
      CateList: [],
      // 指定级联选择器的配置对象
      cateProps: {
        // 指定选项的值为选项对象的某个属性值
        value: 'cat_id',
        // 看到的值
        label: 'cat_name',
        // 指定选项的子选项为选项对象的某个属性值,父子级联属性
        children: 'children',
        // 次级菜单的展开方式
        expandTrigger: 'hover'
      },
      //   级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //   被激活的页签的名称
      activeName: 'many',
      //   动态参数表格数据
      manyTableData: [],
      // 静态属性表格数据
      onlyTableData: [],
      //   控制添加参数对话框是否显示
      addDialogVisible: false,
      //   添加参数的表单数据对象
      addForm: {
        //   参数名称
        attr_name: ''
      },
      //添加参数的表单校验规则对象
      addFormRules: {
        //   参数名称校验规则
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //   控制修改参数对话框是否显示
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {},
      // 修改参数的表单校验对象
      editFormRules: {
        //   参数名称校验规则
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  // 页面刚创建完成的生命周期函数
  created() {
    //   获取所有商品分类
    this.getCateList()
  },
  methods: {
    //   获取所有商品分类
    async getCateList() {
      // 发起网络请求获取所有商品分类
      const { data: res } = await this.$http.get('categories')
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // 请求成功
      this.CateList = res.data
      //   console.log(this.CateList)
    },
    // 级联选择器选中项变化触发事件
    selectedKeysChange() {

      // 获取参数列表数据
      this.getParamsData()
    },
    // tab页签点击事件
    handleTabClick() {
      //   console.log(this.activeName)
      // 获取参数列表数据
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 选中的不是三级分类，直接清空选中数组
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData=[]
        this.onlyTableData=[]
        return
      }
      // console.log(this.selectedCateKeys)
      //   根据所选分类的id，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      // 请求成功
      res.data.forEach(item => {
        //判断是否为空，不为空每一项的attr_vals用空格做分割变成数组赋值回去，为空返回空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      // console.log(res.data)
      //判断数据给谁 ，动态参数
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        //静态属性
        this.onlyTableData = res.data
      }
    },
    // 添加参数对话框属性关闭事件
    addDialogClosed() {
      // 清空表单
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮，添加参数
    addParams() {
      // 表单预校验
      this.$refs.addFormRef.validate(async valid => {
        // 校验失败直接return
        if (!valid) return
        // 发起请求添加参数
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 请求失败
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        // 请求成功
        this.$message.success('添加参数成功')
        // 刷新参数列表
        this.getParamsData()
        // 关闭对话框
        this.addDialogVisible = false
      })
    },
    // 点击按钮，展示修改对话框
    async showEditDialog(attr_id) {
      // 发起网络请求根据id查询当前参数的信息
      const {
        data: res
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      )
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取信息失败')
      }
      // 请求成功
      this.editForm = res.data
      // console.log(this.editForm)
      // 展示修改对话框
      this.editDialogVisible = true
    },
    // 点击按钮，关闭修改对话框
    editDialogClosed() {
      // 清空表单
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮，修改参数
    editParams() {
      // 表单预校验
      this.$refs.editFormRef.validate(async valid => {
        // 校验失败直接return
        if (!valid) return
        // 成功发起请求修改参数
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 请求失败
        if (res.meta.status !== 200) {
          return this.$message.error('更新参数失败')
        }
        // 成功
        // console.log(res.data)
        this.$message.success('更新参数成功')
        // 刷新参数列表
        this.getParamsData()
        // 隐藏修改对话框
        this.editDialogVisible = false
      })
    },
    // 点击按钮，删除参数
    async removeParamsById(attr_id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 取消删除
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 确认删除，发起网络请求进行删除
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      // 删除成功
      this.$message.success('删除成功')
      // 刷新参数列表
      this.getParamsData()
    },
    // 文本框失去焦点或者按下了enter键触发此事件
    handleInputConfirm(row) {
      // 去除输入字符串两端的空格，在判断长度是否为0，为0不合法
      if (row.inputValue.trim().length === 0) {
        // 清空输入
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return 则证明输入了内容需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //  保存此次操作
      this.saveAttrVals(row)
      // console.log('ok')
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      // 显示输入框
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick方法的作用，就是当页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 点击删除对应参数的可选项
    handleClosed(i, row) {
      row.attr_vals.splice(i, 1)
      // 保存此次操作
      this.saveAttrVals(row)
    },
    // 将对 attr_vals的操作保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ') //将数据用空格拼接成字符串
        }
      )
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      // 成功
      this.$message.success('修改参数项成功')
    }
  },
  //   计算属性
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      // 如果选中的不是三级分类就返回true禁用
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      // 否则返回false，可用状态
      return false
    },
    // 当前选中的三级分类的ID
    cateId() {
      // 如果选中的分类值为3级分类返回三级id值
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      // 没有这个值
      return null
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
// 选择商品分类区域的样式
.cat_opt {
  margin: 15px 0;
}
// 标签样式
.el-tag {
  margin: 10px;
}
// 标签输入框样式
.input-new-tag {
  width: 120px;
}
</style>