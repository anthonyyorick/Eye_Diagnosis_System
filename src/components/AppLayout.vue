<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <el-header class="app-header">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo" class="logo-image" />
        <span class="logo-text">慧眼识疾智能诊断系统</span>
      </div>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        class="main-menu"
        background-color="#fff"
        text-color="#717171"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon class="menu-icon"><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/diagnosis">
          <el-icon class="menu-icon"><FirstAidKit /></el-icon>
          <span>诊断中心</span>
        </el-menu-item>
        <el-menu-item index="/reports">
          <el-icon class="menu-icon"><Document /></el-icon>
          <span>病例报告</span>
        </el-menu-item>
        <el-menu-item index="/analytics">
          <el-icon class="menu-icon"><TrendCharts /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
      </el-menu>

      <div class="header-right">
        <notification-system />

        <!-- 现有的用户头像和下拉菜单 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            <el-avatar :size="40" :src="userAvatar"></el-avatar>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item divided command="logout"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主体内容 -->
    <el-main class="app-main">
      <slot></slot>
    </el-main>

    <!-- 底部 -->
    <el-footer class="app-footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">使用帮助</a>
          <a href="#">隐私政策</a>
          <a href="#">联系我们</a>
        </div>
        <div class="footer-copyright">
          © 2025 眼底图像眼疾智能识别系统 - 版权所有
        </div>
      </div>
    </el-footer>

    <!-- 通知抽屉 -->
    <!-- <el-drawer
      v-model="showNotification"
      title="系统通知"
      direction="rtl"
      size="350px"
      :with-header="true"
    >
      <div class="notification-content">
        <div
          class="notification-item"
          v-for="(notice, index) in systemNotices"
          :key="index"
        >
          <div class="notification-title">{{ notice.title }}</div>
          <div class="notification-text">{{ notice.content }}</div>
          <div class="notification-time">{{ notice.time }}</div>
        </div>
        <div v-if="systemNotices.length === 0" class="empty-notification">
          暂无通知
        </div>
      </div>
    </el-drawer> -->
  </div>
</template>

<script>
import {
  //Bell,
  HomeFilled,
  Document,
  TrendCharts,
  FirstAidKit,
} from "@element-plus/icons-vue";
import request from "@/utils/axios"; // 导入配置好的axios实例
import eventBus from "@/utils/eventBus"; // 导入事件总线
import NotificationSystem from "./notification/NotificationSystem.vue";

