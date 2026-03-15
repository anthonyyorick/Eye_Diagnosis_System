<template>
  <app-layout active-menu="/analytics">
    <div class="analytics-container">
      <div class="analytics-header">
        <h1 class="page-title">慧眼识疾智能诊断系统 · 医学数据可视化面板</h1>
        <div class="clock">{{ currentTime }}</div>
      </div>

      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :sm="24" :md="24" :lg="24">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="section-title">诊断趋势分析</h3>
                <div class="chart-controls">
                  <el-radio-group v-model="trendChartType" size="small">
                    <el-radio-button label="daily">日视图</el-radio-button>
                    <el-radio-button label="monthly">月视图</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </template>
            <div v-if="isLoading.diagnose" class="loading-wrapper">
              <el-skeleton animated :rows="5" />
            </div>
            <div
              v-else
              ref="trendChart"
              class="chart-container trend-chart-large"
            ></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="section-title">疾病分布分析</h3>
              </div>
            </template>
            <div v-if="isLoading.patient" class="loading-wrapper">
              <el-skeleton animated :rows="5" />
            </div>
            <div
              v-else
              ref="diseaseDistributionChart"
              class="chart-container"
            ></div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="section-title">患者年龄分布</h3>
              </div>
            </template>
            <div v-if="isLoading.patient" class="loading-wrapper">
              <el-skeleton animated :rows="5" />
            </div>
            <div
              v-else
              ref="ageDistributionChart"
              class="chart-container"
            ></div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="section-title">患者性别分布</h3>
              </div>
            </template>
            <div v-if="isLoading.patient" class="loading-wrapper">
              <el-skeleton animated :rows="5" />
            </div>
            <div
              v-else
              ref="genderDistributionChart"
              class="chart-container"
            ></div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="anomaly-card">
        <template #header>
          <div class="anomaly-header">
            <h3
              class="section-title"
              style="margin-top: 0px; margin-bottom: 0px"
            >
              异常病例分析
            </h3>
            <div class="anomaly-header-right">
              <el-tooltip
                content="置信度低于60%或诊断结果不一致的病例"
                placement="top"
              >
                <i class="el-icon-question"></i>
              </el-tooltip>
              <!-- <el-button
                size="small"
                icon="el-icon-refresh"
                circle
                @click="updateAnomalyCases"
                :loading="isLoading.anomaly"
              ></el-button> -->
            </div>
          </div>
        </template>
        <div v-if="isLoading.anomaly" class="loading-wrapper">
          <el-skeleton animated :rows="3" />
        </div>
        <el-table
          v-else
          :data="anomalyCases"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          border
          :empty-text="'暂无异常病例数据'"
        >
          <el-table-column prop="id" label="ID" width="120"></el-table-column>
          <el-table-column
            prop="time"
            label="诊断时间"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="leftEye.diagnosis"
            label="左眼诊断"
            width="150"
          ></el-table-column>
          <el-table-column
            prop="rightEye.diagnosis"
            label="右眼诊断"
            width="150"
          ></el-table-column>
          <el-table-column label="置信度" width="180">
            <template #default="scope">
              <div>
                <el-progress
                  :percentage="scope.row.leftEye.confidence"
                  :format="percentFormat"
                  :stroke-width="10"
                  :color="getConfidenceColor(scope.row.leftEye.confidence)"
                ></el-progress>
                <el-progress
                  :percentage="scope.row.rightEye.confidence"
                  :format="percentFormat"
                  :stroke-width="10"
                  :color="getConfidenceColor(scope.row.rightEye.confidence)"
                ></el-progress>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="anomalyReason"
            label="异常原因"
          ></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="viewAnomalyDetail(scope.row)"
                style="
                  color: #409eff;
                  background-color: #ecf5ff;
                  border: 1px solid #b3d8ff;
                "
                >查看</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/components/AppLayout.vue";
import * as echarts from "echarts";
import request from "@/utils/axios"; // 导入axios实例

