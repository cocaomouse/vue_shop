<template>
  <!-- 模版层一定要放一个根容器 div el-container 等进行包裹📦 -->
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
     <!-- span代表每个el-col的宽带,gutter代表每个el-col的间距 -->
     <el-row :gutter="20">
       <el-col :span="8">
           <!-- clearable 输入框中有值后,会显示可清空的功能按钮 -->
           <!-- @clear 在点击由 clearable 属性生成的清空按钮时触发此事件 此事件会调用" "中定义的函数(getUserList将重新获取用户数据) -->
           <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList">
              </el-button>
           </el-input>
       </el-col>
       <el-col :span="4">
           <el-button type="primary" @click="addDialogVisible = true">
             添加用户
           </el-button>
       </el-col>
     </el-row>
     <!-- 用户列表区域 -->
     <!-- data指定数据源 -->
     <el-table :data="userList" border stripe>
       <!-- 索引列 -->
       <el-table-column type="index" label="#"></el-table-column>
       <!-- label指定当前列的标题 -->
       <!-- prop指定当前列指向哪个数据 -->
       <el-table-column label="姓名" prop="username"></el-table-column>
       <el-table-column label="邮箱" prop="email"></el-table-column>
       <el-table-column label="电话" prop="mobile"></el-table-column>
       <el-table-column label="角色" prop="role_name"></el-table-column>
       <el-table-column label="状态">
         <!-- scope.row当前行的数据 -->
         <!-- slot-scope(作用域插槽) 会覆盖el-table-column中的prop属性 -->
         <template slot-scope="scope">
           <!-- el-switch 表示两种相互对立的状态间的切换，多用于触发「开/关」-->
           <!-- v-model双向数据绑定 -->
           <!-- 双向数据绑定:既可以通过数据的改变去驱动DOM视图的变化,也可以通过DOM的变化反过来影响数据,是一个双向关系 -->
           <!-- @change事件 switch状态发生变化时的回调函数 -->
           <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
           </el-switch>
         </template>
       </el-table-column>
       <el-table-column label="操作" width="180px">
         <!-- 通过slot-scop(作用域插槽)接受作用域的数据 -->
         <template slot-scope="scope">
           <!-- el-tooltip鼠标放在按钮上时获取消息提示 enterable是否允许鼠标移动到消息提示框中 -->
           <el-tooltip effect="dark" content="编辑用户" placement="top" :enterable="false">
             <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">
             </el-button>
           </el-tooltip>
           <el-tooltip effect="dark" content="删除用户" placement="top" :enterable="false">
             <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">
             </el-button>
           </el-tooltip>
           <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
             <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
           </el-tooltip>
         </template>
       </el-table-column>
     </el-table>
     <!-- 分页区域 -->
     <!-- @size-change 切换每页显示条数时触发此事件 -->
     <!-- @current-change 当前所在页码发生变化时触发此事件 -->
     <!-- :current-page 当前显示的是第几页的数据 -->
     <!-- :page-size 当前情况下每页显示多少条数据 -->
     <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper" :total="total">
     </el-pagination>
   </el-card>
   <!-- 添加用户的对话框 -->
   <!-- :visible.sync属性绑定,用来控制对话框的显示与隐藏 -->
   <!-- width控制对话框的宽度 -->
   <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
     <!-- 对话框内容主体区域 -->
     <!-- :model表单的数据对象 -->
     <!-- :rules表单验证规则 -->
     <!-- ref为el-form的引用 -->
     <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
       <!-- prop 验证规则的属性 -->
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
       <!-- @click事件将addDialogVisible替换为false(隐藏对话框) -->
       <el-button @click="addDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="addUser">确 定</el-button>
     </span>
   </el-dialog>
   <!-- 修改用户对话框 -->
   <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
     <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" class="demo-ruleForm">
       <el-form-item label="用户名" prop="username">
         <el-input v-model="editForm.username" disabled></el-input>
       </el-form-item>
       <el-form-item label="邮箱" prop="email">
         <el-input v-model="editForm.email"></el-input>
       </el-form-item>
       <el-form-item label="手机号" prop="mobile">
         <el-input v-model="editForm.mobile"></el-input>
       </el-form-item>
     </el-form>
     <!-- 底部按钮区域    -->
     <span slot="footer" class="dialog-footer">
       <el-button @click="editDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="editUserInfo">确 定</el-button>
     </span>
   </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      // 验证邮箱的规则
      var checkEmail = (rule, value, cb) => {
        // 验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          return cb()
        }
        cb(new Error('请输入合法的邮箱!'))
      }
      // 验证手机号的规则
      var checkMobile = (rule, value, cb) => {
        // 验证手机号的正则表达式
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return cb()
        }
        cb(new Error('请输入合法的手机号'))
      }

      return {
        // (定义)获取用户列表的参数对象
        queryInfo: {
          query: '',
          pagenum: 1, // 当前的页数
          pagesize: 5 // 当前每页显示多少条数据
        },
        // 用户数据
        userList: [],
        total:0,
        // 控制 添加用户 的对话框是否显示
        addDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          username:[
            { required: true, message: '请输入用户名', trigger: 'blur' }, // trigger触发验证的时机,blur表示失去焦点时触发验证
            { min: 3, max: 20, message: '用户名的长度在3-10个字符之间', trigger: 'blur' }
          ],
          password:[
            { required: true, message: '请输入密码', trigger: 'blur' }, // trigger触发验证的时机,blur表示失去焦点时触发验证
            { min: 6, max: 20, message: '密码的长度在6-15个字符之间', trigger: 'blur' }
          ],
          email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' },// trigger触发验证的时机,blur表示失去焦点时触发验证
            // 自定义校验规则checkEmail,在data()函数中通过var checkEmail自定义校验规则
            // checkEmail的值指向一个箭头函数,函数的行参中包含三个变量 规则参数 校验返回值 回调函数
            // 调用test(校验返回值)判断校验是否通过,返回的是布尔值
            // return 中调用回调函数参数,代表校验通过,如果在回调函数中提供了一个error对象,代表校验失败
            // 使用时通过validator属性来指定具体的校验规则
            // trigger指定校验的时机
            { validator: checkEmail, trigger: 'blur'}
          ],
          mobile:[
            { required: true, message: '请输入手机号', trigger: 'blur' },// trigger触发验证的时机,blur表示失去焦点时触发验证
            { validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 控制 编辑修改用户 的对话框是否显示
        editDialogVisible: false,
        // 定义查询到的 用户信息 对象
        editForm : {},
        // 添加 编辑表单 的验证规则对象
        editFormRules: {
          email: [
            { required: true, message: '请输入用户邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur'}
          ],
          mobile:[
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.getUserList();
    },
    methods: {
      // 获取 用户列表数据
      async getUserList() {
        const { data:res } = await this.$http.get('users',{ params: this.queryInfo })
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error('获取用户列表失败!');
        this.userList = res.data.users;
        this.total = res.data.total;
      },
      // 定义 handleSizeChange 事件
      // 监听 page-sizes 改变的事件 此函数可获取最新 page-sizes 的value
      handleSizeChange(newSize) {
        console.log(newSize)
        this.queryInfo.pagesize = newSize
        // 每页显示条数改变时 立即触发getUserList() 重新请求一次数据
        this.getUserList()
      },
      // 定义 handleCurrentChange 事件
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        console.log(newPage)
        this.queryInfo.pagenum = newPage
        // 当前页码值改变时 立即触发getUserList() 重新请求一次数据
        this.getUserList()
      },
      // 监听 switch 开关状态的@change事件 获取「状态」的变化
      async userStateChanged(userInfo) {
         console.log(userInfo);
         const { data:res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
         if (res.meta.status !== 200) {
            userInfo.mg_state = !userInfo.mg_state
            return this.$message.error('更新用户状态失败！')
         }
         this.$message.success('更新用户状态成功!')
      },
      // 监听 添加用户 对话框的关闭事件
      // 当关闭 添加用户 对话框时,自动清空对话框
      // addFormRef 为el-form表单中的引用(ref)名称
      // 通过 this.$refs.addFormRef 可获取到el-form表单中的所有值
      // 再调用 resetFields() 函数清空el-form表单中的值
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮 添加新用户
      addUser() {
        // 首先校验数据
        this.$refs.addFormRef.validate(async valid => {
           // valid 为校验后返回的结果 返回结果为布尔值
           // 校验失败,直接返回
           if (!valid) return
           // 校验成功,发起添加用户的网络请求
           // 将返回结果 解构赋值 给res
           const {data: res} = await this.$http.post(`users`,this.addForm)
           // 判断返回结果的code
           if (res.meta.status !== 201) {
              this.$message.error('添加用户失败！')
           }
           this.$message.success('添加用户成功!')
           // 隐藏 添加用户 的对话框
           this.addDialogVisible = false
           // 重新获取 用户列表数据
           this.getUserList()
        })
      },
      // 展示编辑用户的对话框
      async showEditDialog(id) {
        // 根据用户id获取用户信息
        const { data:res }  = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
        this.editForm = res.data
        // 展示 编辑用户 的对话框
        this.editDialogVisible = true
      },
      // 监听 编辑用户 对话框的关闭事件
      editDialogClosed() {
        // 关闭对话框时 重置整个对话框表单
        this.$refs.editFormRef.resetFields()
      },
      // 编辑用户信息并提交
      editUserInfo(id) {
         this.$refs.editFormRef.validate(async valid => {
           if (!valid) return
           // 发起修改用户信息的数据请求
           const { data: res } = await this.$http.put('users/' + this.editForm.id, {
             email: this.editForm.email,
             mobile: this.editForm.mobile,
           })
           if (res.meta.status !== 200) {
             return this.$message.error('更新用户信息失败!')
           }
           // 关闭对话框
           this.editDialogVisible = false
           // 刷新 用户列表
           this.getUserList()
           // 提示修改成功
           this.$message.success('更新用户信息成功！')
        })
      },
      // 根据id 删除用户信息
      async removeUserById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
              }).catch(err => { return err }) // 如果用户点击 取消,则需要 catch 来捕获生成的 error
              // 如果用户点击 确认,则返回值为字符 confirm
              // 如果用户点击 取消,则返回值为字符 cancel
              // console.log(confirmResult)
              if(confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
              }
        const { data: res} = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败！')
        }
        // 提示 删除用户 成功
        this.$message.success('删除用户成功！')
        // 重新请求用户数据
        this.getUserList()        
      }
    }
  }
</script>

<style lange="less" scoped>
</style>