export default {
  name: "AppLayout",
  components: {
    //Bell,
    HomeFilled,
    FirstAidKit,
    Document,
    TrendCharts,
    NotificationSystem,
  },
  props: {
    activeMenu: {
      type: String,
      default: "/dashboard",
    },
  },
  data() {
    return {
      userAvatar:
        "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png", // 默认头像
      doctorId: null, // 添加医生ID字段
      showNotification: false,
      unreadNotifications: 2,
      dateStr: "",
      timeStr: "",
      weekDays: [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
      ],
      timerID: null,
      systemNotices: [
        {
          type: "system",
          title: "系统更新通知",
          content:
            "系统将于2025年3月20日凌晨2:00-4:00进行版本更新，请提前做好准备。",
          time: "2025-03-15 10:30",
        },
        {
          type: "system",
          title: "新功能上线",
          content:
            "批量诊断功能已上线，支持同时处理多达50组眼底图像，欢迎使用！",
          time: "2025-03-12 14:15",
        },
        {
          type: "diagnosis",
          title: "诊断结果已生成",
          content: "患者小明（ID: 31）的眼底图像诊断已完成，请及时查看。",
          time: "2025-03-14 09:45",
        },
        {
          type: "diagnosis",
          title: "批量诊断完成",
          content:
            "您提交的批量诊断任务（15组图像）已完成，全部结果可在报告中心查看。",
          time: "2025-03-13 16:20",
        },
        {
          type: "abnormal",
          title: "异常病例提醒",
          content:
            "患者李华（ID: 28）的诊断结果显示高度疑似严重视网膜病变，请优先处理。",
          time: "2025-03-14 11:05",
        },
        {
          type: "abnormal",
          title: "异常诊断率提醒",
          content:
            "过去24小时内诊断的病例中，糖尿病视网膜病变检出率较往常高出30%，请关注。",
          time: "2025-03-13 08:30",
        },
        {
          type: "system",
          title: "数据库维护通知",
          content:
            "系统将于本周日凌晨进行数据库维护，届时部分历史报告查询功能将暂时不可用。",
          time: "2025-03-11 17:00",
        },
      ],
      activeNotificationTab: "all",
      searchText: "",
    };
  },
  computed: {
    filteredNotifications() {
      if (this.activeNotificationTab === "all") {
        return this.systemNotices;
      } else {
        return this.systemNotices.filter(
          (notice) => notice.type === this.activeNotificationTab
        );
      }
    },
  },
  methods: {
    updateDateTime() {
      const now = new Date();
      // 格式化日期：年月日 星期几
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");
      const weekDay = this.weekDays[now.getDay()];
      this.dateStr = `${year}年${month}月${day}日 ${weekDay}`;

      // 格式化时间：时:分:秒
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      this.timeStr = `${hours}:${minutes}:${seconds}`;
    },
    async handleCommand(command) {
      if (command === "profile") {
        this.$router.push("/profile");
      } else if (command === "settings") {
        this.$router.push("/profile?tab=settings");
      } else if (command === "logout") {
        try {
          // 调用退出登录接口
          await request.post("/doctor/logout");
          // 清除本地存储的登录信息
          localStorage.clear();
          // 显示退出成功消息
          this.$message.success("退出登录成功");
          // 跳转到登录页
          this.$router.push("/login");
        } catch (error) {
          console.error("退出登录失败:", error);
          // 即使接口调用失败，也清除本地登录信息并跳转
          localStorage.clear();
          this.$router.push("/login");
        }
      }
    },

    getNoticeTypeColor(type) {
      const typeColors = {
        system: "primary",
        diagnosis: "success",
        abnormal: "danger",
      };
      return typeColors[type] || "info";
    },

    getNoticeTagType(type) {
      const tagTypes = {
        system: "info",
        diagnosis: "success",
        abnormal: "danger",
      };
      return tagTypes[type] || "info";
    },

    getNoticeTypeName(type) {
      const typeNames = {
        system: "系统更新",
        diagnosis: "诊断通知",
        abnormal: "异常提醒",
      };
      return typeNames[type] || "通知";
    },
    toggleNotification() {
      this.showNotification = !this.showNotification;
      if (this.showNotification) {
        this.unreadNotifications = 0;
      }
    },
    async loadUserAvatar() {
      try {
        // 获取当前登录的医生ID
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const doctorId = userInfo.doctorId || userInfo.id;

        // 保存医生ID供后续使用
        this.doctorId = doctorId;

        if (doctorId) {
          // 直接从API获取最新头像
          await this.fetchDoctorAvatar(doctorId);
        } else {
          console.log("未找到医生ID，使用默认头像");
          this.userAvatar =
            "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png";
        }
      } catch (error) {
        console.error("加载头像失败:", error);
        this.userAvatar =
          "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png";
      }
    },

    // 新增方法：通过ID直接获取医生头像
    async fetchDoctorAvatar(doctorId) {
      try {
        // console.log(`通过ID(${doctorId})获取医生头像...`);
        const response = await request.get(`/doctor/image/${doctorId}`);
        // console.log("导航栏头像API响应:", response);

        if (response && (response.code === 200 || response.code === 1)) {
          // 尝试从响应中获取图片路径
          let imageUrl = null;

          // 方式1：直接从data中获取image字段
          if (response.data && response.data.image) {
            imageUrl = response.data.image;
          }
          // 方式2：直接从data获取（如果data本身就是字符串URL）
          else if (typeof response.data === "string") {
            imageUrl = response.data;
          }
          // 方式3：遍历data对象寻找可能的图片路径
          else if (response.data && typeof response.data === "object") {
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

          if (imageUrl) {
            // console.log("导航栏更新头像为:", imageUrl);
            this.userAvatar = imageUrl;

            // 强制更新组件
            this.$forceUpdate();
            return true;
          }
        }

        console.log("未能从API获取有效的头像，保持当前头像");
        return false;
      } catch (error) {
        console.error("获取医生头像出错:", error);
        return false;
      }
    },

    setupStorageListener() {
      // 监听localStorage变化
      window.addEventListener("storage", (event) => {
        if (event.key === "userInfo") {
          this.loadUserAvatar();
        }
      });
    },
    setupEventBus() {
      // 监听用户信息更新事件
      eventBus.on("userInfoUpdated", (userData) => {
        console.log("收到用户信息更新事件:", userData);

        // 如果有医生ID，优先通过API获取最新头像
        const doctorId = userData.doctorId || userData.id;
        if (doctorId) {
          this.fetchDoctorAvatar(doctorId);
        }
        // 如果没有成功获取或没有医生ID，则使用userData中的头像
        else if (userData && (userData.avatar || userData.image)) {
          const newAvatar = userData.avatar || userData.image;
          console.log("更新头像为:", newAvatar);
          this.userAvatar = newAvatar;
          this.$forceUpdate();

          // 防止更新后被覆盖，延迟500ms再次确认头像
          setTimeout(() => {
            this.userAvatar = newAvatar;
            this.$forceUpdate();
          }, 500);
        }
      });
    },
  },
  mounted() {
    // 初始化当前时间
    this.updateDateTime();
    // 启动时间更新
    this.timerID = setInterval(this.updateDateTime, 1000);
    // 加载用户头像
    this.loadUserAvatar();
    // 设置localStorage监听
    this.setupStorageListener();
    // 设置事件总线监听
    this.setupEventBus();

    // 定期刷新头像（每60秒）
    setInterval(() => {
      if (this.doctorId) {
        this.fetchDoctorAvatar(this.doctorId);
      }
    }, 60000);
  },
  beforeUnmount() {
    // 清理定时器
    clearInterval(this.timerID);
    // 移除localStorage监听
    window.removeEventListener("storage", this.setupStorageListener);
    // 移除事件总线监听
    eventBus.off("userInfoUpdated");
  },
};
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* border-bottom: 1px solid #e0e0e0; */
}