export default {
  name: "AnalyticsView",
  components: {
    AppLayout,
  },
  data() {
    return {
      filterForm: {
        timeRange: "30days",
        department: ["outpatient"],
      },
      trendChartType: "daily",
      charts: {
        trendChart: null,
        diseaseDistributionChart: null,
        ageDistributionChart: null,
        genderDistributionChart: null,
      },
      anomalyCases: [],
      isLoading: {
        patient: false,
        diagnose: false,
        anomaly: false,
      },
      patientData: {
        diseaseDistribution: {},
        genderDistribution: [],
        ageDistribution: [],
      },
      diagnoseData: {
        normal: [],
        unusual: [],
      },
      currentTime: "",
      timer: null,
    };
  },
  watch: {
    trendChartType() {
      // 切换日/月视图时，重新获取并渲染趋势数据
      this.handleTrendTypeChange();
    },
  },
  methods: {
    // ----------------------------------------
    // 通用方法
    // ----------------------------------------
    async updateCharts() {
      // 串行执行数据请求
      await this.fetchPatientData();
      await this.fetchDiagnoseData();

      // 渲染图表
      this.renderTrendChart();
      this.updateDiseaseDistributionChart();
      this.updateAgeDistributionChart();
      this.updateGenderDistributionChart();
      await this.updateAnomalyCases();
    },
    updateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      this.currentTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    },
    resetFilter() {
      this.filterForm = {
        timeRange: "30days",
        department: ["outpatient"],
      };
      this.updateCharts();
    },
    percentFormat(percentage) {
      return percentage + "%";
    },
    getConfidenceColor(confidence) {
      if (confidence < 60) {
        return "#D9534F"; // 深红
      } else if (confidence < 80) {
        return "#F0AD4E"; // 金橙
      } else {
        return "#5CB85C"; // 稳重绿
      }
    },
    headerCellStyle() {
      return {
        background: "#f5f7fa", // 专业浅灰
        color: "#606266",
        fontWeight: "bold",
      };
    },
    viewAnomalyDetail(row) {
      this.$router.push(`/reports/detail/${row.id}`);
    },
    exportData(type) {
      this.$message.success(`数据已导出为${type.toUpperCase()}格式`);
    },
    getTimeRangeValue() {
      switch (this.filterForm.timeRange) {
        case "7days":
          return 7;
        case "30days":
          return 30;
        case "3months":
          return 90;
        case "1year":
          return 365;
        default:
          return 30;
      }
    },

    // ----------------------------------------
    // API 数据获取
    // ----------------------------------------
    async fetchPatientData() {
      this.isLoading.patient = true;
      try {
        const formData = new FormData();
        formData.append("time", this.getTimeRangeValue());

        // 模拟 API 调用
        const response = await request({
          method: "post",
          url: "/diagram/show/patient",
          headers: { "Content-Type": "multipart/form-data" },
          data: formData,
        });

        if (response.code === 1 || response.code === 200) {
          this.patientData = {
            // 确保使用默认数据，以便图表初始化
            diseaseDistribution: response.data.diseaseDistribution || {
              N: 0.3,
              D: 0.2,
              G: 0.1,
              C: 0.15,
              A: 0.05,
              H: 0.05,
              M: 0.1,
              O: 0.05,
            },
            genderDistribution: response.data.genderDistribution || [
              0.55, 0.45,
            ],
            ageDistribution: response.data.ageDistribution || [
              30, 50, 70, 90, 60, 40,
            ],
          };
        } else {
          this.$message.error(response.msg || "获取患者数据失败");
        }
      } catch (error) {
        console.error("获取患者数据出错:", error);
      } finally {
        this.isLoading.patient = false;
      }
    },

    async fetchDiagnoseData() {
      this.isLoading.diagnose = true;
      try {
        const formData = new FormData();
        const timeRange = this.getTimeRangeValue();

        // 修正时间参数
        formData.append(
          "timeType",
          this.trendChartType === "daily" ? "日" : "月"
        );
        formData.append("time", timeRange);

        // 模拟日期范围逻辑以确保 xAxisLabels 正确生成
        const endDate = new Date();
        let startDate = new Date(endDate);
        if (this.trendChartType === "daily") {
          startDate.setDate(endDate.getDate() - timeRange + 1);
        } else {
          startDate.setMonth(endDate.getMonth() - 1);
        }
        formData.append("startDate", startDate.toISOString().split("T")[0]);
        formData.append("endDate", endDate.toISOString().split("T")[0]);

        // 模拟 API 调用
        const response = await request({
          method: "post",
          url: "/diagram/show/diagnose",
          headers: { "Content-Type": "multipart/form-data" },
          data: formData,
        });

        if (response.code === 1 || response.code === 200) {
          const normalData = response.data.normal || [];
          const unusualData = response.data.unusual || [];

          this.diagnoseData = {
            normal: Array.isArray(normalData) ? normalData : [],
            unusual: Array.isArray(unusualData) ? unusualData : [],
          };
        } else {
          this.$message.error(response.msg || "获取诊断趋势数据失败");
        }
      } catch (error) {
        console.error("获取诊断趋势数据出错:", error);
      } finally {
        this.isLoading.diagnose = false;
      }
    },

    async updateAnomalyCases() {
      this.isLoading.anomaly = true;
      try {
        // 模拟 API 调用
        const response = await request({
          method: "get",
          url: "/diagnosisrecord/unusual/show",
          params: { page: 1, pageSize: 10 },
        });

        if (
          response.code === 1 ||
          (response.code === 200 && response.data && response.data.records)
        ) {
          this.anomalyCases = response.data.records.map((record) => {
            const leftConfidence = record.leftConfidence
              ? Math.round(record.leftConfidence * 100)
              : 0;
            const rightConfidence = record.rightConfidence
              ? Math.round(record.rightConfidence * 100)
              : 0;

            let anomalyReason = "";
            if (leftConfidence < 60 || rightConfidence < 60) {
              anomalyReason = "置信度低";
            }
            if (
              record.leftResult !== record.rightResult &&
              record.leftResult &&
              record.rightResult
            ) {
              anomalyReason =
                (anomalyReason ? anomalyReason + "，" : "") + "左右眼结果差异";
            }
            anomalyReason = anomalyReason || record.cause || "其他异常";

            return {
              id: record.patientId || record.id,
              time: record.diagnosisTime,
              leftEye: {
                diagnosis: record.leftResult || "N/A",
                confidence: leftConfidence,
              },
              rightEye: {
                diagnosis: record.rightResult || "N/A",
                confidence: rightConfidence,
              },
              anomalyReason: anomalyReason,
            };
          });
        } else {
          this.anomalyCases = [];
        }
      } catch (error) {
        console.error("获取异常病例数据出错:", error);
      } finally {
        this.isLoading.anomaly = false;
      }
    },

    // ----------------------------------------
    // ECharts 渲染
    // ----------------------------------------
    async handleTrendTypeChange() {
      await this.fetchDiagnoseData();
      this.$nextTick(() => {
        this.renderTrendChart();
      });
    },

    renderTrendChart() {
      if (!this.$refs.trendChart) return;

      if (!this.charts.trendChart) {
        this.charts.trendChart = echarts.init(this.$refs.trendChart);
      } else {
        this.charts.trendChart.clear();
      }

      const normalData = this.diagnoseData.normal || [];
      const unusualData = this.diagnoseData.unusual || [];
      const dataPoints = normalData.length;

      if (dataPoints === 0) {
        this.charts.trendChart.setOption({ series: [] }, true);
        return;
      }

      const validNormalData = normalData.map((val) =>
        isNaN(Number(val)) ? 0 : Number(val)
      );
      const validUnusualData = unusualData.map((val) =>
        isNaN(Number(val)) ? 0 : Number(val)
      );
      const totalData = validNormalData.map(
        (normal, index) => normal + (validUnusualData[index] || 0)
      );

      const xAxisLabels = [];
      const currentDate = new Date();

      // 趋势图 X轴标签生成逻辑
      for (let i = 0; i < dataPoints; i++) {
        const date = new Date(currentDate);
        if (this.trendChartType === "daily") {
          const timeRange = this.getTimeRangeValue();
          const daysFromEnd = Math.round(
            (dataPoints - 1 - i) * (timeRange / Math.max(dataPoints, 1))
          );
          date.setDate(date.getDate() - daysFromEnd);
          xAxisLabels.push(`${date.getMonth() + 1}月${date.getDate()}日`);
        } else {
          // monthly
          date.setMonth(date.getMonth() - (dataPoints - 1 - i));
          xAxisLabels.push(`${date.getFullYear()}年${date.getMonth() + 1}月`);
        }
      }

      const option = {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        legend: {
          data: ["总诊断量", "正常诊断", "异常诊断"],
          top: 10,
          textStyle: { color: "#303133" },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "15%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: xAxisLabels,
          axisLabel: {
            interval: 0,
            rotate:
              this.trendChartType === "daily" && xAxisLabels.length > 7
                ? 45
                : 0,
            color: "#303133",
          },
          axisLine: { lineStyle: { color: "#909399" } },
        },
        yAxis: {
          type: "value",
          name: "诊断数量",
          minInterval: 1,
          nameTextStyle: { color: "#303133" },
          splitLine: {
            show: true,
            lineStyle: { type: "dashed", color: "#eee" },
          },
          axisLabel: { color: "#303133" },
        },
        series: [
          {
            name: "总诊断量",
            type: "line",
            data: totalData,
            smooth: true,
            symbol: "circle",
            symbolSize: 8,
            lineStyle: { width: 3, color: "#409EFF" },
            itemStyle: { color: "#409EFF" },
            label: {
              show: true,
              position: "top",
              formatter: "{c}",
              fontSize: 12,
              color: "#409EFF",
            },
          },
          {
            name: "正常诊断",
            type: "bar",
            stack: "total",
            data: validNormalData,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "#95d475", // 顶部颜色（稍亮）
                  },
                  {
                    offset: 1,
                    color: "#67C23A", // 底部颜色（原始）
                  },
                ],
              },
              borderRadius: [5, 5, 0, 0], // 柱条顶部圆角
              borderColor: "#529b2e", // 边框颜色，增加立体感
              borderWidth: 1,
            },
            label: {
              show: validNormalData.length < 15,
              position: "inside",
              formatter: "{c}",
              fontSize: 12,
              color: "#fff",
            },
          },
          {
            name: "异常诊断",
            type: "bar",
            stack: "total",
            data: validUnusualData,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "#f89898", // 顶部颜色（稍亮）
                  },
                  {
                    offset: 1,
                    color: "#F56C6C", // 底部颜色（原始）
                  },
                ],
              },
              borderRadius: [5, 5, 0, 0], // 柱条顶部圆角
              borderColor: "#c45656", // 边框颜色
              borderWidth: 1,
            },
            label: {
              show: validUnusualData.length < 15,
              position: "inside",
              formatter: "{c}",
              fontSize: 12,
              color: "#fff",
            },
          },
        ],
      };
      this.charts.trendChart.setOption(option, true);
    },

    updateDiseaseDistributionChart() {
      if (!this.charts.diseaseDistributionChart) {
        this.charts.diseaseDistributionChart = echarts.init(
          this.$refs.diseaseDistributionChart
        );
      }

      const diseaseData = this.patientData.diseaseDistribution;
      const diseaseNames = {
        N: "正常",
        D: "糖尿病",
        G: "青光眼",
        C: "白内障",
        A: "AMD",
        H: "高血压",
        M: "近视",
        O: "其他",
      };

      const data = Object.entries(diseaseData).map(([key, value]) => ({
        name: diseaseNames[key] || key,
        value: parseFloat(
          (
            (typeof value === "number" ? value : parseFloat(value)) * 100
          ).toFixed(1)
        ),
      }));

      const option = {
        tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c}% ({d}%)" },
        color: [
          "#409EFF", // 正常 - 专业蓝
          "#F39C12", // 糖尿病 - 橙色
          "#8E44AD", // 青光眼 - 紫色
          "#95A5A6", // 白内障 - 灰蓝
          "#E74C3C", // AMD - 鲜红
          "#C0392B", // 高血压 - 深红
          "#1ABC9C", // 近视 - 青绿
          "#7F8C8D", // 其他 - 中性灰
        ],
        legend: {
          orient: "vertical",
          right: 10,
          top: "center",
          data: data.map((item) => item.name),
          textStyle: { color: "#303133" },
        },
        series: [
          {
            name: "疾病分布",
            type: "pie",
            radius: ["45%", "60%"],
            center: ["40%", "50%"],
            label: {
              show: true,
              position: "outside",
              formatter: "{b}: {c}%",
              color: "#303133",
            },
            emphasis: {
              label: { show: true, fontSize: "16", fontWeight: "bold" },
            },
            data: data,
          },
        ],
      };
      this.charts.diseaseDistributionChart.setOption(option);
    },

    updateAgeDistributionChart() {
      if (!this.charts.ageDistributionChart) {
        this.charts.ageDistributionChart = echarts.init(
          this.$refs.ageDistributionChart
        );
      }

      const ageDistribution = this.patientData.ageDistribution.slice(0, 6); // 确保不超过标签数
      const ageGroupLabels = [
        "0-18",
        "19-30",
        "31-45",
        "46-60",
        "61-75",
        "76+",
      ];

      const option = {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          data: ageGroupLabels,
          axisLabel: { interval: 0, color: "#303133" },
        },
        yAxis: {
          type: "value",
          name: "患者数量",
          minInterval: 1,
          nameTextStyle: { color: "#303133" },
          axisLabel: { color: "#303133" },
        },
        series: [
          {
            name: "患者数量",
            type: "bar",
            data: ageDistribution,
            itemStyle: {
              color: (params) =>
                [
                  "#5DADE2", // 浅蓝（0-18，青春、活力）
                  "#58D68D", // 绿色（19-30，成长、健康）
                  "#F4D03F", // 黄色（31-45，活跃、黄金年龄）
                  "#E67E22", // 橙色（46-60，稳重、责任感）
                  "#C0392B", // 深红（61-75，需关注健康）
                  "#2C3E50", // 深蓝灰（76+，沉稳、严肃）
                ][params.dataIndex % 6],
            },
            label: { show: true, position: "top", color: "#303133" },
          },
        ],
      };
      this.charts.ageDistributionChart.setOption(option);
    },

    updateGenderDistributionChart() {
      if (!this.charts.genderDistributionChart) {
        this.charts.genderDistributionChart = echarts.init(
          this.$refs.genderDistributionChart
        );
      }

      const genderDistribution = this.patientData.genderDistribution;
      const maleCount = genderDistribution[0]
        ? (genderDistribution[0] * 100).toFixed(1)
        : 0;
      const femaleCount = genderDistribution[1]
        ? (genderDistribution[1] * 100).toFixed(1)
        : 0;

      const option = {
        tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c}% ({d}%)" },
        legend: {
          orient: "horizontal",
          right: "center",
          top: 0,
          data: ["男", "女"],
          textStyle: { color: "#303133" },
        },
        color: ["#6CACE4", "#E26C6C"], // 蓝色（男）、红色（女）
        series: [
          {
            name: "性别分布",
            type: "pie",
            radius: "60%",
            center: ["40%", "50%"],
            data: [
              { value: maleCount, name: "男" },
              { value: femaleCount, name: "女" },
            ],
            label: { show: true, formatter: "{b}: {c}%", color: "#303133" },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
      this.charts.genderDistributionChart.setOption(option);
    },
  },
  mounted() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      this.$router.push("/login");
    }

    this.$nextTick(() => {
      this.updateCharts();

      // 响应窗口大小变化
      window.addEventListener("resize", () => {
        for (const key in this.charts) {
          if (this.charts[key]) {
            this.charts[key].resize();
          }
        }
      });
    });
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
  },
  beforeUnmount() {
    window.removeEventListener("resize", () => {});
    for (const key in this.charts) {
      if (this.charts[key]) {
        this.charts[key].dispose();
      }
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
};
</script>

<style lang="scss" scoped>
// --- 颜色变量 (Color Variables) ---
$primary-color: #409eff; // 主色 - 蓝色
$success-color: #67c23a; // 成功色 - 绿色
$warning-color: #e6a23c; // 警告色 - 黄色
$danger-color: #f56c6c; // 危险色 - 红色
$background-color: #f0f2f5; // 页面背景 - 浅灰色
$card-bg-color: #ffffff; // 卡片背景色
$text-color-primary: #303133;
$text-color-secondary: #909399;

.analytics-container {
  padding: 20px;
  background-color: $background-color;
  min-height: calc(100vh - 50px);
}

// --- 头部样式 (深色背景，专业感) ---
.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  margin-bottom: 20px;
  // 使用专业渐变色
  background-image: linear-gradient(to right, #3498db, #2c3e50);
  color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  .page-title {
    font-size: 26px; /* 标题略微放大 */
    font-weight: 700;
    margin: 0;
  }

  .clock {
    font-size: 18px;
    font-weight: 500;
    color: #ecf0f1;
  }
}

// --- 通用卡片和图表容器样式 ---
.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  background-color: $card-bg-color; /* 确保卡片是白色背景 */

  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
    background-color: #f9f9f9;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-color-primary;
    margin: 0;
    border-left: 4px solid $primary-color; /* 强调标题 */
    padding-left: 10px;
  }

  .chart-container {
    height: 350px; /* 统一图表高度 */
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
  }

  /* 特殊：为趋势图设置更高的高度以最大化显示效果 */
  .trend-chart-large {
    height: 450px;
  }

  .loading-wrapper {
    padding: 20px;
  }
}

// --- 异常病例表格样式 ---
.anomaly-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.08);

  .anomaly-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .anomaly-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    i {
      color: $text-color-secondary;
      cursor: pointer;
    }
  }

  :deep(.el-table) {
    .el-progress {
      margin: 5px 0;
    }
    // 表格内容行样式 (可选)
    .el-table__body tr.el-table__row:hover > td {
      background-color: #ecf5ff !important;
    }
  }
}
</style>
