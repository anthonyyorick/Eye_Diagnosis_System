<template>
  <app-layout active-menu="/profile">
    <div class="profile-container">
      <h1 class="page-title">个人中心</h1>

      <el-tabs
        v-model="activeTab"
        type="card"
        tab-position="left"
        class="profile-tabs"
      >
        <el-tab-pane label="个人信息" name="info">
          <div class="info-section">
            <div class="avatar-section">
              <el-avatar :size="120" :src="userInfo.avatar"></el-avatar>
              <input
                type="file"
                ref="avatarUpload"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
              <el-button
                type="primary"
                size="normal"
                class="change-avatar-btn"
                @click="triggerAvatarUpload"
                :loading="avatarLoading"
                >更换头像</el-button
              >

              <div class="user-info-summary">
                <div class="info-item">
                  <el-icon><User /></el-icon>
                  <span>{{ userInfo.realName }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Medal /></el-icon>
                  <span>{{ userInfo.title }}</span>
                </div>
                <div class="info-item">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>{{ userInfo.department }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Phone /></el-icon>
                  <span>{{ userInfo.phone }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Message /></el-icon>
                  <span>{{ userInfo.email }}</span>
                </div>
              </div>
            </div>

            <el-form
              :model="userInfo"
              :rules="rules"
              ref="userForm"
              label-width="100px"
              class="user-form"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userInfo.username" disabled></el-input>
              </el-form-item>
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="userInfo.realName"></el-input>
              </el-form-item>
              <el-form-item label="职称" prop="title">
                <el-select v-model="userInfo.title" placeholder="请选择职称">
                  <el-option label="主任医师" value="主任医师"></el-option>
                  <el-option label="副主任医师" value="副主任医师"></el-option>
                  <el-option label="主治医师" value="主治医师"></el-option>
                  <!-- <el-option label="住院医师" value="住院医师"></el-option> -->
                </el-select>
              </el-form-item>
              <el-form-item label="科室" prop="department">
                <el-input v-model="userInfo.department"></el-input>
              </el-form-item>
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="userInfo.phone"></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userInfo.email"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveUserInfo"
                  >保存信息</el-button
                >
                <el-button @click="resetForm('userForm')">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <div class="password-section">
            <el-form
              :model="passwordForm"
              :rules="passwordRules"
              ref="passwordForm"
              label-width="100px"
              class="password-form"
            >
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="changePassword"
                  :loading="passwordLoading"
                  >修改密码</el-button
                >
                <el-button @click="resetForm('passwordForm')">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="系统设置" name="settings">
          <div class="settings-section">
            <h3 class="settings-title">通知设置</h3>
            <el-form
              :model="settingsForm"
              label-width="200px"
              class="settings-form"
            >
              <el-form-item label="接收系统更新通知">
                <el-switch
                  v-model="settingsForm.systemNotification"
                ></el-switch>
              </el-form-item>
              <el-form-item label="接收诊断完成通知">
                <el-switch
                  v-model="settingsForm.diagnosisNotification"
                ></el-switch>
              </el-form-item>
              <el-form-item label="接收异常病例提醒">
                <el-switch
                  v-model="settingsForm.anomalyNotification"
                ></el-switch>
              </el-form-item>

              <h3 class="settings-title">界面设置</h3>
              <el-form-item label="语言">
                <el-select
                  v-model="settingsForm.language"
                  placeholder="请选择语言"
                >
                  <el-option label="简体中文" value="zh-CN"></el-option>
                  <!-- <el-option label="English" value="en-US"></el-option> -->
                </el-select>
              </el-form-item>
              <!-- <el-form-item label="主题色">
                 <el-color-picker
                  v-model="settingsForm.themeColor"
                ></el-color-picker> 
                <el-button
                  type="primary"
                  style="border-color: #dcdfe6; background-color: #fff"
                ></el-button>
              </el-form-item> -->
              <el-form-item label="表格默认每页显示行数">
                <el-select
                  v-model="settingsForm.tablePageSize"
                  placeholder="请选择"
                >
                  <el-option label="10行" :value="10"></el-option>
                  <el-option label="20行" :value="20"></el-option>
                  <!-- <el-option label="50行" :value="50"></el-option>
                  <el-option label="100行" :value="100"></el-option> -->
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveSettings"
                  >保存设置</el-button
                >
                <el-button @click="resetSettings">恢复默认</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="帮助与反馈" name="help">
          <div class="help-section">
            <h3 class="help-title">常见问题</h3>
            <el-collapse>
              <el-collapse-item title="如何上传眼底图像？" name="1">
                <div>
                  在"即时诊断中心"页面，您可以选择单图诊断或批量诊断模式。
                  对于单图诊断，分别上传左右眼图像；对于批量诊断，系统会自动配对左右眼图像。
                </div>
              </el-collapse-item>
              <el-collapse-item title="如何导出诊断报告？" name="2">
                <div>
                  在诊断完成后，点击"导出报告"按钮，系统将生成PDF格式的报告供您下载。
                  您也可以在"病例报告"页面找到历史报告并导出。
                </div>
              </el-collapse-item>
              <el-collapse-item title="系统支持哪些眼疾的识别？" name="3">
                <div>
                  目前系统支持以下眼疾的识别：糖尿病视网膜病变、青光眼、白内障、AMD（年龄相关性黄斑变性）、
                  高血压视网膜病变、近视、其他异常，以及正常眼底的判断。
                </div>
              </el-collapse-item>
            </el-collapse>

            <h3 class="feedback-title">问题反馈</h3>
            <el-form
              :model="feedbackForm"
              :rules="feedbackRules"
              ref="feedbackForm"
              class="feedback-form"
            >
              <el-form-item label="反馈类型" prop="type">
                <el-select
                  v-model="feedbackForm.type"
                  placeholder="请选择反馈类型"
                >
                  <el-option label="功能建议" value="suggestion"></el-option>
                  <el-option label="系统错误" value="error"></el-option>
                  <el-option label="诊断问题" value="diagnosis"></el-option>
                  <el-option label="其他" value="other"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="反馈内容" prop="content">
                <el-input
                  type="textarea"
                  v-model="feedbackForm.content"
                  :rows="5"
                  placeholder="请详细描述您遇到的问题或建议..."
                ></el-input>
              </el-form-item>
              <el-form-item label="联系方式" prop="contact">
                <el-input
                  v-model="feedbackForm.contact"
                  placeholder="选填，便于我们联系您解决问题"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitFeedback"
                  >提交反馈</el-button
                >
                <el-button @click="resetForm('feedbackForm')">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- <div class="contact-info">
              <h3>联系我们</h3>
              <p>技术支持邮箱：support@eyediagnosis.com</p>
              <p>客服电话：400-123-4567（工作日 9:00-18:00）</p>
            </div> -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/components/AppLayout.vue";
import request from "@/utils/axios"; // 导入配置好的axios实例
import eventBus from "@/utils/eventBus"; // 导入事件总线
import {
  User,
  Medal,
  OfficeBuilding,
  Phone,
  Message,
} from "@element-plus/icons-vue";

export default {
  name: "ProfileView",
  components: {
    AppLayout,
    User,
    Medal,
    OfficeBuilding,
    Phone,
    Message,
  },
  data() {
    // 确认密码的验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };

    return {
      activeTab: "info",
      userInfo: {
        doctorId: 0,
        username: "",
        realName: "",
        title: "",
        department: "",
        phone: "",
        email: "",
        avatar:
          "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
      },
      rules: {
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
        phone: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
        ],
      },
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      passwordRules: {
        currentPassword: [
          { required: true, message: "请输入当前密码", trigger: "blur" },
        ],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, message: "密码长度不能小于6个字符", trigger: "blur" },
        ],
        confirmPassword: [
          { required: true, message: "请再次输入新密码", trigger: "blur" },
          { validator: validateConfirmPassword, trigger: "blur" },
        ],
      },
      settingsForm: {
        systemNotification: true,
        diagnosisNotification: true,
        anomalyNotification: true,
        language: "zh-CN",
        themeColor: "#fff",
        tablePageSize: 20,
      },
      feedbackForm: {
        type: "",
        content: "",
        contact: "",
      },
      feedbackRules: {
        type: [
          { required: true, message: "请选择反馈类型", trigger: "change" },
        ],
        content: [
          { required: true, message: "请输入反馈内容", trigger: "blur" },
          { min: 10, message: "反馈内容不能少于10个字符", trigger: "blur" },
        ],
      },
      passwordLoading: false,
      avatarLoading: false,
    };
  },
  methods: {
    // 触发文件选择器
    triggerAvatarUpload() {
      this.$refs.avatarUpload.click();
    },

    // 处理头像变更
    handleAvatarChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      // 检查文件类型
      if (!file.type.includes("image")) {
        this.$message.error("请上传图片文件");
        return;
      }

      // 检查文件大小 (限制为2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.$message.error("图片大小不能超过2MB");
        return;
      }

      this.uploadAvatar(file);
    },
    // 上传头像到服务器
    uploadAvatar(file) {
      this.avatarLoading = true;

      // 创建FormData对象
      const formData = new FormData();
      formData.append("file", file);

      // 上传文件
      request({
        url: "/common/upload",
        method: "post",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then((response) => {
          if (response.code === 200 || response.code === 1) {
            // 获取文件路径
            const filepath = response.data;
            // 在上传头像成功后，先提前显示
            this.userInfo.avatar = filepath;

            // 更新医生头像
            this.updateDoctorAvatar(filepath);
          } else {
            this.$message.error(response.msg || "文件上传失败");
            this.avatarLoading = false;
          }
        })
        .catch((error) => {
          console.error("文件上传失败:", error);
          this.$message.error("文件上传失败，请稍后重试");
          this.avatarLoading = false;
        });
    },

    // 更新医生头像
    updateDoctorAvatar(filepath) {
      // 获取当前医生ID
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const doctorId = userInfo.doctorId || userInfo.id;

      // 先立即更新UI显示上传的图片
      this.userInfo.avatar = filepath;

      // 更新本地存储，使其他组件能够立即看到
      const storedUserInfo = JSON.parse(
        localStorage.getItem("userInfo") || "{}"
      );
      storedUserInfo.avatar = filepath;
      storedUserInfo.image = filepath;
      localStorage.setItem("userInfo", JSON.stringify(storedUserInfo));

      // 立即通知其他组件更新头像
      console.log("立即发送用户信息更新事件，头像URL:", filepath);
      eventBus.emit("userInfoUpdated", storedUserInfo);

      // 构造请求数据
      const data = {
        id: doctorId,
        filepath: filepath,
      };

      // 发送更新请求
      request({
        url: "/doctor/update/image",
        method: "put",
        data: data,
      })
        .then((response) => {
          if (response.code === 200 || response.code === 1) {
            // 更新成功后，获取最新的医生头像
            setTimeout(() => {
              this.getDoctorImage(doctorId);
            }, 300); // 延迟300ms再获取，确保后端处理完成

            this.$message.success("头像更新成功");
          } else {
            this.$message.error(response.msg || "头像更新失败");
            this.avatarLoading = false;
          }
        })
        .catch((error) => {
          console.error("头像更新失败:", error);
          this.$message.error("头像更新失败，请稍后重试");
          this.avatarLoading = false;
        });
    },

    // 获取医生头像
    getDoctorImage(doctorId) {
      request({
        url: `/doctor/image/${doctorId}`,
        method: "get",
      })
        .then((response) => {
          console.log("头像接口完整响应:", response);

          // 无论成功与否，确保加载状态被重置
          this.avatarLoading = false;

          if (response.code === 200 || response.code === 1) {
            // 尝试多种可能的数据结构获取图片路径
            let imageUrl = null;

            // 方式1：直接从data中获取image字段
            if (response.data && response.data.image) {
              imageUrl = response.data.image;
            }
            // 方式2：直接从data获取（如果data本身就是字符串URL）
            else if (typeof response.data === "string") {
              imageUrl = response.data;
            }
            // 方式3：如果data是一个对象但没有image字段，可能image是直接在data对象上
            else if (response.data && typeof response.data === "object") {
              // 遍历data对象的所有属性寻找可能的图片路径
              for (const key in response.data) {
                if (
                  typeof response.data[key] === "string" &&
                  (response.data[key].includes("/") ||
                    response.data[key].includes("\\") ||
                    response.data[key].includes(".jpg") ||
                    response.data[key].includes(".png") ||
                    response.data[key].includes(".jpeg") ||
                    response.data[key].includes(".gif"))
                ) {
                  imageUrl = response.data[key];
                  break;
                }
              }
            }
            // 方式4：直接尝试获取image字段
            else if (response.image) {
              imageUrl = response.image;
            }

            console.log("解析后的图片路径:", imageUrl);

            if (imageUrl) {
              // 更新本地头像
              this.userInfo.avatar = imageUrl;

              // 更新本地存储
              const storedUserInfo = JSON.parse(
                localStorage.getItem("userInfo") || "{}"
              );
              storedUserInfo.avatar = imageUrl;
              storedUserInfo.image = imageUrl; // 确保两个字段都更新
              localStorage.setItem("userInfo", JSON.stringify(storedUserInfo));

              // 通知其他组件用户信息已更新
              console.log("发送用户信息更新事件，头像URL:", imageUrl);
              eventBus.emit("userInfoUpdated", storedUserInfo);

              // 强制更新组件
              this.$forceUpdate();

              // 延迟500ms再次确认头像更新
              setTimeout(() => {
                this.userInfo.avatar = imageUrl;
                this.$forceUpdate();
              }, 500);
            } else {
              console.error("未能从响应中获取有效的图片路径:", response);
              this.$message.warning("未能获取到有效的头像图片");
            }
          } else {
            this.$message.error(response.msg || "获取头像失败");
          }
        })
        .catch((error) => {
          console.error("获取头像失败:", error);
          this.$message.error("获取头像失败，请稍后重试");
          this.avatarLoading = false;
        });
    },
    saveUserInfo() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          // 构造要提交的数据
          const userData = {
            doctorId: this.userInfo.doctorId,
            name: this.userInfo.realName,
            username: this.userInfo.username,
            phoneNumber: this.userInfo.phone,
            department: this.userInfo.department,
            doctorTitle: this.userInfo.title,
            email: this.userInfo.email,
          };

          // 发送更新请求
          request({
            url: "/doctor/update",
            method: "put",
            data: userData,
          })
            .then((response) => {
              if (response.code === 200 || response.code === 1) {
                this.$message.success("个人信息更新成功");
                // 更新本地存储的用户信息
                const userInfo = JSON.parse(
                  localStorage.getItem("userInfo") || "{}"
                );
                localStorage.setItem(
                  "userInfo",
                  JSON.stringify({
                    ...userInfo,
                    ...userData,
                  })
                );
                // 通知其他组件用户信息已更新
                eventBus.emit("userInfoUpdated", {
                  ...userInfo,
                  ...userData,
                });
              } else {
                this.$message.error(response.msg || "更新失败");
              }
            })
            .catch((error) => {
              console.error("更新个人信息失败:", error);
              this.$message.error("更新失败，请稍后重试");
            });
        } else {
          return false;
        }
      });
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    changePassword() {
      this.$refs.passwordForm.validate((valid) => {
        if (valid) {
          // 获取当前医生ID
          const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
          const doctorId = userInfo.doctorId || userInfo.id;

          // 构造请求数据
          const passwordData = {
            doctorId: doctorId,
            oldPassword: this.passwordForm.currentPassword,
            newPassword: this.passwordForm.newPassword,
          };

          // 设置加载状态
          this.passwordLoading = true;

          // 发送更新请求
          request({
            url: "/doctor/update/password",
            method: "put",
            data: passwordData,
          })
            .then((response) => {
              if (response.code === 200 || response.code === 1) {
                this.$message.success("密码修改成功，请重新登录");
                setTimeout(() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("isLoggedIn");
                  this.$router.push("/login");
                }, 1500);
              } else {
                this.$message.error(response.msg || "密码修改失败");
              }
            })
            .catch((error) => {
              console.error("修改密码失败:", error);
              this.$message.error("修改密码失败，请稍后重试");
            })
            .finally(() => {
              this.passwordLoading = false;
            });
        } else {
          return false;
        }
      });
    },

    saveSettings() {
      this.$message.success("系统设置保存成功");
      // 实际应用中这里应该将设置保存到本地存储或后端
    },

    resetSettings() {
      this.settingsForm = {
        systemNotification: true,
        diagnosisNotification: true,
        anomalyNotification: true,
        language: "zh-CN",
        themeColor: "#409EFF",
        tablePageSize: 20,
      };
      this.$message.info("已恢复默认设置");
    },

    submitFeedback() {
      this.$refs.feedbackForm.validate((valid) => {
        if (valid) {
          this.$message.success("感谢您的反馈，我们会尽快处理");
          this.resetForm("feedbackForm");
        } else {
          return false;
        }
      });
    },
    fetchDoctorInfo() {
      const token = localStorage.getItem("token");
      if (!token) return;

      // 获取当前登录的医生ID
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const doctorId = userInfo.id || localStorage.getItem("doctorId");

      if (doctorId) {
        // 根据ID查询医生信息
        request({
          url: `/doctor/${doctorId}`,
          method: "get",
        })
          .then((response) => {
            if (response.code === 200 || response.code === 1) {
              const data = response.data;
              // Update userInfo with data from backend
              if (data) {
                this.userInfo = {
                  doctorId: data.doctorId || data.id,
                  username: data.username || this.userInfo.username,
                  realName: data.name || this.userInfo.realName,
                  title: data.doctorTitle || this.userInfo.title,
                  department: data.department || this.userInfo.department,
                  phone: data.phoneNumber || this.userInfo.phone,
                  email: data.email || this.userInfo.email,
                  avatar: data.image || data.avatar || this.userInfo.avatar, // 优先使用后端返回的头像
                };

                // 更新本地存储
                localStorage.setItem(
                  "userInfo",
                  JSON.stringify({
                    ...data,
                    avatar: data.image || data.avatar || this.userInfo.avatar, // 确保头像字段被正确保存
                  })
                );

                // 通知其他组件用户信息已更新
                eventBus.emit("userInfoUpdated", {
                  ...data,
                  avatar: data.image || data.avatar || this.userInfo.avatar,
                });

                // 获取最新的头像
                this.getDoctorImage(doctorId);
              }
            } else {
              this.$message.error(response.msg || "获取用户信息失败");
            }
          })
          .catch((error) => {
            console.error("获取用户信息失败:", error);
            this.$message.error("获取用户信息失败，请刷新重试");
          });
      } else {
        // 如果没有ID，则使用通用接口获取当前登录医生信息
        request({
          url: "/doctor/info",
          method: "get",
        })
          .then((response) => {
            if (response.code === 200 || response.code === 1) {
              const data = response.data;
              // Update userInfo with data from backend
              if (data) {
                this.userInfo = {
                  doctorId: data.doctorId || 0,
                  username: data.username || this.userInfo.username,
                  realName: data.name || this.userInfo.realName,
                  title: data.doctorTitle || this.userInfo.title,
                  department: data.department || this.userInfo.department,
                  phone: data.phoneNumber || this.userInfo.phone,
                  email: data.email || this.userInfo.email,
                  avatar: data.image || data.avatar || this.userInfo.avatar, // 优先使用后端返回的头像
                };

                // 更新本地存储
                localStorage.setItem(
                  "userInfo",
                  JSON.stringify({
                    ...data,
                    avatar: data.image || data.avatar || this.userInfo.avatar, // 确保头像字段被正确保存
                  })
                );

                // 通知其他组件用户信息已更新
                eventBus.emit("userInfoUpdated", {
                  ...data,
                  avatar: data.image || data.avatar || this.userInfo.avatar,
                });

                // 获取最新的头像
                if (data.doctorId || data.id) {
                  this.getDoctorImage(data.doctorId || data.id);
                }
              }
            } else {
              this.$message.error(response.msg || "获取用户信息失败");
            }
          })
          .catch((error) => {
            console.error("获取用户信息失败:", error);
            this.$message.error("获取用户信息失败，请刷新重试");
          });
      }
    },
  },
  mounted() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem("token");
    if (!isLoggedIn) {
      this.$router.push("/login");
      return;
    }

    // 从localStorage加载用户信息
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      try {
        const parsedInfo = JSON.parse(storedUserInfo);
        this.userInfo = {
          doctorId: parsedInfo.doctorId || 0,
          username: parsedInfo.username || "",
          realName: parsedInfo.name || "",
          title: parsedInfo.doctorTitle || "",
          department: parsedInfo.department || "",
          phone: parsedInfo.phoneNumber || "",
          email: parsedInfo.email || "",
          avatar:
            parsedInfo.avatar ||
            "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
        };

        // 如果有医生ID，直接获取最新头像
        const doctorId = parsedInfo.doctorId || parsedInfo.id;
        if (doctorId) {
          this.getDoctorImage(doctorId);
        }
      } catch (e) {
        console.error("Failed to parse user info:", e);
      }
    }

    // 获取最新的医生信息
    this.fetchDoctorInfo();
  },
};
</script>