.app-header {
  background-color: #ffffff;
  color: #000;
  /* font-weight: bold; */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px !important;
  position: fixed;
  width: 100%;
  z-index: 1000;
  top: 0;
  border-bottom: 1px solid #e0e0e0;
}

.logo {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  color: #000;
  margin-left: 40px;
}

.logo-image {
  height: 40px;
  width: 40px;
  margin-right: 5px;
  border-radius: 50%;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
}

.date-display {
  font-size: 14px;
  color: #606266;
  margin: 0 20px;
  margin-right: 150px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.main-menu {
  /* border-bottom: 1px solid #e0e0e0; */
  border: 0;
  flex: 1;
  margin-left: 200px;
  background-color: #ffffff;
  color: #717171;
  font-weight: bold;
  border-bottom: none;
}

.main-menu :deep(.el-menu-item) {
  border-bottom: none;
  margin-right: 20px;
}

.main-menu :deep(.el-menu--horizonal) {
  border-bottom: none;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 10px;
  /* border: 1px solid #717171; */
}

.app-main {
  padding: 60px 0 0 0;
  flex: 1;
  /* background-color: #f4f5fa; */
}

// ⚠️ 确保这些颜色变量已在您的文件顶部定义
$primary-color: #409eff; // 主色（蓝色）
$footer-bg: #34495e; // 底部背景色（深色，例如深蓝灰）
$link-color: #bdc3c7; // 链接默认颜色
$copyright-color: #95a5a6; // 版权信息颜色

// --- 底部 (Footer) 样式优化 ---
.app-footer {
  height: 80px;
  line-height: normal;
  background-color: $footer-bg;
  color: #ecf0f1; // 浅色文本
  padding: 20px 25px;
  font-size: 14px;

  // 增加顶部强调线，增强结构感
  // border-top: 4px solid $primary-color;

  .footer-content {
    max-width: 1400px; // 与主体内容的最大宽度保持一致
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; // 垂直居中
    height: 100%;
    gap: 8px; // 链接与版权信息之间的间距
  }

  .footer-links {
    // 使用 flex 或 gap 来控制链接间距，避免使用 margin 造成布局问题
    display: flex;
    gap: 20px;
    margin-bottom: 5px; // 稍微下沉链接区域

    a {
      color: $link-color;
      text-decoration: none;
      font-weight: 400;
      transition: color 0.3s ease, transform 0.3s ease; // 平滑过渡效果

      &:hover {
        color: $primary-color; // 悬停时使用主色
        text-decoration: underline;
        transform: translateY(-1px); // 悬浮感
      }
    }
  }

  .footer-copyright {
    color: $copyright-color;
    font-size: 13px;
    font-weight: 300;
  }
}

// 响应式调整（可选：在小屏幕上调整布局）
@media (max-width: 600px) {
  .app-footer {
    height: auto;
    padding: 15px 10px;

    .footer-content {
      gap: 12px;
    }

    .footer-links {
      flex-direction: column; // 垂直排列链接
      align-items: center;
      gap: 5px; // 减少垂直间距
    }
  }
}
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    height: auto !important;
    padding: 10px;
  }

  .logo {
    margin-bottom: 10px;
  }

  .main-menu {
    margin-left: 0;
    width: 100%;
  }

  .header-right {
    margin-top: 10px;
    margin-left: 0;
  }

  .app-main {
    padding-top: 160px;
  }
}

