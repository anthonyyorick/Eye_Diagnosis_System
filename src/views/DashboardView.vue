<template>
  <app-layout active-menu="/dashboard">
    <div class="dashboard-container">
      <!-- 顶部区域 -->
      <div class="hero-section">
        <div class="hero-bg"></div>
        <div class="content-wrapper">
          <h1 class="main-title">慧眼识疾</h1>
          <p class="subtitle">
            为您提供全方位的支持与指导，助力提升诊疗效率与准确性
          </p>
          <el-button
            type="primary"
            class="start-button"
            @click="navigateTo('/diagnosis')"
            >立即开始</el-button
          >

          <div class="date-display">
            <div class="date">{{ currentDate }}</div>
            <div class="weekday">{{ currentWeekday }}</div>
          </div>
        </div>
      </div>
      <div class="top-section">
        <h2 class="section-title">数据概览</h2>
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="12" :sm="12" :md="6" :lg="6">
            <el-card class="stat-card" style="background-color: #fff">
              <div class="stat-content">
                <div class="stat-left">
                  <div class="stat-value">{{ stats.todayDiagnosis }}</div>
                  <div class="stat-trend">
                    <span :class="stats.diagnosisTrend > 0 ? 'up' : 'down'">
                      {{ stats.diagnosisTrend > 0 ? "+" : ""
                      }}{{ stats.diagnosisTrend }}% 较昨日
                    </span>
                  </div>
                  <div class="stat-title">今日诊断次数</div>
                </div>
                <div class="stat-chart" ref="todayDiagnosisChart"></div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6" :lg="6">
            <el-card class="stat-card" style="background-color: #fff">
              <div class="stat-content">
                <div class="stat-left">
                  <div class="stat-value">{{ stats.newPatients }}</div>
                  <div class="stat-trend">
                    <span :class="stats.newPatientsTrend > 0 ? 'up' : 'down'">
                      {{ stats.newPatientsTrend > 0 ? "+" : ""
                      }}{{ stats.newPatientsTrend }}% 较昨日
                    </span>
                  </div>
                  <div class="stat-title">今日新增患者</div>
                </div>
                <div class="stat-chart" ref="newPatientsChart"></div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6" :lg="6">
            <el-card class="stat-card" style="background-color: #fff">
              <div class="stat-content">
                <div class="stat-left">
                  <div class="stat-value">{{ stats.totalCases }}</div>
                  <div class="stat-trend">
                    <span class="up">+{{ stats.totalCasesTrend }}% 较上月</span>
                  </div>
                  <div class="stat-title">病例总数</div>
                </div>
                <div class="stat-chart" ref="totalCasesChart"></div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6" :lg="6">
            <el-card class="stat-card" style="background-color: #fff">
              <div class="stat-content">
                <div class="stat-left">
                  <div class="stat-value">{{ stats.totalDiagnosis }}</div>
                  <div class="stat-trend">
                    <span class="up"
                      >+{{ stats.totalDiagnosisTrend }}% 较上月</span
                    >
                  </div>
                  <div class="stat-title">累计诊断量</div>
                </div>
                <div class="stat-chart" ref="totalDiagnosisChart"></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 快速入口区域 -->
      <div class="quick-actions-section">
        <h2 class="section-title">快速入口</h2>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-card class="action-card" @click="navigateTo('/diagnosis')">
              <div class="action-image">
                <img
                  src="@/assets/images/personal-diagnosis.jpg"
                  alt="个人诊断"
                />
              </div>
              <div class="action-content">
                <div class="action-title">个人诊断</div>
                <div class="action-desc">
                  快速进行个人病症诊断，提供专业建议
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-card
              class="action-card"
              @click="navigateTo('/diagnosis?tab=batch')"
            >
              <div class="action-image">
                <img src="@/assets/images/batch-diagnosis.png" alt="批量诊断" />
              </div>
              <div class="action-content">
                <div class="action-title">批量诊断</div>
                <div class="action-desc">高效处理多个病例，提升诊断效率</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-card class="action-card" @click="navigateTo('/reports')">
              <div class="action-image">
                <img src="@/assets/images/history-records.jpg" alt="历史记录" />
              </div>
              <div class="action-content">
                <div class="action-title">历史记录</div>
                <div class="action-desc">查看往日诊断记录，跟踪诊疗进展</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-card class="action-card" @click="navigateTo('/diagnosis')">
              <div class="action-image">
                <img src="@/assets/images/case-management.jpg" alt="病例查询" />
              </div>
              <div class="action-content">
                <div class="action-title">病例查询</div>
                <div class="action-desc">快速查询患者病历与诊断结果</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 病例展示区域 -->
      <div class="cases-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="8">
            <h2 class="section-title">病例标签</h2>
            <el-card class="tag-cloud-card">
              <div v-if="loading" class="tag-cloud-loading">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="caseTags.length === 0" class="tag-cloud-empty">
                <el-empty
                  description="暂无病例标签数据"
                  :image-size="80"
                ></el-empty>
              </div>
              <div v-else class="tag-cloud">
                <el-tag
                  v-for="tag in caseTags"
                  :key="tag.name"
                  :type="tag.type"
                  effect="plain"
                  :style="{ fontSize: tag.size + 'px' }"
                  class="case-tag"
                >
                  {{ tag.name }} ({{ tag.count }})
                </el-tag>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="16">
            <h2 class="section-title">典型病例</h2>
            <el-row :gutter="20">
              <!-- 展示上面三个病例 -->
              <el-col
                :xs="24"
                :sm="12"
                :lg="8"
                v-for="(item, index) in typicalCases.slice(0, 3)"
                :key="index"
              >
                <div
                  class="timeline-report-item"
                  :class="getDiagnosisClass(item)"
                >
                  <div class="report-header">
                    <div class="report-id">ID: {{ item.id }}</div>
                    <div class="report-time">{{ item.time }}</div>
                  </div>
                  <div class="report-diagnosis">{{ item.diagnosis }}</div>
                  <div class="report-tags">
                    <el-tag size="small" :type="getTagType(item.leftDiagnosis)">
                      左眼: {{ item.leftDiagnosis || "未知" }}
                    </el-tag>
                    <el-tag
                      size="small"
                      :type="getTagType(item.rightDiagnosis)"
                    >
                      右眼: {{ item.rightDiagnosis || "未知" }}
                    </el-tag>
                  </div>
                </div>
              </el-col>
            </el-row>

            <!-- 展示下面三个病例 -->
            <el-row :gutter="20">
              <el-col
                :xs="24"
                :sm="12"
                :lg="8"
                v-for="(item, index) in typicalCases.slice(3, 6)"
                :key="index + 3"
              >
                <div
                  class="timeline-report-item"
                  :class="getDiagnosisClass(item)"
                >
                  <div class="report-header">
                    <div class="report-id">ID: {{ item.id }}</div>
                    <div class="report-time">{{ item.time }}</div>
                  </div>
                  <div class="report-diagnosis">{{ item.diagnosis }}</div>
                  <div class="report-tags">
                    <el-tag size="small" :type="getTagType(item.leftDiagnosis)">
                      左眼: {{ item.leftDiagnosis || "未知" }}
                    </el-tag>
                    <el-tag
                      size="small"
                      :type="getTagType(item.rightDiagnosis)"
                    >
                      右眼: {{ item.rightDiagnosis || "未知" }}
                    </el-tag>
                  </div>
                </div>
              </el-col>
            </el-row>

            <!-- 显示无数据提示 -->
            <div v-if="typicalCases.length === 0" class="no-data-message">
              <el-empty description="暂无诊断记录" :image-size="100"></el-empty>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 资源中心 -->
      <div class="resources-section">
        <h2 class="section-title">资源中心</h2>
        <el-row :gutter="20">
          <!-- 合规文档下载中心 -->
          <el-col :xs="24" :sm="12">
            <el-card class="resource-card">
              <template #header>
                <div class="resource-header">
                  <span class="resource-title">合规文档下载中心</span>
                  <el-button
                    type="text"
                    class="view-all-btn"
                    @click="viewAllResources('compliance')"
                  >
                    查看全部
                  </el-button>
                </div>
              </template>
              <div class="resource-list">
                <div
                  v-for="(doc, index) in complianceDocs"
                  :key="index"
                  class="resource-item"
                >
                  <div class="resource-info">
                    <div class="doc-title">{{ doc.title }}</div>
                    <div class="doc-desc">{{ doc.description }}</div>
                  </div>
                  <el-button
                    class="action-btn"
                    type="primary"
                    size="small"
                    :icon="
                      doc.fileType === 'web'
                        ? 'el-icon-view'
                        : 'el-icon-download'
                    "
                    @click="openResource(doc.url, doc.fileType)"
                  >
                    {{
                      doc.fileType === "web" ? "查看" : "下载"
                    }}&nbsp;&nbsp;&nbsp;&nbsp;
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 医学参考文献库 -->
          <el-col :xs="24" :sm="12">
            <el-card class="resource-card">
              <template #header>
                <div class="resource-header">
                  <span class="resource-title">医学参考文献库</span>
                  <el-button
                    type="text"
                    class="view-all-btn"
                    @click="viewAllResources('references')"
                  >
                    查看全部
                  </el-button>
                </div>
              </template>
              <div class="resource-list">
                <div
                  v-for="(ref, index) in references"
                  :key="index"
                  class="resource-item"
                >
                  <div class="resource-info">
                    <div class="doc-title">{{ ref.title }}</div>
                    <div class="doc-desc">
                      {{ ref.authors }} - {{ ref.journal }}
                    </div>
                  </div>
                  <el-button
                    class="action-btn"
                    type="primary"
                    size="small"
                    :icon="
                      ref.fileType === 'web'
                        ? 'el-icon-view'
                        : 'el-icon-download'
                    "
                    @click="openResource(ref.url, ref.fileType)"
                  >
                    查看&nbsp;&nbsp;&nbsp;&nbsp;
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/components/AppLayout.vue";
import request from "@/utils/axios";

