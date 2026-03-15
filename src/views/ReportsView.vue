<template>
  <app-layout active-menu="/reports">
    <div class="reports-container">
      <h1 class="page-title">病例报告管理</h1>
      <!-- 个人诊断记录 -->
      <div class="personal-records-section">
        <!-- <h2 class="section-title">个人诊断记录</h2> -->
        <el-card class="stats-card">
          <div class="stats-info">
            <div class="stats-item">
              <span class="stats-label">今日您诊断了:</span>
              <span class="stats-value">{{ personalStats.todayNum }}</span>
              <span class="stats-label"> &nbsp;&nbsp;例,</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">一共诊断了:</span>
              <span class="stats-value">{{ personalStats.total }} </span>
              <span class="stats-label"> &nbsp;&nbsp;例</span>
            </div>
          </div>
        </el-card>

        <el-card class="records-card">
          <template #header>
            <!-- <icon class="el-icon-document"></icon> -->
            <!-- <el-icon :color="'#409EFF'" :size="10"><Memo /></el-icon> -->
            <span class="section-title">最近诊断记录</span>
          </template>
          <el-table
            :data="personalRecords"
            style="width: 100%"
            border
            v-loading="personalRecordsLoading"
          >
            <el-table-column
              prop="patientId"
              label="患者ID"
              width="120"
              sortable
            ></el-table-column>
            <el-table-column
              prop="diagnosisTime"
              label="诊断时间"
              width="180"
              sortable
            >
              <template #default="scope">
                {{ formatTime(scope.row.diagnosisTime) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="leftResult"
              label="左眼诊断"
              width="180"
            ></el-table-column>
            <el-table-column
              prop="rightResult"
              label="右眼诊断"
              width="180"
            ></el-table-column>
            <el-table-column
              prop="finalResult"
              label="综合诊断"
            ></el-table-column>
            <el-table-column label="置信度" width="180">
              <template #default="scope">
                <div style="display: flex; gap: 0.5rem">
                  <div>
                    左眼: {{ (scope.row.leftConfidence * 100).toFixed(0) }}%
                  </div>
                  <div>
                    右眼: {{ (scope.row.rightConfidence * 100).toFixed(0) }}%
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button
                  size="small"
                  type="primary"
                  @click="viewReportDetail(scope.row)"
                  >查看</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="personalTotal"
              :page-size="personalPageSize"
              :page-sizes="[10, 20, 50, 100]"
              @size-change="handlePersonalSizeChange"
              @current-change="handlePersonalPageChange"
            ></el-pagination>
          </div>
        </el-card>
      </div>

      <!-- <div>
        <h2 class="page-title">系统报告管理</h2>
      </div> -->
      <div style="background-color: #fff; padding: 1rem">
        <div class="filter-section">
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <!-- <el-form-item
            label="系统报告管理"
            style="font-size: 3rem"
          ></el-form-item> -->
            <el-form-item>
              <template #label>
                <span class="section-title">系统报告管理</span>
                <el-tag
                  v-if="isFiltered"
                  size="small"
                  type="info"
                  class="filter-tag"
                >
                  已筛选
                </el-tag>
              </template>
            </el-form-item>
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :default-time="['00:00:00', '23:59:59']"
                :clearable="true"
                :shortcuts="dateShortcuts"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="疾病类型">
              <el-select
                v-model="filterForm.diseaseType"
                placeholder="请选择"
                clearable
                style="width: 180px"
              >
                <el-option
                  v-for="item in diseaseOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="applyFilter"
                >应用筛选</el-button
              >
              <!-- <el-button
                type="success"
                @click="fetchAllRecords"
                style="background-color: #5cb85c"
                >查看所有记录</el-button
              > -->
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="reports-section">
          <el-tabs v-model="activeTab" type="card">
            <el-tab-pane label="列表视图" name="list">
              <el-table
                :data="filteredReports"
                style="width: 100%"
                border
                :height="tableHeight"
                v-loading="loading"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column
                  prop="patientId"
                  label="ID"
                  width="120"
                  sortable
                ></el-table-column>
                <el-table-column
                  prop="diagnosisTime"
                  label="诊断时间"
                  width="180"
                  sortable
                >
                  <template #default="scope">
                    {{ formatTime(scope.row.diagnosisTime) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="leftEye.diagnosis"
                  label="左眼诊断"
                  width="180"
                ></el-table-column>
                <el-table-column
                  prop="rightEye.diagnosis"
                  label="右眼诊断"
                  width="180"
                ></el-table-column>
                <el-table-column
                  prop="finalDiagnosis"
                  label="综合诊断"
                ></el-table-column>
                <el-table-column label="置信度" width="180">
                  <template #default="scope">
                    <div style="display: flex; gap: 0.5rem">
                      <div>左眼: {{ scope.row.leftEye.confidence }}%</div>
                      <div>右眼: {{ scope.row.rightEye.confidence }}%</div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                  <template #default="scope">
                    <el-button
                      size="small"
                      type="primary"
                      @click="viewReportDetail(scope.row)"
                      style="
                        color: #409eff;
                        background-color: #ecf5ff;
                        border: 1px solid #b3d8ff;
                      "
                      >查看</el-button
                    >
                    <el-button
                      size="small"
                      type="success"
                      style="
                        color: #67c23a;
                        background-color: #f0f9eb;
                        border: 1px solid #c2e7b0;
                      "
                      @click="exportReport(scope.row)"
                      >导出</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container">
                <el-pagination
                  background
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="totalReports"
                  :page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                ></el-pagination>
              </div>
            </el-tab-pane>

            <el-tab-pane label="时间轴视图" name="timeline">
              <div class="timeline-container">
                <div class="timeline-controls">
                  <el-button size="small" @click="expandAllDays"
                    >展开全部</el-button
                  >
                  <el-button size="small" @click="collapseAllDays"
                    >折叠全部</el-button
                  >
                </div>
                <el-timeline>
                  <el-timeline-item
                    v-for="(group, date) in groupedReports"
                    :key="date"
                    :timestamp="date"
                    placement="top"
                  >
                    <el-card>
                      <div
                        class="timeline-header"
                        @click="toggleCollapseDay(date)"
                      >
                        <h4>
                          {{ date }} ({{ group.length }}份报告)
                          <el-tag
                            size="small"
                            type="info"
                            v-if="hasPersonalRecords(group)"
                          >
                            包含您的诊断
                          </el-tag>
                        </h4>
                        <el-icon
                          :class="[
                            collapsedDays[date]
                              ? 'el-icon-arrow-down'
                              : 'el-icon-arrow-up',
                          ]"
                        >
                          <ArrowDown v-if="collapsedDays[date]" />
                          <ArrowUp v-else />
                        </el-icon>
                      </div>
                      <div
                        v-show="!collapsedDays[date]"
                        class="timeline-reports"
                      >
                        <div
                          v-for="report in group"
                          :key="
                            report.id || report.patientId + report.diagnosisTime
                          "
                          class="timeline-report-item"
                          :class="[
                            getTimelineItemClass(report),
                            { 'is-personal': report.source === 'personal' },
                          ]"
                          @click="viewReportDetail(report)"
                        >
                          <div class="report-header">
                            <div class="report-id">
                              ID: {{ report.patientId }}
                            </div>
                            <div class="report-time">
                              {{
                                formatTime(report.diagnosisTime).split(" ")[1]
                              }}
                            </div>
                            <el-tag
                              size="small"
                              v-if="report.source === 'personal'"
                              type="primary"
                              class="source-tag"
                            >
                              我的诊断
                            </el-tag>
                          </div>
                          <div class="report-diagnosis">
                            {{ report.finalResult || report.finalDiagnosis }}
                          </div>
                          <div class="report-tags">
                            <el-tag
                              size="small"
                              :type="
                                getTagType(
                                  report.leftResult || report.leftEye?.diagnosis
                                )
                              "
                            >
                              左眼:
                              {{
                                report.leftResult || report.leftEye?.diagnosis
                              }}
                            </el-tag>
                            <el-tag
                              size="small"
                              :type="
                                getTagType(
                                  report.rightResult ||
                                    report.rightEye?.diagnosis
                                )
                              "
                            >
                              右眼:
                              {{
                                report.rightResult || report.rightEye?.diagnosis
                              }}
                            </el-tag>
                          </div>
                        </div>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- <div class="batch-actions">
        <el-button
          type="primary"
          @click="batchExport"
          :disabled="selectedReports.length === 0"
        >
          批量导出 ({{ selectedReports.length }})
        </el-button>
        <el-button
          type="danger"
          @click="batchArchive"
          :disabled="selectedReports.length === 0"
        >
          批量归档 ({{ selectedReports.length }})
        </el-button>
      </div> -->
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/components/AppLayout.vue";
import request from "@/utils/axios"; // 导入axios实例
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

export default {
  name: "ReportsView",
  components: {
    AppLayout,
    ...ElementPlusIconsVue,
  },
  data() {
    return {
      activeTab: "list",
      loading: false,
      personalRecordsLoading: false,
      reports: [],
      selectedReports: [],
      personalRecords: [],
      personalStats: {
        todayNum: 0,
        total: 0,
      },
      filterForm: {
        dateRange: [],
        diseaseType: "",
        confidenceRange: [0, 100],
      },
      diseaseOptions: [
        { value: "糖尿病", label: "糖尿病" },
        { value: "青光眼", label: "青光眼" },
        { value: "白内障", label: "白内障" },
        { value: "AMD", label: "AMD" },
        { value: "高血压", label: "高血压" },
        { value: "近视", label: "近视" },
        { value: "其他疾病/异常", label: "其他疾病/异常" },
        { value: "正常", label: "正常" },
      ],
      pageSize: 10,
      currentPage: 1,
      tableHeight: 500,
      totalReports: 0,
      queryParams: {
        beginTime: "",
        endTime: "",
        diagnosisType: "",
        page: 1,
        pageSize: 10,
      },
      personalPageSize: 10,
      personalCurrentPage: 1,
      personalTotal: 0,
      collapsedDays: {},
      dateShortcuts: [
        {
          text: "最近一周",
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            return [this.formatDateString(start), this.formatDateString(end)];
          },
        },
        {
          text: "最近一个月",
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            return [this.formatDateString(start), this.formatDateString(end)];
          },
        },
        {
          text: "最近三个月",
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 3);
            return [this.formatDateString(start), this.formatDateString(end)];
          },
        },
        {
          text: "最近半年",
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 6);
            return [this.formatDateString(start), this.formatDateString(end)];
          },
        },
        {
          text: "最近一年",
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setFullYear(start.getFullYear() - 1);
            return [this.formatDateString(start), this.formatDateString(end)];
          },
        },
      ],
      isFiltered: false,
    };
  },
  computed: {
    filteredReports() {
      return this.reports;
    },
    groupedReports() {
      // 按日期分组报告（包括系统报告和个人报告）
      const groups = {};

      // 添加系统报告
      this.reports.forEach((report) => {
        const date = new Date(report.diagnosisTime).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        // 标记报告来源
        groups[date].push({
          ...report,
          source: "system",
        });
      });

      // 添加个人诊断记录（如果有）
      this.personalRecords.forEach((record) => {
        const date = new Date(record.diagnosisTime).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        // 如果这条记录不在系统报告中，添加它（避免重复）
        const isDuplicate = groups[date].some(
          (r) =>
            r.patientId === record.patientId &&
            r.diagnosisTime === record.diagnosisTime
        );

        if (!isDuplicate) {
          // 标记报告来源
          groups[date].push({
            ...record,
            source: "personal",
          });
        }
      });

      // 按日期降序排序
      return Object.keys(groups)
        .sort((a, b) => new Date(b) - new Date(a))
        .reduce((obj, key) => {
          // 对每天的报告按时间排序
          obj[key] = groups[key].sort(
            (a, b) => new Date(b.diagnosisTime) - new Date(a.diagnosisTime)
          );
          return obj;
        }, {});
    },
  },
  watch: {
    activeTab(newValue) {
      if (newValue === "timeline") {
        this.$nextTick(() => {
          this.initializeCollapsedDays();
        });
      }
    },
  },
  methods: {
    formatConfidence(val) {
      return val + "%";
    },

    async applyFilter() {
      this.currentPage = 1;
      this.loading = true;

      // 设置查询参数
      if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
        // 格式化日期为API所需的格式（YYYY-MM-DD）
        const startDate = this.filterForm.dateRange[0];
        const endDate = this.filterForm.dateRange[1];

        this.queryParams.beginTime = startDate;
        this.queryParams.endTime = endDate;
      } else {
        this.queryParams.beginTime = "";
        this.queryParams.endTime = "";
      }

      this.queryParams.diagnosisType = this.filterForm.diseaseType || "";
      this.queryParams.page = this.currentPage;
      this.queryParams.pageSize = this.pageSize;

      await this.fetchDiagnosisRecords();

      // 检查筛选后的记录数量
      if (this.reports.length === 0) {
        this.$message.warning("没有找到符合条件的记录，请调整筛选条件");
      } else {
        this.$message.success(`找到 ${this.totalReports} 条符合条件的记录`);
      }

      this.isFiltered = true;
    },

    resetFilter() {
      this.fetchAllRecords();
      this.isFiltered = false;
    },

    handleSelectionChange(selection) {
      this.selectedReports = selection;
    },

    async handleSizeChange(size) {
      this.pageSize = size;
      this.queryParams.pageSize = size;
      this.currentPage = 1;
      this.queryParams.page = 1;
      await this.fetchDiagnosisRecords();
    },

    async handleCurrentChange(page) {
      this.currentPage = page;
      this.queryParams.page = page;
      await this.fetchDiagnosisRecords();
    },

    viewReportDetail(report) {
      this.$router.push(`/reports/detail/${report.patientId}`);
    },

    exportReport(report) {
      this.$message.success(`病例ID ${report.patientId} 的报告已导出`);
    },

    batchExport() {
      this.$message.success(`已导出 ${this.selectedReports.length} 份报告`);
    },

    batchArchive() {
      this.$confirm("确定要归档选中的报告吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 获取选中报告的ID
          const selectedIds = this.selectedReports.map(
            (report) => report.patientId || report.id
          );

          // 创建归档记录数据
          const archivedReports = JSON.parse(
            localStorage.getItem("archivedReports") || "[]"
          );

          // 将选中的报告添加到归档列表
          this.selectedReports.forEach((report) => {
            archivedReports.push({
              id: report.patientId || report.id,
              archiveDate: new Date().toISOString(),
              report: report,
            });
          });

          // 保存归档记录
          localStorage.setItem(
            "archivedReports",
            JSON.stringify(archivedReports)
          );

          // 显示成功消息
          this.$message.success(`已归档 ${this.selectedReports.length} 份报告`);

          // 清空选择
          this.selectedReports = [];
        })
        .catch(() => {
          // 取消操作
        });
    },

    getTagType(diagnosis) {
      // 根据诊断结果返回不同的标签类型
      switch (diagnosis) {
        case "正常":
          return "success";
        case "糖尿病":
        case "青光眼":
        case "AMD":
          return "danger";
        case "白内障":
        case "高血压":
          return "warning";
        case "近视":
          return "info";
        default:
          return "";
      }
    },

    // 调整表格高度
    adjustTableHeight() {
      this.tableHeight = window.innerHeight - 350; // 根据页面其他元素高度调整
    },

    // 获取诊断记录数据
    async fetchDiagnosisRecords() {
      this.loading = true;
      try {
        // 仅在开发环境下打印调试信息
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Fetching diagnosis records with params:",
            this.queryParams
          );
        }

        const response = await request({
          method: "get",
          url: "/diagnosisrecord/show/page",
          params: this.queryParams,
        });

        if (response.code === 1) {
          // 更新数据
          this.reports = this.formatReports(response.data.records || []);
          this.totalReports = response.data.total || 0;

          // 如果当前是时间轴视图，更新折叠状态
          if (this.activeTab === "timeline") {
            this.$nextTick(() => {
              this.initializeCollapsedDays();
            });
          }
        } else {
          this.$message.error(response.msg || "获取诊断记录失败");
        }
      } catch (error) {
        console.error("获取诊断记录出错:", error);
        this.$message.error("获取诊断记录失败，请稍后重试");
      } finally {
        this.loading = false;
      }
    },

    // 重置筛选条件并获取所有记录
    async fetchAllRecords() {
      // 重置查询参数为默认值
      this.queryParams = {
        beginTime: "",
        endTime: "",
        diagnosisType: "",
        page: 1,
        pageSize: this.pageSize,
      };

      // 重置筛选表单
      this.filterForm = {
        dateRange: [],
        diseaseType: "",
        confidenceRange: [0, 100],
      };

      // 重置筛选状态
      this.isFiltered = false;

      // 获取所有记录
      await this.fetchDiagnosisRecords();
    },

    // 格式化报告数据，增加计算属性和UI所需字段
    formatReports(records) {
      return records.map((record) => {
        // 处理置信度，将0-1范围转换为0-100
        const leftConfidence = record.leftConfidence
          ? Math.round(record.leftConfidence * 100)
          : 0;
        const rightConfidence = record.rightConfidence
          ? Math.round(record.rightConfidence * 100)
          : 0;

        return {
          ...record,
          leftEye: {
            diagnosis: record.leftResult || "",
            confidence: leftConfidence,
          },
          rightEye: {
            diagnosis: record.rightResult || "",
            confidence: rightConfidence,
          },
          finalDiagnosis: record.finalResult || "",
          time: record.diagnosisTime, // 保持兼容性
          patientId: record.patientId || record.id, // 确保patientId存在
        };
      });
    },

    formatTime(timeString) {
      if (!timeString) return "";
      try {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return timeString; // Return original if invalid

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
      } catch (error) {
        console.error("Error formatting time:", error);
        return timeString; // Return original on error
      }
    },

    // 获取个人诊断记录
    async fetchPersonalDiagnosisRecords() {
      this.personalRecordsLoading = true;
      try {
        const doctorId = localStorage.getItem("doctorId") || "";
        const response = await request({
          method: "get",
          url: "/diagnosisrecord/show/me",
          params: {
            doctorId: doctorId,
            page: this.personalCurrentPage,
            pageSize: this.personalPageSize,
          },
        });

        if (response.code === 1) {
          // 更新数据
          this.personalRecords = response.data.records || [];
          this.personalStats = {
            todayNum: response.data.todayNum || 0,
            total: response.data.total || 0,
          };
          this.personalTotal = response.data.total || 0;
        } else {
          this.$message.error(response.msg || "获取个人诊断记录失败");
        }
      } catch (error) {
        console.error("获取个人诊断记录出错:", error);
        this.$message.error("获取个人诊断记录失败，请稍后重试");
      } finally {
        this.personalRecordsLoading = false;
      }
    },

    handlePersonalSizeChange(size) {
      this.personalPageSize = size;
      this.personalCurrentPage = 1; // Reset to first page when changing page size
      this.fetchPersonalDiagnosisRecords();
    },

    handlePersonalPageChange(page) {
      this.personalCurrentPage = page;
      this.fetchPersonalDiagnosisRecords();
    },

    toggleCollapseDay(date) {
      this.collapsedDays[date] = !this.collapsedDays[date];
    },

    getTimelineItemClass(report) {
      // Get diagnosis type for styling
      const leftDiagnosis =
        report.leftResult || report.leftEye?.diagnosis || "";
      const rightDiagnosis =
        report.rightResult || report.rightEye?.diagnosis || "";

      // Determine class based on diagnosis severity
      if (
        leftDiagnosis.includes("AMD") ||
        rightDiagnosis.includes("AMD") ||
        leftDiagnosis.includes("糖尿病") ||
        rightDiagnosis.includes("糖尿病") ||
        leftDiagnosis.includes("青光眼") ||
        rightDiagnosis.includes("青光眼")
      ) {
        return "diagnosis-severe";
      } else if (
        leftDiagnosis.includes("白内障") ||
        rightDiagnosis.includes("白内障") ||
        leftDiagnosis.includes("高血压") ||
        rightDiagnosis.includes("高血压")
      ) {
        return "diagnosis-moderate";
      } else if (
        leftDiagnosis.includes("近视") ||
        rightDiagnosis.includes("近视") ||
        leftDiagnosis.includes("其他") ||
        rightDiagnosis.includes("其他")
      ) {
        return "diagnosis-mild";
      } else if (
        leftDiagnosis.includes("正常") &&
        rightDiagnosis.includes("正常")
      ) {
        return "diagnosis-normal";
      }

      return "";
    },

    // 初始化折叠状态
    initializeCollapsedDays() {
      // 设置所有日期为展开状态
      const collapsedState = {};
      Object.keys(this.groupedReports).forEach((date) => {
        collapsedState[date] = false;
      });
      this.collapsedDays = collapsedState;
    },

    // 将日期格式化为YYYY-MM-DD
    formatDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    expandAllDays() {
      const collapsedState = {};
      Object.keys(this.groupedReports).forEach((date) => {
        collapsedState[date] = false;
      });
      this.collapsedDays = collapsedState;
    },

    collapseAllDays() {
      const collapsedState = {};
      Object.keys(this.groupedReports).forEach((date) => {
        collapsedState[date] = true;
      });
      this.collapsedDays = collapsedState;
    },

    hasPersonalRecords(group) {
      return group.some((report) => report.source === "personal");
    },
  },
  async mounted() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      this.$router.push("/login");
    }

    // 调整表格高度
    this.adjustTableHeight();
    window.addEventListener("resize", this.adjustTableHeight);

    // 初始化时获取所有数据
    await this.fetchAllRecords();
    await this.fetchPersonalDiagnosisRecords(); // 获取个人诊断记录

    // 初始化折叠状态
    this.initializeCollapsedDays();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.adjustTableHeight);
  },
};
</script>

