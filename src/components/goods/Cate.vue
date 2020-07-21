<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类区域 -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类区域表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 作用域插槽 -->
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" size="mini" v-if="scope.row.cat_level ===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level ===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类表单内容主体区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 ;options用来指定数据源;props用来指定配置对象-->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="selectedKeysChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框-->
    <el-dialog title="修改分类名称" :visible.sync="editCateDialogVisible" width="50%" @close="editCateClosed">
      <!-- 修改分类表单内容主体区域 -->
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" clearable></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="editCateName">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        // 获取所有级别
        type: 3,
        // 第一页
        pagenum: 1,
        // 每页5条数据
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      //  总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      //   控制是否显示添加分类的对话框
      addCateDialogVisible: false,
      // 添加分类表单的数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的ID,默认是0，没有任何父级分类
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单的校验规则对象
      addCateFormRules: {
        // 分类名称校验规则
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类数据列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 指定选项的值为选项对象的某个属性值
        value: 'cat_id',
        // 看到的值
        label: 'cat_name',
        // 指定选项的子选项为选项对象的某个属性值,父子级联属性
        children: 'children',
        // 次级菜单的展开方式
        expandTrigger: 'hover'
      },
      // 选中的父级分类的ID数组
      selectedKeys: [],
      // 控制是否显示修改分类信息对话框
      editCateDialogVisible: false,
      // 修改分类名称表单对象
      editCateForm:{},
      // 修改分类名称表单校验规则对象
      editCateFormRules:{
        // 分类名称校验规则
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  // 页面刚创建好的生命周期函数
  created() {
    //   获取商品分类数据列表
    this.getCateList()
  },
  methods: {
    //   获取商品分类数据列表
    async getCateList() {
      // 发起网络请求获取分类数据
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      // 请求成功
      // console.log(res)
      // 把数据列表赋值给catelist
      this.cateList = res.data.result
      // 把总数据条数赋值给total
      this.total = res.data.total
    },
    // 监听 pagesize改变事件
    handleSizeChange(newSize) {
      // 把新的pageSize赋值给查询条件
      this.queryInfo.pagesize = newSize
      // 刷新分类数据
      this.getCateList()
    },
    // 监听当前页码值改变
    handleCurrentChange(newPage) {
      // 把newPage赋值给查询条件
      this.queryInfo.pagenum = newPage
      // 刷新分类数据
      this.getCateList()
    },
    // 点击显示添加分类对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 显示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      // 发起网络请求获取父级分类数据
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      // 将数据传给parentCateList
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生改变触发事件
    selectedKeysChange() {
      // console.log(this.selectedKeys)
      // 如果selectedKeys数组中的length，证明选中了父级分类
      // 反之，就说明没有选中任何父级
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 分类的level值[0,1,2]，level值和selectedKeys数组长度一致
        this.addCateForm.cat_level = this.selectedKeys.length
        // 操作完return
        return
      } else {
        // 父级分类的Id重置为0
        this.addCateForm.cat_pid = 0
        // 分类的level值重置为0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类对话框关闭事件
    addCateDialogClosed() {
      // 重置表单数据
      this.$refs.addCateFormRef.resetFields()
      // 清空级联选择器的选中数组
      this.selectedKeys = []
      // 清空添加分类表单的数据
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击按钮添加新的分类
    addCate() {
      // console.log(this.addCateForm)
      // 表单预验证
      this.$refs.addCateFormRef.validate(async valid => {
        // 校验不通过，直接return
        if (!valid) {
          return
        }
        // 校验通过发起网络请求添加新分类
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        //请求失败
        if (res.meta.status !== 201) {
          return this.$message.error('创建分类失败')
        }
        // console.log(res)
        // 请求成功
        this.$message.success('创建分类成功')
        // 刷新分类数据
        this.getCateList()
        // 关闭添加分类对话框
        this.addCateDialogVisible = false
      })
    },
    // 点击按钮弹出修改分类名称对话框
    async showEditCateDialog(id) {
      // console.log(id)
      // 根据id发起网络请求查询信息
      const {data:res}=await this.$http.get('categories/'+id)
      // 请求失败
      if (res.meta.status!==200) {
        return this.$message.error('获取分类信息失败')
      }
      // 请求成功就把数据赋值给表单
      this.editCateForm=res.data
      // console.log(this.editCateForm)
      // 显示对话框
      this.editCateDialogVisible = true
    },
    // 点击修改分类名称
    editCateName(){
      // 表单预校验
      this.$refs.editCateFormRef.validate(async valid=>{
          // 校验失败
          if(!valid) return
          console.log(this.editCateForm)
          // 成功则发起请求修改分类名称
          const {data:res}=await this.$http.put('categories/'+this.editCateForm.cat_id,{cat_name:this.editCateForm.cat_name})
          // 请求失败
          if(res.meta.status!==200){
            return this.$message.error('更新分类名称失败')
          }
          // 成功
          this.$message.success('更新分类名称成功')
          // 刷新分类列表
          this.getCateList()
          // 关闭对话框
          this.editCateDialogVisible=false
      })
    },
    // 点击关闭修改分类对话框事件
    editCateClosed(){
      // 清空表单数据
      this.$refs.editCateFormRef.resetFields()
    },
    // 根据id删除分类
    async removeCateById(id){
      const confirmResult=await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        // 取消删除
        if (confirmResult !=='confirm') {
          return this.$message.info('已取消删除')
        }
        // 发起网络请求删除分类
        // console.log('确认了删除')
        const {data:res}=await this.$http.delete('categories/'+id)
        // 请求失败
        if (res.meta.status!==200) {
          return this.$message.error('删除失败')
        }
        // 删除成功
        this.$message.success('删除成功')
        // 刷新分类列表
        this.getCateList()
    }
  }
}
</script>
<style lang="less" scoped>
// 表格样式
.treeTable {
  margin-top: 15px;
}
// 级联选择器样式
.el-cascader {
  width: 100%;
}
</style>