export default {
  name: "DashboardView",
  components: {
    AppLayout,
  },
  data() {
    return {
      loading: false, // 添加loading状态
      stats: {
        todayDiagnosis: 0,
        diagnosisTrend: 0,
        totalDiagnosis: 0,
        totalDiagnosisTrend: 0,
        totalCases: 0,
        totalCasesTrend: 0,
        newPatients: 0,
        newPatientsTrend: 0,
        diagnosisChartData: [
          30, 40, 35, 50, 49, 60, 70, 91, 125, 160, 180, 210, 220, 182, 191,
          234, 290, 330, 310, 286,
        ],
        totalDiagnosisChartData: [
          1000, 1200, 1500, 2000, 3000, 3500, 4000, 5000, 6000, 7000, 8000,
          9000, 10000, 11000, 12000, 13000, 14000, 15000, 15500, 15769,
        ],
        totalCasesChartData: [
          800, 1000, 1500, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 14000,
          16000, 18000, 20000, 22000, 24000, 26000, 27000, 28000, 28456,
        ],
        newPatientsChartData: [
          20, 32, 41, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160,
          170, 180, 190, 200, 342,
        ],
      },
      caseTags: [], // 从API获取的疾病统计数据
      typicalCases: [], // Replace hardcoded data with empty array to be filled from API
      recentDiagnosisRecords: [], // Add a new property to store the records
      complianceDocs: [
        {
          title: "中华人民共和国基本医疗卫生与健康促进法",
          description:
            "2019年12月28日第十三届全国人民代表大会常务委员会第十五次会议通过",
          url: "http://www.gov.cn/xinwen/2019-12/29/content_5464861.htm",
          fileType: "web",
        },
        {
          title: "医疗机构病历管理规定",
          description: "国家卫生健康委员会令第7号，涵盖电子病历的管理要求",
          url: "http://www.nhc.gov.cn/fzs/s3576/201711/7de1204473fa482d8aef4b153bc185e7.shtml",
          fileType: "web",
        },
        {
          title: "医疗质量管理办法",
          description: "国家卫生健康委员会令第10号，保障医疗质量和患者安全",
          url: "http://www.nhc.gov.cn/fzs/s3576/201610/ae125f28eef24ca7aac57c8ec530c6d2.shtml",
          fileType: "web",
        },
      ],
      references: [
        {
          title: "人工智能辅助糖尿病视网膜病变筛查: 多中心验证研究",
          authors: "Li Z, Keel S, Liu C, et al.",
          journal: "JAMA Ophthalmology, 2021; 139(4): 448-456",
          url: "https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2775875",
          doi: "10.1001/jamaophthalmol.2020.7033",
          fileType: "pdf",
        },
        {
          title: "基于深度学习的眼底图像糖尿病视网膜病变分级",
          authors: "Gulshan V, Peng L, Coram M, et al.",
          journal: "JAMA, 2016; 316(22): 2402-2410",
          url: "https://jamanetwork.com/journals/jama/fullarticle/2588763",
          doi: "10.1001/jama.2016.17216",
          fileType: "web",
        },
        {
          title: "人工智能在眼科疾病诊断中的应用：系统性综述",
          authors: "Ting DSW, Pasquale LR, Peng L, et al.",
          journal: "British Journal of Ophthalmology, 2019; 103: 167-175",
          url: "https://bjo.bmj.com/content/103/2/167",
          doi: "10.1136/bjophthalmol-2018-313173",
          fileType: "web",
        },
      ],
    };
  },
  methods: {
    // 获取仪表盘数据
    async fetchDashboardData() {
      try {
        this.loading = true;

        // 获取当前登录医生的 ID
        const doctorId = localStorage.getItem("doctorId") || 1;

        // 调用接口获取数据
        const response = await request({
          url: "/main/baseData",
          method: "get",
        });

        if (response.code === 200 || response.code === 1) {
          const data = response.data;

          // 更新统计数据
          this.stats.todayDiagnosis = data.todayRecord || 0;
          this.stats.diagnosisTrend =
            parseFloat((data.dayGrowthRate * 100).toFixed(1)) || 0;
          this.stats.totalDiagnosis = data.allRecode || 0;
          this.stats.totalDiagnosisTrend =
            parseFloat((data.monthGrowthRate * 100).toFixed(1)) || 0;
          this.stats.totalCases = data.caseNum || 0;
          this.stats.totalCasesTrend =
            parseFloat((data.caseGrowthRate * 100).toFixed(1)) || 0;
          this.stats.newPatients = data.todayPatient || 0;
          this.stats.newPatientsTrend =
            parseFloat((data.patientGrowthRate * 100).toFixed(1)) || 0;
        } else {
          this.$message.error(response.msg || "获取数据失败");
        }
      } catch (error) {
        console.error("获取仪表盘数据失败:", error);
        this.$message.error("获取数据失败，请刷新重试");
      } finally {
        this.loading = false;

        // 刷新图表
        this.$nextTick(() => {
          this.initCharts();
        });
      }
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      // Return date with time in format: YYYY-MM-DD HH:MM
      return `${year}-${month}-${day}`;
    },
    formatDay(day) {
      return day ? day.split("-")[2] : "";
    },
    navigateTo(path) {
      this.$router.push(path);
    },
    initCharts() {
      this.initTrendChart(
        "todayDiagnosisChart",
        this.stats.diagnosisChartData,
        "#409EFF"
      );
      this.initTrendChart(
        "totalDiagnosisChart",
        this.stats.totalDiagnosisChartData,
        "#409EFF"
      );
      this.initTrendChart(
        "totalCasesChart",
        this.stats.totalCasesChartData,
        "#409EFF"
      );
      this.initTrendChart(
        "newPatientsChart",
        this.stats.newPatientsChartData,
        this.stats.newPatientsTrend > 0 ? "#67C23A" : "#F56C6C"
      );
    },
    initTrendChart(refName, data, color) {
      const chartDom = this.$refs[refName];
      const myChart = this.$echarts.init(chartDom);

      const option = {
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
        xAxis: {
          type: "category",
          show: false,
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
          show: false,
        },
        series: [
          {
            data: data,
            type: "line",
            smooth: true,
            symbol: "none",
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: color, // 渐变起始颜色
                  },
                  {
                    offset: 1,
                    color: "rgba(255, 255, 255, 0.1)", // 渐变结束颜色
                  },
                ],
              },
            },
            lineStyle: {
              color: color,
            },
          },
        ],
      };

      myChart.setOption(option);

      // 保存图表实例以便在窗口大小变化时重新渲染
      if (!this.charts) {
        this.charts = {};
      }
      this.charts[refName] = myChart;
    },
    handleResize() {
      if (this.charts) {
        Object.values(this.charts).forEach((chart) => {
          chart.resize();
        });
      }
    },
    isToday(day) {
      const today = new Date().toISOString().split("T")[0];
      return day === today;
    },
    openResource(url, fileType) {
      if (fileType === "web") {
        // 打开新窗口访问URL
        window.open(url, "_blank");
      } else if (fileType === "pdf") {
        // 对于PDF文件，可以选择下载或在新窗口中查看
        this.$confirm("您希望如何打开此文档?", "打开文档", {
          confirmButtonText: "在线查看",
          cancelButtonText: "下载文件",
          type: "info",
        })
          .then(() => {
            // 在线查看
            window.open(url, "_blank");
          })
          .catch(() => {
            // 下载文件
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
      }
    },
    viewAllResources(type) {
      // 显示全部资源对话框
      const resources =
        type === "compliance" ? this.complianceDocs : this.references;
      const title =
        type === "compliance" ? "合规文档下载中心" : "医学参考文献库";

      this.$msgbox({
        title: title,
        message: this.$createElement("div", { class: "full-resource-list" }, [
          ...resources.map((item) => {
            return this.$createElement(
              "div",
              { class: "resource-item-dialog" },
              [
                this.$createElement("div", { class: "resource-info-dialog" }, [
                  this.$createElement("h3", {}, item.title),
                  this.$createElement(
                    "p",
                    {},
                    type === "compliance"
                      ? item.description
                      : `${item.authors} - ${item.journal}`
                  ),
                ]),
                this.$createElement(
                  "el-button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                      icon:
                        item.fileType === "web"
                          ? "el-icon-view"
                          : "el-icon-download",
                    },
                    on: {
                      click: () => {
                        this.openResource(item.url, item.fileType);
                        this.$msgbox.close();
                      },
                    },
                  },
                  [item.fileType === "web" ? "查看" : "下载"]
                ),
              ]
            );
          }),
        ]),
        showCancelButton: false,
        confirmButtonText: "关闭",
      });
    },
    // 获取最近诊断记录
    async fetchRecentDiagnosis() {
      try {
        const response = await request({
          method: "get",
          url: "/diagnosisrecord/show/page",
          params: {
            page: 1,
            pageSize: 6, // Get the top 6 records
          },
        });

        if (response.code === 1) {
          // Format the records
          this.recentDiagnosisRecords = this.formatRecentDiagnosis(
            response.data.records || []
          );
          // Update the typical cases
          this.updateTypicalCases();
        } else {
          console.error("获取诊断记录失败:", response.msg);
        }
      } catch (error) {
        console.error("获取诊断记录出错:", error);
      }
    },

    // 格式化最近诊断记录
    formatRecentDiagnosis(records) {
      return records.map((record) => {
        // Handle different API data structures
        return {
          id: record.patientId || record.id,
          diagnosisTime: record.diagnosisTime,
          leftResult:
            record.leftResult || (record.leftEye && record.leftEye.diagnosis),
          rightResult:
            record.rightResult ||
            (record.rightEye && record.rightEye.diagnosis),
          finalDiagnosis: record.finalResult || record.finalDiagnosis,
          leftConfidence:
            record.leftConfidence ||
            (record.leftEye && record.leftEye.confidence),
          rightConfidence:
            record.rightConfidence ||
            (record.rightEye && record.rightEye.confidence),
        };
      });
    },

    // 更新典型病例数据
    updateTypicalCases() {
      this.typicalCases = this.recentDiagnosisRecords.map((record) => {
        // Get appropriate status type based on diagnosis
        const statusType = this.getDiagnosisStatusType(record);

        // Format the diagnosis name to be more readable
        const diagnosisName = this.formatDiagnosisName(record.finalDiagnosis);

        // Get the left and right eye diagnoses
        const leftDiagnosis =
          record.leftResult || (record.leftEye && record.leftEye.diagnosis);
        const rightDiagnosis =
          record.rightResult || (record.rightEye && record.rightEye.diagnosis);

        // Format diagnosis date and time separately
        const formattedDateTime = this.formatDate(record.diagnosisTime);
        const formattedTime = this.formatTimeOnly(record.diagnosisTime);

        return {
          id: record.id,
          diagnosis: diagnosisName,
          // time: formattedTime,
          time: formattedDateTime,
          fullDate: formattedDateTime,
          status: this.getDiagnosisStatus(record),
          statusType: statusType,
          leftDiagnosis: leftDiagnosis || "未知",
          rightDiagnosis: rightDiagnosis || "未知",
        };
      });
    },

    // Format just the time portion (HH:MM:SS)
    formatTimeOnly(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${hours}:${minutes}:${seconds}`;
    },

    // 格式化诊断名称，使其更容易阅读
    formatDiagnosisName(diagnosis) {
      if (!diagnosis) return "未知";

      // 如果是左右眼不同诊断的情况，分开显示
      if (diagnosis.includes(",")) {
        const parts = diagnosis.split(",");
        if (parts.length === 2) {
          // 保留左右眼关键词，去除重复疾病名
          return diagnosis;
        }
      }

      // 去除左右眼前缀，只保留疾病名称
      let formattedName = diagnosis;
      formattedName = formattedName.replace("左眼", "").replace("右眼", "");

      return formattedName;
    },

    // 根据诊断结果判断状态类型
    getDiagnosisStatusType(record) {
      // This logic should match your ReportsView getTagType method
      const diagnosis = record.finalDiagnosis || "";

      if (
        diagnosis.includes("AMD") ||
        diagnosis.includes("糖尿病") ||
        diagnosis.includes("青光眼")
      ) {
        return "danger";
      } else if (diagnosis.includes("白内障") || diagnosis.includes("高血压")) {
        return "warning";
      } else if (diagnosis.includes("近视") || diagnosis.includes("其他")) {
        return "info";
      } else if (diagnosis.includes("正常")) {
        return "success";
      }

      return "info"; // Default
    },

    // 获取诊断状态描述
    getDiagnosisStatus(record) {
      const diagnosis = record.finalDiagnosis || "";

      if (
        diagnosis.includes("AMD") ||
        diagnosis.includes("糖尿病") ||
        diagnosis.includes("青光眼")
      ) {
        return "需治疗";
      } else if (diagnosis.includes("白内障") || diagnosis.includes("高血压")) {
        return "待复查";
      } else if (diagnosis.includes("近视") || diagnosis.includes("其他")) {
        return "已确诊";
      } else if (diagnosis.includes("正常")) {
        return "正常";
      }

      return "已确诊"; // Default
    },

    // 根据诊断结果获取对应的图片
    getDiagnosisImageUrl(diagnosis) {
      // This is a simplified example - in production you'd use real fundus images from your API
      if (diagnosis && diagnosis.includes("糖尿病")) {
        return "https://pic3.zhimg.com/100/v2-32577c3202d56d08d1a897d402b000fe_qhd.jpg";
      } else if (diagnosis && diagnosis.includes("青光眼")) {
        return "https://pic4.zhimg.com/100/v2-113776afcd6e82ed437c1418a858de73_r.jpg";
      } else if (diagnosis && diagnosis.includes("AMD")) {
        return "https://img2.baidu.com/it/u=3075558706,2434588827&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=333";
      } else if (diagnosis && diagnosis.includes("白内障")) {
        return "https://img1.baidu.com/it/u=2502733541,2130622475&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=333";
      } else if (diagnosis && diagnosis.includes("高血压")) {
        return "https://img2.baidu.com/it/u=2080783044,2428666521&fm=253&fmt=auto&app=120&f=JPEG?w=654&h=500";
      } else if (diagnosis && diagnosis.includes("正常")) {
        return "https://picx.zhimg.com/100/v2-f2c50c067ae00c9b43f986154bb67571_qhd.jpg";
      }

      // Default image
      return "https://img0.baidu.com/it/u=3126297490,3186383230&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=333";
    },
    getDiagnosisClass(item) {
      // Get diagnosis type for styling based on the diagnosis content
      const diagnosis = item.diagnosis || "";

      if (
        diagnosis.includes("AMD") ||
        diagnosis.includes("糖尿病") ||
        diagnosis.includes("青光眼")
      ) {
        return "diagnosis-severe";
      } else if (diagnosis.includes("白内障") || diagnosis.includes("高血压")) {
        return "diagnosis-moderate";
      } else if (diagnosis.includes("近视") || diagnosis.includes("其他")) {
        return "diagnosis-mild";
      } else if (diagnosis.includes("正常")) {
        return "diagnosis-normal";
      }

      // Fallback to using statusType
      const statusType = item.statusType;
      if (statusType === "danger") return "diagnosis-severe";
      if (statusType === "warning") return "diagnosis-moderate";
      if (statusType === "info") return "diagnosis-mild";
      if (statusType === "success") return "diagnosis-normal";

      return "";
    },
    getTagType(diagnosis) {
      // 根据诊断结果返回不同的标签类型，与ReportsView保持一致
      if (!diagnosis) return "";

      if (diagnosis.includes("正常")) {
        return "success";
      } else if (
        diagnosis.includes("糖尿病") ||
        diagnosis.includes("青光眼") ||
        diagnosis.includes("AMD")
      ) {
        return "danger";
      } else if (diagnosis.includes("白内障") || diagnosis.includes("高血压")) {
        return "warning";
      } else if (diagnosis.includes("近视") || diagnosis.includes("其他")) {
        return "info";
      }

      return "";
    },
    formatTimeDisplay(timeString) {
      if (!timeString) return "";

      // Handle the case where we already have the formatted time
      if (timeString.includes(" ")) {
        const parts = timeString.split(" ");
        if (parts.length === 2) {
          const timePart = parts[1];
          if (timePart.split(":").length >= 2) {
            return timePart.substring(0, 5); // Return just the HH:MM part
          }
        }
      }

      // Default case - return the original
      return timeString;
    },
    // 获取病例标签数据
    async fetchDiseaseStatistics() {
      try {
        this.loading = true;

        // 调用接口获取疾病数量统计
        const response = await request({
          url: "/main/diagnosis/number",
          method: "get",
        });

        if (response.code === 1 || response.code === 200) {
          const data = response.data;

          // 将API返回的数据转换为标签格式
          this.caseTags = Object.entries(data).map(([disease, count]) => {
            // 根据疾病类型确定标签样式
            let type = "info";
            if (
              disease.includes("糖尿病") ||
              disease.includes("青光眼") ||
              disease.includes("AMD")
            ) {
              type = "danger";
            } else if (
              disease.includes("白内障") ||
              disease.includes("高血压")
            ) {
              type = "warning";
            } else if (disease.includes("正常")) {
              type = "success";
            }

            return {
              name: disease,
              count: count,
              size: 16,
              type: type,
            };
          });
        } else {
          console.error("获取疾病统计数据失败:", response.msg);
        }
      } catch (error) {
        console.error("获取疾病统计数据出错:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      this.$router.push("/login");
    }
    // 获取仪表盘数据
    this.fetchDashboardData();
    // 获取最近诊断记录
    this.fetchRecentDiagnosis();
    // 获取疾病统计数据
    this.fetchDiseaseStatistics();
    // 初始化图表
    this.$nextTick(() => {
      this.initCharts();

      // 添加窗口大小变化监听
      window.addEventListener("resize", this.handleResize);
    });
  },
  beforeUnmount() {
    // 移除窗口大小变化监听
    window.removeEventListener("resize", this.handleResize);

    // 销毁图表实例
    if (this.charts) {
      Object.values(this.charts).forEach((chart) => {
        chart.dispose();
      });
    }
  },
};
</script>

<script setup>
const currentDate = new Date().toLocaleDateString("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const currentWeekday = new Date().toLocaleDateString("zh-CN", {
  weekday: "long",
});
</script>

<style lang="scss" scoped>
$primary-color: #409eff; // 主色（蓝色）
$primary-light: #52aaff; // 主色稍亮
$success-color: #67c23a; // 增长色（绿色）
$danger-color: #f56c6c; // 风险色（红色）
$text-color-dark: #303133; // 主要文本
$text-color-light: #909399; // 次要文本
$background-main: #f7f9fb;
$card-bg: #ffffff;
/* 通用变量 */
:root {
  --primary-color: #409eff;
  --card-bg: #ffffff;
  --card-shadow: rgba(0, 0, 0, 0.1);
  --title-color: #303133;
  --subtitle-color: #606266;
  --section-title-color: #409eff;
  --button-border-radius: 4px;
  --card-border-radius: 8px;
  --padding-global: 20px;
}

/* 容器与布局 */
.dashboard-container {
  display: flex;
  flex-direction: column;
  /* gap: 40px; */
  padding: var(--padding-global);
}

.hero-section {
  position: relative;
  min-height: 400px;
  color: #fff;
  border-radius: var(--card-border-radius);
  overflow: hidden;
  display: flex;
  align-items: center;
}

.top-section {
  margin: 0 25px;
  /* margin-bottom: 30px; */
  background-color: opacity(1);
  padding: 0px;
  border-radius: 8px;
  /* box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);  */
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background: url("@/assets/images/batch-diagnosis.png") center/cover no-repeat; */
  background-image: url("https://ai-public.mastergo.com/ai/img_res/8628a8ef59cbf9b1d30dbdcf6dd9472d.jpg");
  filter: brightness(0.6);
  z-index: 1;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
}

.main-title {
  font-size: 48px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 20px;
  color: #f0f0f0;
  margin-bottom: 30px;
}

.start-button {
  font-size: 16px;
  padding: 12px 34px;
  border-radius: var(--button-border-radius);
}

.date-display {
  margin-top: 20px;
  font-size: 16px;
  color: #ddd;
}

.date-display .date {
  font-size: 24px;
  font-weight: bold;
}

.date-display .weekday {
  font-size: 18px;
}

/* 数据概览 &统计卡片*/
.stats-row {
  margin-top: 20px;
}

.stat-card {
  border-radius: var(--card-border-radius);
  box-shadow: 0 2px 8px var(--card-shadow);
  transition: transform 0.3s;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-left {
  display: flex;
  flex-direction: column;
}

.stat-chart {
  width: 150px;
  height: 75px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--title-color);
}

.stat-title {
  margin-top: 8px;
  font-size: 14px;
  color: var(--subtitle-color);
}

.stat-trend .up {
  color: #67c23a;
}

.stat-trend .down {
  color: #f56c6c;
}

.section-title {
  position: relative;
  padding-left: 13px;
  margin: 24px 0px;
}

.section-title1 {
  position: relative;
  padding-left: 13px;
  margin: 0px;
}

.cases-section {
  margin: 0 25px;
  /* margin-bottom: 30px; */
}

.section-title:before {
  content: "";
  background-color: #3796ec;
  width: 4px;
  height: 20px;
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: -8px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}

/* 快速入口卡片 */

.quick-actions-section {
  margin: 0 25px;
  /* margin-bottom: 20px; */
  padding: 0px;
}
.action-card {
  height: 100%;
  cursor: pointer;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: $primary-color;
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    padding: 15px;
  }

  .action-image {
    width: 50px;
    height: 50px;
    margin-right: 15px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  .action-content {
    flex-grow: 1;
  }

  .action-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-color-dark;
    margin-bottom: 4px;
  }

  .action-desc {
    font-size: 12px;
    color: $text-color-light;
  }
}

/* 病例 & 标签 &典型病例展示 */
/* 病例标签云样式 */
.tag-cloud-card {
  min-height: 200px;
  margin-bottom: 20px;
  border-radius: 8px;
  width: 25rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-cloud-loading,
.tag-cloud-empty {
  height: 100%;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.case-tag {
  margin: 5px;
  height: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 10px;
  font-size: 0.75rem;
}

.case-tag:hover {
  transform: scale(1.05);
}

/* 病例卡片样式 */
.case-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  padding: 0px;
}

.case-card:deep(.el-card__body) {
  padding: 0;
}

.case-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.case-image {
  height: 150px;
  overflow: hidden;
}

.case-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.case-info {
  padding: 15px;
}

.case-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
}

.case-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: #909399;
}

/* 资源中心 */
.resources-section {
  margin: 0 25px 25px;
}

:deep(.el-card__header) {
  padding: 10px 20px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #303133;
}

.resource-card {
  border-radius: 10px;
  overflow: hidden;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  padding: 0;
}

.view-all-btn {
  font-size: 13px;
  color: #409eff;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  border-radius: 6px;
  background: #fafafa;
  transition: background 0.2s;
}

.resource-item:hover {
  background: #f0f7ff;
}

.resource-info {
  flex: 1;
  margin-right: 10px;
}

.doc-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  color: #303133;
}

.doc-desc {
  font-size: 12px;
  color: #909399;
}

.action-btn {
  flex-shrink: 0;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .content-wrapper {
    padding: 30px;
  }
  .hero-section {
    min-height: 250px;
  }
  .action-image img {
    height: 140px;
  }
}
.timeline-report-item {
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  /* border-left: 4px solid #909399; */
  background-color: #fff;
  /* box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); */
  margin-bottom: 20px;
  height: 84px;
}

.timeline-report-item:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
/* 诊断严重程度样式 */
:deep(.timeline-report-item.diagnosis-severe) {
  background-color: rgba(255, 102, 102, 0.2);
  border: 1px solid #ff6666;
}

:deep(.timeline-report-item.diagnosis-moderate) {
  background-color: rgba(255, 178, 102, 0.2);
  border: 1px solid #ffb266;
}

:deep(.timeline-report-item.diagnosis-mild) {
  background-color: rgba(128, 178, 255, 0.2);
  border: 1px solid #80b2ff;
}

:deep(.timeline-report-item.diagnosis-normal) {
  background-color: rgba(102, 204, 102, 0.2);
  border: 1px solid #66cc66;
}
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.report-id {
  font-size: 14px;
  color: #909399;
  font-weight: bold;
}

.report-time {
  font-size: 13px;
  color: #909399;
}

.report-diagnosis {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}

.report-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .stats-row .el-col {
    margin-bottom: 20px;
  }
  .action-card {
    margin-bottom: 20px;
  }
  .action-image img {
    height: 120px;
  }

  .main-title {
    font-size: 34px;
  }
  .subtitle {
    font-size: 18px;
  }
}
</style>