<style lang="scss" scoped>
// --- 颜色变量 ---
$primary-color: #409eff; // Element Plus 主色（蓝色）
$text-color-primary: #303133;
$text-color-secondary: #606266;
$border-color-light: #ebeef5;
$background-color: #f5f7fa; // 页面背景
$card-bg-color: #ffffff; // 卡片/内容区域背景

.profile-container {
  padding: 30px;
  background-color: $background-color;
  min-height: calc(100vh - 50px); // 确保有最小高度
}

.page-title {
  font-size: 28px;
  color: $text-color-primary;
  margin-bottom: 25px;
  border-left: 5px solid $primary-color;
  padding-left: 15px;
  font-weight: 700;
  margin-top: 0;
}

// --- Tabs 整体样式优化 ---
.profile-tabs {
  background-color: $card-bg-color;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;

  // 侧边 Tab 样式美化
  :deep(.el-tabs__header) {
    margin-right: 20px;
    border-right: none;

    .el-tabs__nav {
      border: none;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .el-tabs__item {
        height: 50px;
        line-height: 50px;
        text-align: left;
        padding: 0 20px !important;
        border: none;
        border-radius: 8px;
        transition: all 0.3s ease;
        font-weight: 500;
        color: $text-color-secondary;

        &.is-active {
          background-color: $primary-color;
          color: $card-bg-color;
          box-shadow: 0 2px 8px rgba($primary-color, 0.3);
          font-weight: 600;
        }

        &:hover:not(.is-active) {
          color: $primary-color;
          background-color: lighten($primary-color, 45%);
        }
      }
    }
  }

  // 内容区域
  :deep(.el-tabs__content) {
    flex-grow: 1;
    padding-left: 20px;
    border-left: 1px solid $border-color-light;

    .el-tab-pane {
      padding: 0 10px;
    }
  }
}

