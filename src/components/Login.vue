<!--结构-->
<template>
  <!--整个登录组件 -->
  <div class="login_container">
    <!-- 登录组件中间的盒子 -->
    <div class="login_box">
      <!--盒子上面的头像-->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="头像加载失败" />
      </div>
      <!-- 表单区域 -->
      <!-- :model绑定的是登录表单数据;:rules绑定的是表单校验规则;ref是引用，可以获取表单实例对象 -->
      <el-form
        ref="loginFormRef"
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
      >
        <!-- 用户名 -->
        <!-- prop为表单项指定一个验证规则 -->
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            placeholder="请输入密码"
            type="password"
            prefix-icon="iconfont icon-mima"
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<!--行为-->
<script>
export default {
  //存放数据
  data() {
    return {
      //登录表单数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      //这是表单的验证规则对象
      loginFormRules: {
        //验证用户名是否合法
        username: [
          //required:是否必须;message:错误时的提示;trigger:触发验证的时机
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10个字符', trigger: 'blur' }
        ],
        //验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15个字符', trigger: 'blur' }
        ]
      }
    }
  },
  //存放方法
  methods: {
    //重置表单方法
    resetLoginForm() {
      // console.log(this);//当前this指向重置的实例对象
      this.$refs.loginFormRef.resetFields()
    },
    //登录
    login() {
      // console.log(this);//当前指向登录的实例对象
      //校验表单函数，第一个参数是布尔值，第二个是回调函数
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid);//打印校验结果
        if (!valid) return //表单不通过，直接返回
        //表单校验通过
        const { data: res } = await this.$http.post('login', this.loginForm) //返回promise的可以加await，await只能用在被async修饰的方法中
        // console.log(res);
        if (res.meta.status != 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        //1.将登陆成功之后的token保存到客户端的sessionStorage中
        //1.1项目中除了登录之外的其它API接口，必须在登录之后才能访问
        //1.2token只应该在当前网站打开期间生效，所以将token保存在sessionStorage中
        // console.log(res.data.token);
        window.sessionStorage.setItem('token', res.data.token) //保存token到sessionStorage
        //2.通过编程式导航跳转到后台主页，路由地址是/home
        this.$router.push('/home')
      })
    }
  }
}
</script>
<!--样式-->
<!--lang="less"使样式支持less语法格式；scoped关键字试样式只在本组件内生效，防止组件样式冲突-->
<style lang="less" scoped>
//登录容器
.login_container {
  background: #2b4b6b;
  height: 100%;
}
//登录表单区域盒子
.login_box {
  width: 450px;
  height: 300px;
  background: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  // less嵌套头像样式
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    background: #fff;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0, 0, 10px, #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #eee;
    }
  }
  //登录表单
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 20px;
  }
  //按钮样式
  .btns {
    //弹性盒子
    display: flex;
    //水平方向居中
    justify-content: center;
  }
}
</style>
