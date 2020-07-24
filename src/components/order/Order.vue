<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 标签 -->
            <el-tag type="success" v-if="scope.row.pay_status ==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">{{scope.row.create_time|dateFormat(scope.row.create_time)}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 编辑地址-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <!-- 物流进度-->
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改地址对话框(可改造成修改订单信息)-->
    <el-dialog
      title="修改地址"
      :visible.sync="editAddressDialogVisible"
      width="50%"
      @click="editAddressClosed"
    >
      <!-- 修改地址区域 -->
      <el-form
        :model="editAddressForm"
        :rules="editAddressRules"
        ref="editAddressRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="editAddressForm.address1"
            :options="cityData"
            :props="addressProps"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editAddressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="editAddressDialogVisible= false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 显示物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
      <!-- 时间线区域 -->
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata'
export default {
  data() {
    return {
      // 搜索条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      // 订单列表数据
      orderList: [],
      // 页面的总数据条数
      total: 0,
      // 控制是否显示编辑地址的对话框
      editAddressDialogVisible: false,
      // 修改地址的表单对象
      editAddressForm: {
        // 省市区县
        address1: [],
        // 详细地址
        address2: '',
      },
      // 修改地址的表单校验规则对象
      editAddressRules: {
        // 省市区/县
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' },
        ],
        // 详细地址
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      },
      // 省市区/县数据
      cityData: cityData,
      // 指定级联选择器的配置对象
      addressProps: {
        // 指定选项的值为选项对象的某个属性值
        value: 'value',
        // 看到的值
        label: 'label',
        // 指定选项的子选项为选项对象的某个属性值,父子级联属性
        children: 'children',
        // 次级菜单的展开方式
        expandTrigger: 'hover',
      },
      // 控制物流进度对话框是否显示
      progressDialogVisible: false,
      // 物流进度信息
      progressInfo: [],
    }
  },
  created() {
    // 获取订单列表
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      // 发起网络请求获取订单数据
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo,
      })
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      // 请求成功把数据传到data
      this.orderList = res.data.goods
      this.total = res.data.total
      // console.log(this.orderList)
      this.$message.success('获取订单列表成功')
    },
    // 页面的数据条数改变触发事件
    handleSizeChange(newSize) {
      // 把newSize赋值给data
      this.queryInfo.pagesize = newSize
      // 刷新页面
      this.getOrderList()
    },
    // 页码发生改变
    handleCurrentChange(newNum) {
      // 把newNum赋值给data
      this.queryInfo.pagenum = newNum
      // 刷新页面
      this.getOrderList()
    },
    // 点击展示修改地址对话框
    showBox() {
      // 展示对话框
      this.editAddressDialogVisible = true
    },
    // 点击关闭对话框
    editAddressClosed() {
      // 清空表单
      this.$refs.editAddressRef.resetFields()
      // 关闭对话框
      this.editAddressDialogVisible = false
    },
    // 点击显示物流进度对话框
    async showProgressBox() {
      // 发起请求获取物流进度
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      //请求成功
      this.progressInfo = res.data
      console.log(this.progressInfo)
      // 展示对话框
      this.progressDialogVisible = true
    },
  },
}
</script>
<style lang="less" scoped>
// 级联选择器样式
.el-cascader {
  width: 100%;
}
</style>