// --- 1. 个人信息 (info) 布局重构 ---
.info-section {
  display: flex;
  gap: 40px;
  padding: 20px 0;

  @media (max-width: 992px) {
    flex-direction: column;
  }
}

.avatar-section {
  flex: 0 0 250px; // 固定宽度
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-right: 1px solid $border-color-light; // 分隔线
  position: relative;

  @media (max-width: 992px) {
    flex: none;
    border-right: none;
    border-bottom: 1px solid $border-color-light;
    margin-bottom: 20px;
  }

  :deep(.el-avatar) {
    box-shadow: 0 0 0 4px #fff, 0 0 0 6px $primary-color; // 边框效果
    margin-bottom: 20px;
  }

  .change-avatar-btn {
    margin-bottom: 30px;
  }

  .user-info-summary {
    width: 100%;
    padding: 10px 0;

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      font-size: 14px;
      color: $text-color-secondary;

      .el-icon {
        margin-right: 10px;
        font-size: 18px;
        color: $primary-color; // 图标使用主色
      }
      span {
        color: $text-color-primary;
        font-weight: 500;
      }
    }
  }
}

.user-form {
  flex-grow: 1;
  max-width: 500px; // 限制表单宽度
}

// --- 2. 修改密码 (password) 样式 ---
.password-section {
  padding: 20px 0;
  .password-form {
    max-width: 450px;
  }
}

