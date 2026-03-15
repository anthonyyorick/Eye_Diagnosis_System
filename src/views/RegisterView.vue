<template>
  <div class="register-container">
    <!-- 左侧品牌区 -->
    <div class="brand-section">
      <div class="brand-content">
        <!-- <h1 class="system-name">眼底图像眼疾智能诊断系统</h1> -->
        <p class="brand-slogan">
          <!-- 运用先进的人工智能技术，为您提供专业、准确、高效的眼科诊断服务。 -->
        </p>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="form-section">
      <div class="form-container">
        <h2 class="form-title">用户注册</h2>

        <el-form
          ref="registerForm"
          :model="registerForm"
          :rules="rules"
          label-width="0px"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              placeholder="请输入密码"
              :type="passwordVisible ? 'text' : 'password'"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              placeholder="请确认密码"
              :type="passwordVisible ? 'text' : 'password'"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="realName">
            <el-input
              v-model="registerForm.realName"
              placeholder="请输入真实姓名"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- <el-form-item prop="title">
            <el-select
              v-model="registerForm.title"
              placeholder="请选择职称"
              style="width: 100%"
            >
              <el-option label="主任医师" value="主任医师"></el-option>
              <el-option label="副主任医师" value="副主任医师"></el-option>
              <el-option label="主治医师" value="主治医师"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item prop="department">
            <el-input
              v-model="registerForm.department"
              placeholder="请输入科室"
            >
              <template #prefix>
                <el-icon><OfficeBuilding /></el-icon>
              </template>
            </el-input>
          </el-form-item> -->

          <el-form-item prop="email">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱">
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
              <template #append>
                <el-button
                  type="primary"
                  size="small"
                  @click="sendVerificationCode"
                  :disabled="cooldown > 0"
                  class="verification-button"
                  >{{
                    cooldown > 0 ? `${cooldown}秒后重试` : "获取验证码"
                  }}</el-button
                >
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="verificationCode">
            <el-input
              v-model="registerForm.verificationCode"
              placeholder="请输入验证码"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="phone">
            <el-input v-model="registerForm.phone" placeholder="请输入手机号">
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="agreement">
            <el-checkbox v-model="registerForm.agreement">
              我已阅读并同意
              <el-button type="text" @click="showPrivacyPolicy"
                >《隐私政策》</el-button
              >
              和
              <el-button type="text" @click="showUserAgreement"
                >《用户协议》</el-button
              >
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="register-button"
              @click="handleRegister"
              >注册</el-button
            >
          </el-form-item>

          <el-form-item>
            <el-button type="text" class="login-button" @click="goToLogin"
              >已有账号？返回登录</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 隐私协议弹窗 -->
    <el-dialog title="隐私政策" v-model="privacyDialogVisible" width="500px">
      <div class="privacy-content">
        <p>
          欢迎使用眼底图像眼疾智能识别系统。在使用本系统前，请您仔细阅读并同意以下隐私条款：
        </p>
        <ol>
          <li>本系统收集的所有医疗数据仅用于辅助诊断目的</li>
          <li>您上传的眼底图像将严格保密，未经授权不会分享给第三方</li>
          <li>系统会记录您的登录信息和操作日志，以保障账户安全</li>
          <li>您有权随时查看、导出或删除您上传的数据</li>
        </ol>
      </div>
    </el-dialog>

    <!-- 用户协议弹窗 -->
    <el-dialog title="用户协议" v-model="agreementDialogVisible" width="500px">
      <div class="agreement-content">
        <p>欢迎使用眼底图像眼疾智能识别系统。请您仔细阅读以下用户协议：</p>
        <ol>
          <li>本系统仅供医疗专业人员使用，用户需对账号安全负责</li>
          <li>系统提供的诊断结果仅供参考，最终诊断结论应由医生确认</li>
          <li>用户不得将系统用于非医疗目的或进行商业推广</li>
          <li>用户应遵守相关医疗法规和伦理准则</li>
        </ol>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import request from "@/utils/axios"; // 导入配置好的axios实例
