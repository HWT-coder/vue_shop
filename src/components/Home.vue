<!--结构-->
<template>
    <div>
       <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>
<!--行为-->
<script>
export default {
    methods:{
        //退出登录
        logout(){
            //清空token
            window.sessionStorage.clear();
            //强制跳转到登录
            this.$router.push("/login");
        }
    }
}
</script>
<!--样式-->
<style lang="less" scoped>

</style>