<style lang="scss" scoped>
@use "sass:map";

// --- 颜色变量 (Color Variables) ---
$primary-color: #409eff; // Element Plus 主色
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;
$background-color: #f4f6f9; // 轻微的背景色
$card-border-color: #ebeef5;
$text-color-primary: #303133;
$text-color-secondary: #909399;

.reports-container {
  padding: 20px;
  background-color: $background-color;
  min-height: calc(100vh - 50px); // 确保内容区填满屏幕
}

.page-title {
  font-size: 28px;
  color: $text-color-primary;
  margin-bottom: 20px;
  border-bottom: 2px solid $primary-color;
  padding-bottom: 10px;
  font-weight: 600;
  margin-top: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-color-primary;
  display: inline-block;
  vertical-align: middle;
}

// --- 个人诊断记录 (Personal Records Section) ---
.personal-records-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;

  .stats-card {
    width: 100%;
    .el-card__body {
      padding: 20px;
    }

    .stats-info {
      display: flex;
      justify-content: space-around;
      align-items: center;
      .stats-item {
        display: flex;
        align-items: baseline;
      }
    }
  }

  .stats-label {
    font-size: 16px;
    color: $text-color-secondary;
  }

  .stats-value {
    font-size: 32px;
    font-weight: bold;
    color: $primary-color;
    margin: 0 5px;
  }

  .records-card {
    .el-card__header {
      padding: 10px 20px;
      border-bottom: 1px solid $card-border-color;
    }
  }
}