import {
  User,
  Lock,
  OfficeBuilding,
  Phone,
  Key,
  Message,
} from "@element-plus/icons-vue";

export default defineComponent({
  name: "RegisterView",
  components: {
    User,
    Lock,
    //OfficeBuilding,
    Phone,
    Key,
    Message,
  },
  data() {
    // 自定义验证规则
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.registerForm.confirmPassword !== "") {
          this.$refs.registerForm.validateField("confirmPassword");
        }
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.registerForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    const validateAgreement = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请阅读并同意隐私政策和用户协议"));
      } else {
        callback();
      }
    };

    return {
      registerForm: {
        username: "",
        password: "",
        confirmPassword: "",
        realName: "",
        title: "",
        department: "",
        phone: "",
        verificationCode: "",
        email: "",
        agreement: false,
      },
      rules: {
        username: [
          { required: true, message: "请输入账号", trigger: "blur" },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
          { validator: validatePass, trigger: "blur" },
        ],
        confirmPassword: [
          { required: true, message: "请确认密码", trigger: "blur" },
          { validator: validatePass2, trigger: "blur" },
        ],
        realName: [
          { required: true, message: "请输入真实姓名", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "长度在 2 到 20 个字符",
            trigger: "blur",
          },
        ],
        title: [{ required: true, message: "请选择职称", trigger: "change" }],
        department: [
          { required: true, message: "请输入科室", trigger: "blur" },
        ],
        email: [
          {
            type: "email",
            required: true,
            message: "请输入邮箱",
            trigger: "blur",
          },
          {
            pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
            message: "请输入正确的邮箱地址",
            trigger: "blur",
          },
        ],
        verificationCode: [
          { required: true, message: "请输入验证码", trigger: "blur" },
          { len: 6, message: "验证码长度应为6位", trigger: "blur" },
        ],
        phone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入正确的手机号",
            trigger: "blur",
          },
        ],
        agreement: [{ validator: validateAgreement, trigger: "change" }],
      },
      passwordVisible: false,
      privacyDialogVisible: false,
      agreementDialogVisible: false,
      cooldown: 0,
      timer: null,
    };
  },
  methods: {
    async handleRegister() {
      try {
        const valid = await this.$refs.registerForm.validate();
        if (valid) {
          // 构造注册请求数据
          const registerData = {
            name: this.registerForm.realName,
            username: this.registerForm.username,
            password: this.registerForm.password,
            phoneNumber: this.registerForm.phone,
            department: this.registerForm.department,
            doctorTitle: this.registerForm.title,
            code: this.registerForm.verificationCode,
            email: this.registerForm.email,
          };

          // 发送注册请求
          const response = await request({
            method: "post",
            url: "/doctor/register",
            headers: {
              "Content-Type": "application/json",
            },
            data: registerData,
          });

          // 检查响应状态
          if (response && (response.code === 200 || response.code === 1)) {
            // 注册成功
            this.$message.success("注册成功，即将跳转到登录页面");
            setTimeout(() => {
              this.$router.push("/login");
            }, 1500);
          } else {
            // 注册失败
            this.$message.error(response?.msg || "注册失败，请重试");
          }
        }
      } catch (error) {
        console.error("注册错误:", error);
        this.$message.error(
          error.response?.data?.msg || "注册失败，请稍后重试"
        );
      }
    },
    goToLogin() {
      this.$router.push("/login");
    },
    async sendVerificationCode() {
      try {
        // 验证邮箱
        if (
          !this.registerForm.email ||
          !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(this.registerForm.email)
        ) {
          this.$message.error("请输入正确的邮箱地址");
          return;
        }

        // 启动倒计时
        this.cooldown = 60;
        this.timer = setInterval(() => {
          this.cooldown--;
          if (this.cooldown <= 0) {
            clearInterval(this.timer);
          }
        }, 1000);

        // 创建 FormData 对象
        const formData = new FormData();
        formData.append("email", this.registerForm.email);

        // 发送验证码请求
        const response = await request({
          method: "post",
          url: "/common/code",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: formData,
        });

        if (response.code === 200 || response.code === 1) {
          // 发送成功
          this.$message.success("验证码已发送到您的邮箱");
        } else {
          this.$message.error(response.data.msg || "验证码发送失败，请重试");
        }
      } catch (error) {
        console.error("发送验证码错误:", error);
        this.$message.error(
          error.response?.data?.msg || "验证码发送失败，请稍后重试"
        );
      }
    },
    showPrivacyPolicy() {
      this.privacyDialogVisible = true;
    },
    showUserAgreement() {
      this.agreementDialogVisible = true;
    },
  },
  beforeUnmount() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
});
</script>

