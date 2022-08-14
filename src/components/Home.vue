<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logOut">退出</el-button>
    </el-header>
    <!-- 页面主体区 -->
    <el-container>
      <!-- 左侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse"> ||| </div>
        <!-- 侧边栏菜单区域 -->
        <!-- collapse-transition 是否开启折叠动画 -->
        <!-- router 启用该模式会在激活导航时以index作为path进行路由跳转 -->
        <!-- default-active 当前激活菜单(二级菜单)的index(为已点击的菜单栏赋上高亮效果) activePath对应data()中的activePath -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" :unique-opened="true"
        :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                <!-- 一级菜单的模板区域 -->
                <template slot="title">
                  <!-- 图标 -->
                  <i :class="iconsObj[item.id]"></i>
                  <!-- 文本 -->
                  <span>{{ item.authName }}</span>
                </template>
                <!-- 二级菜单 -->
                <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                 @click="saveNavState('/' + subItem.path)">
                  <template slot="title">
                    <!-- 图标 -->
                    <i class="el-icon-menu"></i>
                    <!-- 文本 -->
                    <span>{{ subItem.authName }}</span>
                  </template>
                </el-menu-item>
            </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <!-- welcome 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  // 行为区域
  export default {
    // 组件的私有数据
    data() {
      return {
        // 左侧菜单数据
        menulist: [],
        iconsObj: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
        },
        // 是否折叠
        isCollapse: false,
        // 被激活的链接地址
        activePath: ''
      }
    },
    // 生命周期函数created
    // 当页面刚加载时(刷新时)，立即获取数据
    created() {
      // 左侧边栏
      this.getMenuList();
      // 获取已点击链接的激活状态
      this.activePath = window.sessionStorage.getItem('activePath');
    },
    methods: {
      logOut() {
        window.sessionStorage.clear();
        this.$router.push('/login');
      },
      // 获取所有的左侧菜单
      async getMenuList() {
        // 解构赋值
        const { data: res } = await this.$http.get('menus');
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.menulist = res.data;
      },
      // 点击按钮 切换菜单的折叠与展开
      toggleCollapse() {
        this.isCollapse = !this.isCollapse;
      },
      // 保存链接等激活状态
      saveNavState(activePath) {
        // 点击二级菜单时，把对应的index(索引)值保存到session中
        window.sessionStorage.setItem('activePath',activePath);
        // 为data中的activePath重新赋值
        this.activePath = activePath;
      }
    }
  };
</script>

<style lang="less" scoped>
  .home-container {
    height:100%;
  }
  .el-header {
    background-color: #373D41;
    display: flex;
    justify-content: space-between; // 左右贴边对齐
    padding-left: 10px;
    align-items: center; // 居中
    color:#fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
        //margin-top: 5px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .avatar_box {
    //align-items: center;
    img {
      width: 15%;
      height: 15%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.3em;
    cursor: pointer;
  }
</style>