// --- 3. 系统设置 (settings) 样式 ---
.settings-section {
  padding: 20px 0;
  .settings-title {
    font-size: 20px;
    color: $primary-color;
    margin-top: 20px;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 2px solid lighten($primary-color, 30%);
    font-weight: 600;

    &:first-child {
      margin-top: 0;
    }
  }
  .settings-form {
    max-width: 600px;
  }
}

// --- 4. 帮助与反馈 (help) 样式 ---
.help-section {
  padding: 20px 0;
}

.help-title,
.feedback-title {
  font-size: 20px;
  color: $text-color-primary;
  margin-top: 25px;
  margin-bottom: 15px;
  font-weight: 600;

  &:first-child {
    margin-top: 0;
  }
}

// 折叠面板美化
:deep(.el-collapse) {
  border-top: none;
  border-bottom: none;

  .el-collapse-item__header {
    background-color: lighten($primary-color, 45%);
    color: $text-color-primary;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 6px;
    margin-bottom: 5px;
    border: none;
  }
  .el-collapse-item__content {
    padding: 15px 20px 10px;
    line-height: 1.8;
    color: $text-color-secondary;
  }
}

.feedback-form {
  margin-top: 20px;
  max-width: 600px;
}

.contact-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed $border-color-light;

  h3 {
    color: $primary-color;
    font-size: 18px;
    margin-bottom: 10px;
  }
  p {
    font-size: 14px;
    color: $text-color-secondary;
    line-height: 1.8;
  }
}

// --- 通用 Element Plus 组件美化 ---
:deep(.el-input) {
  .el-input__inner {
    border-radius: 6px;
  }
}

:deep(.el-button--primary) {
  border-radius: 6px;
  font-weight: 500;
}
</style>