<style scoped>
.register-container {
  display: flex;
  height: 100vh;
  width: 100%;
  /* background-image: url("https://static.vecteezy.com/system/resources/previews/042/971/984/non_2x/blue-doctor-wireframe-ai-medical-line-medical-treatment-illustration-use-ai-to-help-treat-concept-and-modern-on-health-background-health-insurance-vector.jpg"); */
  background-image: url("@/assets/images/wmremove-transformed.png");
  background-size: cover;
}

.brand-section {
  flex: 0 0 50%;
  /* background: linear-gradient(135deg, #1976d2, #64b5f6); */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 0rem;
}

.brand-content {
  /* text-align: center; */
  /* background-color: rgba(255, 255, 255, 0.5); */
  /* backdrop-filter: blur(10px); */
  border-radius: 10px;
  /* border: 1px solid rgba(255, 255, 255, 0.2); */
  /* margin-left: 5rem; */
  /* margin-top: -4.8rem; */
  /* padding: 0 1.5rem; */
  padding-bottom: 1.8rem;
  color: #fff;
  /* color: white; */
  /* text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black,
    1px 1px 0 black; */
  margin-left: 5rem;
  margin-top: -40rem;
}

.system-name {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.brand-slogan {
  font-size: 1.2rem;
  opacity: 0.9;
}

.form-section {
  flex: 0 0 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background-color: #f5f7fa; */
  overflow-y: auto;
}

.form-container {
  width: 400px;
  padding: 0 2rem;
  background: #fff;
  border-radius: 8px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
  margin-right: 0rem;
}

.form-title {
  font-size: 24px;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
}

.register-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.login-button {
  width: 100%;
  text-align: center;
}

.privacy-content,
.agreement-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 0 1rem;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }

  .brand-section,
  .form-section {
    flex: none;
    width: 100%;
  }

  .brand-section {
    height: 30vh;
  }

  .form-section {
    height: 70vh;
  }

  .form-container {
    width: 90%;
    max-width: 400px;
  }

  .system-name {
    font-size: 2rem;
  }
}

/* 加深输入框边框和图标颜色 */
:deep(.el-input__wrapper) {
  border-color: #c0c4cc;
}

:deep(.el-input__wrapper:hover) {
  border-color: #909399;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
}

:deep(.el-input__prefix) {
  color: #606266;
}

:deep(.el-icon) {
  font-size: 18px;
}

/* 通用按钮样式 */
:deep(.el-button) {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: white;
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button--text) {
  background-color: transparent;
  color: #409eff;
  border-color: transparent;
}

:deep(.el-button--text:hover) {
  background-color: transparent;
  color: #66b1ff;
}

.form-container .el-button--primary {
  height: 31px;
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  transition: all 0.3s;
}

.form-container .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: white;
}

.verification-button {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
  transition: all 0.3s;
}

.verification-button:hover:not(:disabled) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.verification-button:disabled {
  background-color: #a0cfff;
  border-color: #a0cfff;
  color: white;
}
</style>