// --- 筛选表单 (Filter Section) ---
.filter-section {
  margin-bottom: 5px;
  .filter-form {
    padding: 15px 20px;
    background-color: #ffffff;
    // border-radius: 4px;
    // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid #f2f6fc;

    .el-form-item {
      margin-right: 20px;
      margin-bottom: 0; // 调整行内表单项的间距

      &:first-child {
        // 系统报告管理的标题项
        margin-right: 40px;
      }
    }

    .filter-tag {
      margin-left: 10px;
    }
  }
}

// --- 报告列表/时间轴 (Reports Section) ---
.reports-section {
  .el-tabs--card {
    /* 核心：清空 el-tabs--card 的默认边框样式，转换为下划线风格 */

    /* 针对 Header 部分的样式调整 */
    :deep(.el-tabs__header) {
      /* 移除顶部的默认边框，使用浅灰色作为通用底部边框分隔线 */
      border-bottom: 1px solid #e4e7ed; /* 替换 $card-border-color 或 $border-color-light */
      margin-bottom: 0;
    }

    /* 针对 Nav 容器的样式调整 */
    :deep(.el-tabs__nav) {
      border: none; /* 移除导航容器的边框 */
    }

    /* 针对 Tab Item（标签项）的样式调整 */
    :deep(.el-tabs__item) {
      /* 移除卡片标签项的边框 */
      border: none;
      font-weight: 600; /* 加粗字体 */
      color: #303133; /* 默认文字颜色，替换 $text-color-primary */

      /* 激活状态的样式 */
      &.is-active {
        color: #409eff; /* 激活时文字颜色，替换 $primary-color (Element Plus 默认蓝) */
        background-color: transparent; /* 确保激活时不带背景色 */

        /* 关键：使用下划线来突出激活状态 */
        /* 下划线颜色和粗细 */
        border-bottom: 2px solid #409eff;
        /* 调整 padding 以容纳下划线，防止文字被切割 */
        padding-bottom: 10px;
      }

      /* 鼠标悬停效果 */
      &:hover {
        color: #409eff; /* 悬停时使用主题色 */
      }
    }

    /* 针对 Content 部分的样式调整 */
    :deep(.el-tabs__content) {
      /* 为内容区添加顶部间距 */
      padding: 20px 0; /* 替换 $spacing-base */
    }
  }
}

