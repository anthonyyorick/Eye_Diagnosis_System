<template>
  <div class="notification-system">
    <!-- 通知图标 -->
    <el-badge is-dot class="notification-badge" v-if="unreadNotifications > 0">
      <el-button
        type="text"
        class="notification-button"
        @click="toggleNotification"
      >
        <el-icon><Bell /></el-icon>
      </el-button>
    </el-badge>
    <el-button
      v-else
      type="text"
      class="notification-button"
      @click="toggleNotification"
    >
      <el-icon><Bell /></el-icon>
    </el-button>

    <!-- 通知抽屉 -->
    <el-drawer
      v-model="showNotification"
      title="系统通知"
      direction="rtl"
      size="400px"
      :with-header="true"
    >
      <div class="notification-header">
        <el-tabs v-model="activeNotificationTab" class="notification-tabs">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="系统更新" name="system"></el-tab-pane>
          <el-tab-pane label="诊断通知" name="diagnosis"></el-tab-pane>
          <el-tab-pane label="异常提醒" name="abnormal"></el-tab-pane>
        </el-tabs>
      </div>

      <div class="notification-content">
        <el-timeline>
          <el-timeline-item
            v-for="(notice, index) in filteredNotifications"
            :key="index"
            :timestamp="notice.time"
            :type="getNoticeTypeColor(notice.type)"
            placement="top"
            :hollow="index !== 0"
          >
            <div class="notification-item">
              <div class="notification-category">
                <el-tag :type="getNoticeTagType(notice.type)" size="small">
                  {{ getNoticeTypeName(notice.type) }}
                </el-tag>
              </div>
              <div class="notification-title">{{ notice.title }}</div>
              <div class="notification-text">{{ notice.content }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>

        <div
          v-if="filteredNotifications.length === 0"
          class="empty-notification"
        >
          暂无通知
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { Bell } from "@element-plus/icons-vue";

export default {
  name: "NotificationSystem",
  components: {
    Bell,
  },
  data() {
    return {
      showNotification: false,
      unreadNotifications: 0,
      activeNotificationTab: "all",
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

        // {
        //   type: "diagnosis",
        //   title: "批量诊断完成",
        //   content:
        //     "您提交的批量诊断任务（15组图像）已完成，全部结果可在报告中心查看。",
        //   time: "2025-03-13 16:20",
        // },
        // {
        //   type: "abnormal",
        //   title: "异常病例提醒",
        //   content:
        //     "患者李华（ID: P2025028）的诊断结果显示高度疑似严重视网膜病变，请优先处理。",
        //   time: "2025-03-14 11:05",
        // },
        // {
        //   type: "abnormal",
        //   title: "异常诊断率提醒",
        //   content:
        //     "过去24小时内诊断的病例中，糖尿病视网膜病变检出率较往常高出30%，请关注。",
        //   time: "2025-03-13 08:30",
        // },
        {
          type: "system",
          title: "数据库维护通知",
          content:
            "系统将于本周日凌晨进行数据库维护，届时部分历史报告查询功能将暂时不可用。",
          time: "2025-03-11 17:00",
        },
        // {
        //   type: "diagnosis",
        //   title: "紧急会诊请求",
        //   content:
        //     "主任医师张教授邀请您参与患者陈某某（ID: P2025022）的远程会诊，请查看详情。",
        //   time: "2025-03-10 15:45",
        // },
      ],
    };
  },
  mounted() {
    // 从localStorage中获取通知已读状态
    const notificationsRead =
      localStorage.getItem("notificationsRead") === "true";
    if (notificationsRead) {
      this.unreadNotifications = 0;
    } else {
      // 初始化未读通知数量
      this.unreadNotifications = this.getInitialUnreadCount();
    }
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
    getInitialUnreadCount() {
      // 这里可以根据业务逻辑计算初始未读数量
      // 例如，如果从API获取通知，可以计算有多少条未读
      return 2; // 示例值
    },
    toggleNotification() {
      this.showNotification = !this.showNotification;
      if (this.showNotification) {
        this.unreadNotifications = 0;
        // 将已读状态保存到localStorage
        localStorage.setItem("notificationsRead", "true");
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
  },
};
</script>

<style scoped>
.notification-system {
  display: flex;
  align-items: center;
}

.notification-badge {
  margin-right: 15px;
}

.notification-button {
  margin-right: 0px;
  font-size: 20px;
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

.empty-notification {
  padding: 30px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