.notification-button {
  margin-right: 15px;
  font-size: 20px;
  /* color: #606266; */
  color: #717171;
}

.notification-button:hover {
  color: #409eff;
}

.notification-header {
  padding: 0 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.notification-tabs {
  margin-bottom: 0;
}

.notification-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.notification-category {
  margin-bottom: 8px;
}

.notification-item {
  background-color: #f9fafc;
  padding: 12px 15px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.notification-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.notification-content :deep(.el-timeline-item__node) {
  background-color: #409eff;
}
.notification-content :deep(.el-timeline-item__node--primary) {
  background-color: #409eff;
}

.notification-content :deep(.el-timeline-item__node--success) {
  background-color: #67c23a;
}

.notification-content :deep(.el-timeline-item__node--danger) {
  background-color: #f56c6c;
}

.notification-content :deep(.el-timeline-item__tail) {
  background-color: #e4e7ed;
}

.notification-content :deep(.el-timeline-item__timestamp) {
  color: #909399;
  margin-bottom: 8px;
  display: block;
}

.notification-content {
  padding: 0 15px 15px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  scrollbar-width: thin;
}

.notification-content::-webkit-scrollbar {
  width: 6px;
}

.notification-content::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 3px;
}

.notification-content::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

.notification-content {
  padding: 0 15px;
}

.notification-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.notification-text {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.empty-notification {
  padding: 30px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.main-menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
}

.main-menu :deep(.el-menu-item .menu-icon) {
  margin-right: 4px;
  font-size: 32px;
  /* color: #409eff; */
}

.main-menu :deep(.el-menu-item.is-active .menu-icon) {
  color: #409eff;
}

.main-menu :deep(.el-menu-item:hover .menu-icon) {
  color: #409eff;
}

.search-box {
  margin-left: -45px;
  margin-right: 120px;
  border-radius: 8px;
}
</style>
