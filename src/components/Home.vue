<!--结构-->
<template>
  <!--主页容器-->
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <div>
        <img src="../assets/dianshang_logo.jpg" alt="图片加载失败" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--页面主体区域-->
    <el-container>
      <!--侧边栏 -->
      <el-aside :width="isCollapse ? '64px': '200px'">
        <!-- 菜单折叠按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--侧边栏菜单区域-->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF"
        unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!--一级菜单-->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!--一级菜单模板区域-->
            <template slot="title">
              <!--图标-->
              <i :class="iconsObj[item.id]"></i>
              <!--文本-->
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容主体-->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<!--行为-->
<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      // 图标数据
      iconsObj: {
        125: 'iconfont icon-yonghu',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju-tianchong',
        145: 'iconfont icon-shuju'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活路径
      activePath: ''
    }
  },
  // 生命周期函数，页面刚创建完
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录
    logout () {
      // 清空token
      window.sessionStorage.clear()
      // 强制跳转到登录
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      // 获取菜单失败
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 获取菜单成功
      this.menuList = res.data
      // console.log(res)
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      // 给data中的activePath
      this.activePath = activePath
    }
  }
}
</script>
<!--样式-->
<style lang="less" scoped>
//主页容器
.home-container {
  height: 100%;
}
// 头部区域样式
.el-header {
  background: #373d41;
  display: flex; //弹性布局
  justify-content: space-between; //左右对齐
  padding-left: 0px;
  align-items: center;
  color: #fff;
  font-size: 20px;
  //嵌套
  > div {
    display: flex;
    align-items: center;
    img {
      height: 60px;
      width: 60px;
    }
    span {
      margin-left: 15px;
    }
  }
}
//侧边栏样式
.el-aside {
  background: #333744;
  .el-menu{
    border-right: none;
  }
}
//右边主体样式
.el-main {
  background: #eaedf1;
}
//图标样式
.iconfont{
  margin-right: 10px;
}
//隐藏按钮
.toggle-button{
  background: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  // 字体间距
  letter-spacing: 0.2em;
}
.toggle-button:hover{
  //鼠标
  cursor: pointer;
}
</style>