// 通用分页容器
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end; /* 分页器右对齐 */
}

// 表格样式优化
:deep(.el-table) {
  .el-table__header-wrapper th {
    background-color: #f5f7fa;
    color: $text-color-primary;
    font-weight: 600;
  }

  .el-table__body tr.current-row > td {
    background-color: #e6f7ff; // 选中行颜色
  }
}

// --- 批量操作 (Batch Actions) ---
.batch-actions {
  margin-top: 20px;
  padding: 15px 20px;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end; // 靠右对齐
  gap: 10px;
}

// --- 时间轴视图 (Timeline View) ---
.timeline-container {
  padding: 20px;
  background-color: #ffffff;
  min-height: 400px;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .timeline-controls {
    margin-bottom: 20px;
    text-align: right;
  }
}

:deep(.el-timeline-item__timestamp) {
  font-size: 18px;
  font-weight: 700;
  color: $primary-color;
  padding-bottom: 10px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: $text-color-primary;
  }

  .el-icon {
    transition: transform 0.3s;
    font-size: 14px;
    color: $info-color;
  }
  .el-icon-arrow-down {
    transform: rotate(0deg);
  }
  .el-icon-arrow-up {
    transform: rotate(180deg);
  }
}

.timeline-reports {
  padding-top: 10px;
}

.timeline-report-item {
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  border-left: 5px solid $info-color; // 默认边框色
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &.is-personal {
    border-left-color: $primary-color; // 突出个人诊断
    background-color: lighten($primary-color, 45%);
  }

  // 根据结果类型设置不同的左侧边框颜色
  &.type-success {
    border-left-color: $success-color;
  }
  &.type-warning {
    border-left-color: $warning-color;
  }
  &.type-danger {
    border-left-color: $danger-color;
  }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    margin-bottom: 5px;

    .report-id {
      font-weight: 600;
      color: $text-color-primary;
    }
    .report-time {
      color: $text-color-secondary;
    }
    .source-tag {
      margin-left: 10px;
    }
  }

  .report-diagnosis {
    font-size: 16px;
    font-weight: 500;
    color: $primary-color;
    margin-bottom: 8px;
  }

  .report-tags .el-tag {
    margin-right: 8px;
  }
}
</style>
