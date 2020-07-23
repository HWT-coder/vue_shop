<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <!--搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加按钮区域 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table border stripe :data="goodsList">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" width="140px">
          <!--作用域插槽 -->
          <template slot-scope="scope">{{scope.row.add_time |dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditGoodsDialog(scope.row.goods_id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodsById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 25]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
      <!-- 编辑商品对话框 -->
      <el-dialog
        title="编辑商品"
        :visible.sync="editGoodsDialogVisible"
        width="50%"
        @close="editGoodsClosed"
      >
        <!-- 内容主体区域 -->
        <el-form :model="editGoodsForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
          <el-form-item label="商品ID">
            <el-input v-model="editGoodsForm.goods_id" readonly disabled></el-input>
          </el-form-item>
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editGoodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editGoodsForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editGoodsForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editGoodsForm.goods_weight"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editGood">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        //  每页显示条数
        pagesize: 10,
      },
      // 商品列表数据对象
      goodsList: [],
      // 总数据条数
      total: 0,
      // 控制是否显示编辑商品对话框
      editGoodsDialogVisible: false,
      // 编辑商品的表单对象
      editGoodsForm: {},
      // 编辑商品的表单校验规则
      editFormRules: {
        // 商品名称校验规则
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        // 商品价格校验规则
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        // 商品重量校验规则
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        // 商品数量校验规则
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
      },
    }
  },
  // 页面刚创建完成的生命周期函数
  created() {
    //   获取所有商品列表
    this.getGoodsList()
  },
  methods: {
    //   获取所有商品列表
    async getGoodsList() {
      // 发起网络请求获取所有商品列表
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      //请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.$message.success('获取商品列表成功')
      // 请求成功把数据传给商品列表数据
      this.goodsList = res.data.goods
      // 给total赋值
      this.total = res.data.total
      // console.log(this.goodsList)
    },
    // 页面条数size变化
    handleSizeChange(newSize) {
      // 把新值传给data
      this.queryInfo.pagesize = newSize
      // 刷新商品列表
      this.getGoodsList()
    },
    // 页码值发生改变
    handleCurrentChange(newPage) {
      // 把新值传给data
      this.queryInfo.pagenum = newPage
      // 刷新商品列表
      this.getGoodsList()
    },
    // 点击删除商品
    async removeGoodsById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 取消删除
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 确认删除,发送网络请求删除
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete('goods/' + id)
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      // 删除成功
      this.$message.success('删除商品成功')
      // 刷新商品列表
      this.getGoodsList()
    },
    // 点击跳转添加商品页面
    goAddPage() {
      // 跳转路由
      this.$router.push('/goods/add')
    },
    // 点击按钮，显示编辑商品对话框
    async showEditGoodsDialog(id) {
      // console.log(id)
      // 发起请求获取商品信息
      const { data: res } = await this.$http.get(`goods/${id}`)
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$$message.error('获取商品信息失败')
      }
      // 请求成功，把数据渲染到表单
      this.editGoodsForm = res.data
      // console.log(this.editGoodsForm)
      // 展示对话框
      this.editGoodsDialogVisible = true
    },
    // 关闭商品对话框事件
    editGoodsClosed() {
      // 清空表单数据
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定修改商品
    editGood() {
      // 表单预校验
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(this.editGoodsForm)
        // 校验不通过
        if (!valid) {
          return
        }
        // 发送请求修改商品
        const { data: res } = await this.$http.put(
          `goods/${this.editGoodsForm.goods_id}`,
          {
              goods_name: this.editGoodsForm.goods_name,
              goods_price: this.editGoodsForm.goods_price,
              goods_number: this.editGoodsForm.goods_number,
              goods_weight: this.editGoodsForm.goods_weight,
              goods_cat:this.editGoodsForm.goods_cat
          }
        )
        // console.log(res)
        // 请求失败
        if (res.meta.status !== 200) {
          return this.$message.error('修改商品失败')
        }
        // 成功
        this.$message.success('更新商品信息成功')
        // 刷新商品列表
        this.getGoodsList()
        // 关闭对话框
        this.editGoodsDialogVisible = false
      })
    },
  },
}
</script>
<style lang="less" scoped>
</style>