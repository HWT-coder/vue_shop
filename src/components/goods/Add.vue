<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false" center></el-alert>
      <!-- 步骤条区域-->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs标签页区域 -->
      <!-- 添加商品的表单区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择框 -->
              <el-cascader
                clearable
                v-model="addForm.goods_cat"
                :options="CateList"
                :props="cateProps"
                @change="selectedKeysChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableList" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb ,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染表单的item项-->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableList" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 渲染表单的item项 -->
            <el-form-item>
              <!-- 上传图片区域 action表示图片要上传到的API地址-->
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess"
              >
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
           <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" alt="图片加载失败" class="previewImg">
    </el-dialog>
  </div>
</template>
<script>
// 导入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条默认激活索引
      activeIndex: '0',
      //添加商品的表单对象
      addForm: {
        // 商品名称
        goods_name: '',
        // 商品价格
        goods_price: 0,
        // 商品重量
        goods_weight: 0,
        // 商品数量
        goods_number: 0,
        // 商品所属的分类数组,级联选择框选中的id数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce:'',
        // 属性数组
        attrs:[]
      },
      // 添加商品的表单校验规则
      addFormRules: {
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
        // 商品分类校验规则
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },
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
        expandTrigger: 'hover',
      },
      // 动态参数列表数据
      manyTableList: [],
      // 静态属性参数列表数据
      onlyTableList: [],
      // 图片上传地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 图片的预览路径
      previewPath: '',
      // 控制是否显示图片预览对话框
      previewDialogVisible:false
    }
  },
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
      // console.log(this.addForm.goods_cat)
      // 控制级联选择器只能选中3级分类，否则清空数组
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //标签页切换之前的钩子函数
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将离开的标签页'+oldActiveName)
      // console.log('即将进入的标签页'+activeName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        // 阻止标签页的切换
        return false
      }
    },
    // 标签页被选中时触发的事件
    async tabClicked() {
      // console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        // console.log('动态参数面板')
        // 发送请求获取参数列表
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' },
          }
        )
        // 请求失败
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // 成功就把数据传到data中
        // 按空格分隔，将字符串处理成数组
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        // console.log(res.data)
        this.manyTableList = res.data
      } else if (this.activeIndex === '2') {
        //证明访问的是静态属性面板
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' },
          }
        )
        // 请求失败
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // 成功就把数据传到data中
        // console.log(res.data)
        this.onlyTableList = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      // 展示图片对话框
      this.previewDialogVisible=true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath)
      // 3.调用数组的splice方法，把图片信息对象从pics中移除
      this.addForm.pics.splice(i, 1)
      // console.log(this.addForm)
    },
    // 监听图片上传成功的钩子函数
    handleSuccess(response) {
      // console.log(response)
      // 1.拼接得到一个图片信息的对象
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },
    // 点击按钮，添加商品
    addGood(){
      // console.log(this.addForm)
      // 表单预校验
      this.$refs.addFormRef.validate(async valid=>{
          //校验失败
          if(!valid){
            return this.$message.error('请填写必要的表单项')
          }
          // 执行添加的业务逻辑
          // 处理添加表单中的数组
          // lodash cloneDeep(obj)
          // 做深拷贝，让它不和表单的数组冲突
           const form= _.cloneDeep(this.addForm)
          form.goods_cat=form.goods_cat.join(',')
          // 处理动态参数
          this.manyTableList.forEach(item =>{
            const newInfo={
              attr_id:item.attr_id,
              attr_value:item.attr_vals.join(',')
            }
            this.addForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTableList.forEach(item=>{
            const newInfo={
              attr_id:item.attr_id,
              attr_value:item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs=this.addForm.attrs 
          console.log(form)
          // 校验成功发起网络请求添加商品,商品名称必须唯一
          const{data:res}=await this.$http.post('goods',form)
          // 请求失败
          if (res.meta.status!==201) {
            return this.$message.error('创建商品失败')
          }
          // 成功
          this.$message.success('创建商品成功')
          // 编程式导航跳转回商品列表
          this.$router.push('/goods')
      })
    }
  },
  // 计算属性
  computed: {
    // 选中级联选择器的三级Id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
  },
}
</script>
<style lang="less" scoped>
// 复选框样式
.el-checkbox {
  margin: 0px 10px 0px 0px !important;
}
// 预览图片的样式
.previewImg{
  width:100%;
  height: 100%;

}
// 添加商品按钮的样式
.btnAdd{
  margin: 15px 0;
}
</style>