<template>
  <router-view />
</template>

<style>
:root {
  --brand-primary: #2aa7a1; /* 医疗主色（青绿） */
  --brand-primary-600: #21948f;
  --brand-primary-100: #e6f4f3;
  --brand-info: #1e88e5;
  --brand-success: #22c55e;
  --brand-warning: #f59e0b;
  --brand-danger: #ef4444;
  --text-color: #1f2937;
  --text-muted: #6b7280;
  --bg-page: #f6f9fb;
  --bg-card: #ffffff;
  --border-color: #e5eef5;
  --shadow-soft: 0 4px 16px rgba(17, 24, 39, 0.06);

  /* Element Plus 主题映射（便于全局一致） */
  --el-color-primary: var(--brand-primary);
  --el-color-success: var(--brand-success);
  --el-color-warning: var(--brand-warning);
  --el-color-danger: var(--brand-danger);
  --el-color-info: var(--brand-info);
}

body {
  margin: 0;
  padding: 0;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--bg-page);
}

#app {
  min-height: 100vh;
}

/* 全局卡片/分隔线/表头轻度强化，保持医疗视觉一致 */
.el-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: var(--shadow-soft);
}

.el-divider {
  background-color: var(--border-color);
}

.el-table thead th {
  background-color: #f5fbff !important;
}
</style>
