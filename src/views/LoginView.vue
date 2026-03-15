<template>
  <div class="login-container">
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
        <h2 class="form-title">欢迎使用慧眼识疾</h2>

        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="rules"
          label-width="0px"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入手机号">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              :type="passwordVisible ? 'text' : 'password'"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
              <el-button type="text" class="forgot-password"
                >忘记密码？</el-button
              >
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              @click="handleLogin"
              :loading="loading"
            >
              {{ loading ? "登录中..." : "登录" }}
            </el-button>
          </el-form-item>

          <el-form-item>
            <div class="register-tip">
              还没有账号？
              <el-button type="text" class="register-link" @click="goToRegister"
                >立即注册</el-button
              >
            </div>
          </el-form-item>
        </el-form>

        <div class="bottom-links">
          <div class="policy-links">
            <a href="#">隐私政策</a>
            <span class="divider">|</span>
            <a href="#">用户协议</a>
          </div>
          <div class="help-center">
            <a href="#"><i class="el-icon-question"></i> 帮助中心</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐私协议确认弹窗 -->
    <el-dialog
      title="隐私协议确认"
      v-model="privacyDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
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
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectPrivacyPolicy">不同意</el-button>
          <el-button type="primary" @click="acceptPrivacyPolicy"
            >同意</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { User, Lock } from "@element-plus/icons-vue";
import request from "@/utils/axios"; // 使用配置好的 axios 实例

export default {
  name: "LoginView",
  components: {
    User,
    Lock,
  },
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
        verificationCode: "",
        rememberMe: false,
      },
      rules: {
        username: [
          { required: true, message: "请输入手机号", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
        ],
      },
      passwordVisible: false,
      privacyDialogVisible: false,
      isFirstLogin: true,
      loading: false, // 添加loading状态
    };
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          try {
            this.loading = true;

            // 检查是否是默认用户
            if (
              this.loginForm.username === "18880880808" &&
              this.loginForm.password === "123456"
            ) {
              const defaultUserData = {
                id: 1,
                username: "doctor123",
                name: "默认医生",
                role: "doctor",
                token: "default-token",
              };

              if (this.isFirstLogin) {
                this.privacyDialogVisible = true;
              } else {
                this.loginSuccess(defaultUserData);
              }
              return;
            }

            // 非默认用户，使用后端接口登录
            try {
              const response = await request.post("/doctor/login", {
                phoneNumber: this.loginForm.username,
                password: this.loginForm.password,
              });

              if (response.code === 200 || response.code === 1) {
                // 解析JWT获取用户信息
                const token = response.data.token;
                const userData = this.parseJwt(token);

                const userInfo = {
                  id: userData.id || response.data.doctorId,
                  username: this.loginForm.username,
                  name: response.data.name || "",
                  phoneNumber:
                    response.data.phoneNumber || this.loginForm.username,
                  email: response.data.email || "",
                  department: response.data.department || "",
                  doctorTitle: response.data.doctorTitle || "",
                  role: "doctor",
                  token: token,
                  avatar:
                    response.data.image ||
                    "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
                };

                if (this.isFirstLogin) {
                  this.privacyDialogVisible = true;
                } else {
                  this.loginSuccess(userInfo);
                }
              } else {
                this.$message.error(response.msg || "登录失败");
              }
            } catch (error) {
              // 具体的错误处理
              if (error.response) {
                // 服务器返回了错误状态码
                const message =
                  error.response.data?.message ||
                  "登录失败，请检查用户名和密码";
                this.$message.error(message);
              } else if (error.request) {
                // 请求发出但没有收到响应
                this.$message.error("服务器无响应，请检查网络连接");
              } else {
                // 请求配置出错
                this.$message.error("请求错误，请稍后重试");
              }
            }
          } finally {
            this.loading = false;
          }
        }
      });
    },

    loginSuccess(userData) {
      // 存储用户信息和token
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", userData.username);
      localStorage.setItem("doctorId", userData.id);

      // 保存更多用户信息以供个人中心使用
      const userProfile = {
        id: userData.id,
        username: userData.username,
        name: userData.name || "",
        department: userData.department || "",
        doctorTitle: userData.doctorTitle || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        avatar:
          userData.avatar ||
          "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
      };

      localStorage.setItem("userInfo", JSON.stringify(userProfile));

      // 存储token
      if (userData.token) {
        localStorage.setItem("token", userData.token);
        // 设置请求头的Authorization
        request.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${userData.token}`;
      }

      // 如果选择了记住我，保存用户名
      if (this.loginForm.rememberMe) {
        localStorage.setItem("rememberedUser", this.loginForm.username);
      }

      this.$message.success("登录成功");
      this.$router.push("/dashboard");
    },

    // 解析JWT token
    parseJwt(token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error("解析JWT失败:", error);
        return {};
      }
    },

    goToRegister() {
      this.$router.push("/register");
    },

    sendVerificationCode() {
      // 模拟发送验证码
      this.$message.success("验证码已发送到您的手机");
    },

    acceptPrivacyPolicy() {
      this.privacyDialogVisible = false;
      this.isFirstLogin = false;
      localStorage.setItem("privacyAccepted", "true");
      // 重新调用登录成功处理
      this.handleLogin();
    },

    rejectPrivacyPolicy() {
      this.privacyDialogVisible = false;
      this.$message.warning("您需要同意隐私政策才能使用本系统");
    },
  },
  mounted() {
    // 检查是否有记住的用户
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      this.loginForm.username = rememberedUser;
      this.loginForm.rememberMe = true;
    }

    // 检查是否已接受隐私政策
    if (localStorage.getItem("privacyAccepted") === "true") {
      this.isFirstLogin = false;
    }
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
  /* background-image: url("https://static.vecteezy.com/system/resources/previews/042/971/984/non_2x/blue-doctor-wireframe-ai-medical-line-medical-treatment-illustration-use-ai-to-help-treat-concept-and-modern-on-health-background-health-insurance-vector.jpg"); */
  background-image: url("@/assets/images/wmremove-transformed.png");
  background-size: cover;
}

.brand-section {
  flex: 0 0 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 0rem;
}

.brand-content {
  /* text-align: center; */
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
}

.form-container {
  width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-right: 0rem;
}

.form-title {
  font-size: 20px;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.register-button {
  width: 100%;
  text-align: center;
}

.bottom-links {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  font-size: 14px;
  color: #606266;
}

.policy-links a {
  color: #606266;
  text-decoration: none;
}

.policy-links a:hover {
  color: #409eff;
}

.divider {
  margin: 0 8px;
}

.help-center a {
  color: #606266;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.help-center a:hover {
  color: #409eff;
}

.privacy-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 0 1rem;
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

/* 响应式适配 */
@media (max-width: 768px) {
  .login-container {
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

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  padding: 0;
  height: auto;
  font-size: 14px;
}

.register-tip {
  text-align: center;
  align-items: center;
  justify-content: center;
  color: #606266;
  font-size: 14px;
  margin-left: 8rem;
}

.register-link {
  padding: 0 0 0 4px;
  height: auto;
  font-size: 14px;
  font-weight: 500;
}

.register-link:hover {
  color: #409eff;
}

/* 按钮样式 */
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
</style>
