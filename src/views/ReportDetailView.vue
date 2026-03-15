<template>
  <app-layout active-menu="/reports">
    <div class="report-detail-container">
      <div class="report-header">
        <div class="back-button">
          <el-button icon="el-icon-arrow-left" @click="goBack"
            >返回&nbsp;&nbsp;&nbsp;&nbsp;</el-button
          >
        </div>
        <div>
          <h1 class="report-title">眼底图像眼疾智能识别系统诊断报告</h1>
        </div>
        <div class="report-actions">
          <el-button
            type="primary"
            icon="el-icon-download"
            @click="exportReport"
            >导出报告&nbsp;&nbsp;&nbsp;&nbsp;</el-button
          >
          <el-button type="success" icon="el-icon-printer" @click="printReport"
            >打印报告&nbsp;&nbsp;&nbsp;&nbsp;</el-button
          >
        </div>
      </div>

      <div class="report-content" ref="reportContent">
        <!-- 加载中状态 -->
        <div v-if="isLoading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>

        <!-- 报告区域 -->
        <div v-else class="a4-container">
          <div class="report-paper">
            <!-- 报告头部 -->
            <div class="report-paper-header">
              <div class="report-logo-section">
                <div class="report-logo">
                  <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
                </div>
                <div class="report-title-section">
                  <h1 class="report-main-title">眼科诊断报告单</h1>
                </div>
              </div>
              <div class="report-barcode-section">
                <div class="barcode-container">
                  <!-- 这里放置条形码，实际项目中可使用条形码库生成 -->
                  <div class="barcode-placeholder"></div>
                </div>
              </div>
            </div>

            <!-- 报告编号和日期 -->
            <div class="report-meta">
              <div class="report-id">报告编号：EYE{{ reportId }}</div>
              <div class="report-date">生成日期：{{ formattedDate }}</div>
            </div>

            <!-- 患者信息 -->
            <div class="patient-info-section">
              <h2 class="section-subtitle">患者信息</h2>
              <div class="patient-info-grid">
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">患者ID：</span>
                    <span class="info-value">P{{ reportId }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">姓名：</span>
                    <span class="info-value">{{ patientInfo.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">性别：</span>
                    <span class="info-value">{{
                      patientInfo.gender === "male" ? "男" : "女"
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">年龄：</span>
                    <span class="info-value">{{ patientInfo.age }}岁</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">联系方式：</span>
                    <span class="info-value">{{
                      formatTime(report.diagnosisTime || report.time)
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">诊断日期：</span>
                    <span class="info-value">{{
                      formatTime(report.diagnosisTime || report.time)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 眼底图片 -->
            <div class="eye-images-section">
              <h2 class="section-subtitle">眼底图片</h2>
              <div class="eye-images-grid">
                <div class="eye-image-container">
                  <img
                    v-if="report.leftEyeImage"
                    :src="report.leftEyeImage"
                    alt="左眼眼底图像"
                    class="eye-image"
                  />
                  <div v-else class="no-image-placeholder">暂无左眼图像</div>
                  <div class="eye-label-below">左眼眼底图像</div>
                </div>
                <div class="eye-image-container">
                  <img
                    v-if="report.rightEyeImage"
                    :src="report.rightEyeImage"
                    alt="右眼眼底图像"
                    class="eye-image"
                  />
                  <div v-else class="no-image-placeholder">暂无右眼图像</div>
                  <div class="eye-label-below">右眼眼底图像</div>
                </div>
              </div>
            </div>

            <!-- 诊断结果 -->
            <div class="diagnosis-section">
              <h2 class="section-subtitle">诊断结果</h2>
              <div class="diagnosis-grid">
                <div class="diagnosis-item">
                  <h3 class="diagnosis-title">左眼诊断：</h3>
                  <el-table
                    :data="getTopFiveDiseases(report.leftEye.probabilities)"
                    :cell-class-name="tableCellClassName"
                    :row-style="{ height: '20px' }"
                    :cell-style="{ padding: '0px' }"
                    class="three-line-table"
                    :stripe="false"
                    :border="false"
                  >
                    <el-table-column
                      prop="disease"
                      label="疾病名称"
                      width="180"
                      align="center"
                    ></el-table-column>
                    <el-table-column
                      prop="probability"
                      label="概率"
                      align="center"
                    >
                      <template #default="scope">
                        {{ scope.row.probability }}%
                      </template>
                    </el-table-column>
                  </el-table>
                  <div class="diagnosis-conclusion">
                    <span class="conclusion-label">诊断结论：</span>
                    <span class="conclusion-value">{{
                      report.leftEye.diagnosis
                    }}</span>
                  </div>
                </div>
                <div class="diagnosis-item">
                  <h3 class="diagnosis-title">右眼诊断：</h3>
                  <el-table
                    :data="getTopFiveDiseases(report.rightEye.probabilities)"
                    :cell-class-name="tableCellClassName"
                    :row-style="{ height: '20px' }"
                    :cell-style="{ padding: '0px' }"
                    class="three-line-table"
                    :stripe="false"
                    :border="false"
                  >
                    <el-table-column
                      prop="disease"
                      label="疾病名称"
                      width="180"
                      align="center"
                      style="font-weight: bold"
                    ></el-table-column>
                    <el-table-column
                      prop="probability"
                      label="概率"
                      align="center"
                    >
                      <template #default="scope">
                        {{ scope.row.probability }}%
                      </template>
                    </el-table-column>
                  </el-table>
                  <div class="diagnosis-conclusion">
                    <span class="conclusion-label">诊断结论：</span>
                    <span class="conclusion-value">{{
                      report.rightEye.diagnosis
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- 综合诊断 -->
              <div class="final-diagnosis">
                <h3 class="diagnosis-title">综合诊断结果：</h3>
                <div class="final-diagnosis-value">
                  {{ report.finalDiagnosis }}
                </div>
              </div>
            </div>

            <!-- 治疗建议 -->
            <div class="treatment-section">
              <h2 class="section-subtitle">建议治疗方案</h2>
              <div class="treatment-content">
                <!-- <div class="treatment-source">
                  <el-tag size="small" type="info">自动选择</el-tag>
                  <span class="treatment-source-text"
                    >根据诊断结果自动选择的标准治疗方案</span
                  >
                </div> -->
                <el-input
                  type="textarea"
                  v-model="treatmentPlan"
                  :rows="4"
                  placeholder="请输入建议治疗方案..."
                  :disabled="!isEditing"
                ></el-input>
                <div class="treatment-hint" v-if="!isEditing">
                  <p>
                    系统根据诊断结果自动选择的治疗方案，根据眼科疾病类型提供标准建议。请点击"编辑方案"按钮根据患者实际情况调整。
                  </p>
                </div>
                <div class="treatment-actions" v-if="isEditing">
                  <el-button
                    type="primary"
                    size="small"
                    @click="saveTreatmentPlan"
                    >保存方案</el-button
                  >
                  <el-button size="small" @click="cancelEdit">取消</el-button>
                </div>
                <div class="treatment-actions" v-else>
                  <el-button type="primary" size="small" @click="startEdit"
                    >编辑方案</el-button
                  >
                </div>
              </div>
            </div>

            <!-- 医生签名 -->
            <div class="doctor-signature">
              <div class="signature-text">
                <div>审核医生：________</div>
                <div>日期：________</div>
              </div>
            </div>

            <!-- 页脚 -->
            <!-- <div class="report-footer">
              <div>本报告仅供医疗参考，最终诊断请以医生诊断为准</div>
              <div>报告编号：EYE{{ reportId }}</div>
            </div> -->
          </div>
        </div>
      </div>

      <!-- 编辑模式下的额外备注输入 -->
      <!-- <el-card class="notes-card" v-if="!isPrinting">
        <template #header>
          <div class="notes-header">
            <h2>医生备注（不会出现在打印报告中）</h2>
          </div>
        </template>
        <div class="notes-content">
          <el-input
            type="textarea"
            v-model="doctorNotes"
            :rows="4"
            placeholder="请输入医生备注..."
          ></el-input>
          <div class="notes-actions">
            <el-button type="primary" @click="saveNotes">保存备注</el-button>
          </div>
        </div>
      </el-card> -->
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/components/AppLayout.vue";
import request from "@/utils/axios"; // 导入配置好的axios实例

export default {
  name: "ReportDetailView",
  components: {
    AppLayout,
  },
  data() {
    return {
      reportId: null,
      doctorNotes: "",
      treatmentPlan: "",
      isEditing: false,
      isPrinting: false,
      diseaseCategories: [
        "糖尿病",
        "青光眼",
        "白内障",
        "AMD",
        "高血压",
        "近视",
        "其他疾病/异常",
        "正常",
      ],
      report: {
        id: "",
        diagnosisTime: "",
        time: "",
        doctor: "",
        leftEyeImage: "",
        rightEyeImage: "",
        leftEye: {
          diagnosis: "",
          confidence: 0,
          probabilities: [],
        },
        rightEye: {
          diagnosis: "",
          confidence: 0,
          probabilities: [],
        },
        finalDiagnosis: "",
        suggestion: "",
      },
      patientInfo: {
        name: "",
        gender: "",
        age: 0,
      },
      isLoading: true,
      appliedScale: 1,
    };
  },
  computed: {
    formattedDate() {
      const now = new Date();
      return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    // 打印报告
    printReport() {
      this.isPrinting = true;
      this.$nextTick(() => {
        // 准备打印环境
        const originalTitle = document.title;
        document.title = `眼底图像眼疾智能识别系统诊断报告-患者${
          this.reportId
        }-${new Date().toLocaleDateString()}`;

        // 获取报告元素
        const reportPaper = document.querySelector(".report-paper");
        if (!reportPaper) {
          this.$message.error("无法找到报告内容");
          this.isPrinting = false;
          return;
        }

        // 明确隐藏顶部导航和底部版权信息
        const headerElements = document.querySelectorAll(
          "header, .app-header, .el-header, nav, .nav-menu"
        );
        const footerElements = document.querySelectorAll(
          "footer, .app-footer, .el-footer, .footer, .copyright"
        );

        headerElements.forEach((el) => {
          if (el) el.style.display = "none";
        });

        footerElements.forEach((el) => {
          if (el) el.style.display = "none";
        });

        // 调整表格格式以确保打印效果
        const tables = document.querySelectorAll(".three-line-table");
        tables.forEach((table) => {
          // 添加特殊属性以便CSS识别
          table.setAttribute("data-print-table", "true");
        });

        // 隐藏不需要的元素
        const actionsElements = document.querySelectorAll(
          ".treatment-actions, .treatment-hint, .back-button, .report-actions"
        );
        actionsElements.forEach((el) => {
          if (el) el.style.display = "none";
        });

        // 确保文本框显示为纯文本
        const textareas = document.querySelectorAll(".el-textarea__inner");
        textareas.forEach((textarea) => {
          textarea.style.border = "none";
          textarea.style.backgroundColor = "transparent";
          textarea.style.resize = "none";
        });

        // 执行打印
        setTimeout(() => {
          window.print();
          document.title = originalTitle;
          this.isPrinting = false;
        }, 500);
      });
    },

    // 导出报告为PDF
    exportReport() {
      this.isPrinting = true;
      this.$nextTick(() => {
        // 准备打印环境
        const originalTitle = document.title;
        document.title = `眼底图像眼疾智能识别系统诊断报告-患者${
          this.reportId
        }-${new Date().toLocaleDateString()}`;

        // 获取报告元素
        const reportPaper = document.querySelector(".report-paper");
        if (!reportPaper) {
          this.$message.error("无法找到报告内容");
          this.isPrinting = false;
          return;
        }

        // 明确隐藏顶部导航和底部版权信息
        const headerElements = document.querySelectorAll(
          "header, .app-header, .el-header, nav, .nav-menu"
        );
        const footerElements = document.querySelectorAll(
          "footer, .app-footer, .el-footer, .footer, .copyright"
        );

        headerElements.forEach((el) => {
          if (el) el.style.display = "none";
        });

        footerElements.forEach((el) => {
          if (el) el.style.display = "none";
        });

        // 调整表格格式以确保打印效果
        const tables = document.querySelectorAll(".three-line-table");
        tables.forEach((table) => {
          // 添加特殊属性以便CSS识别
          table.setAttribute("data-print-table", "true");
        });

        // 隐藏不需要的元素
        const actionsElements = document.querySelectorAll(
          ".treatment-actions, .treatment-hint, .back-button, .report-actions"
        );
        actionsElements.forEach((el) => {
          if (el) el.style.display = "none";
        });

        // 确保文本框显示为纯文本
        const textareas = document.querySelectorAll(".el-textarea__inner");
        textareas.forEach((textarea) => {
          textarea.style.border = "none";
          textarea.style.backgroundColor = "transparent";
          textarea.style.resize = "none";
        });

        // 执行打印
        setTimeout(() => {
          window.print();
          document.title = originalTitle;
          this.$message.success("报告已导出为PDF文件");
          this.isPrinting = false;
        }, 500);
      });
    },

    startEdit() {
      this.isEditing = true;
      // 如果还没有治疗方案，自动生成
      if (!this.treatmentPlan || this.treatmentPlan.trim() === "") {
        this.treatmentPlan = this.generateSuggestionFromDiagnosis(
          this.report.leftEye.diagnosis,
          this.report.rightEye.diagnosis
        );
      }
    },

    cancelEdit() {
      this.isEditing = false;
    },

    saveTreatmentPlan() {
      // 如果没有修改，直接返回
      if (!this.treatmentPlan) {
        this.$message.warning("请先填写治疗方案");
        return;
      }

      // 显示保存中状态
      const loading = this.$loading({
        lock: true,
        text: "保存中...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });

      // 保存治疗方案到localStorage
      try {
        const treatmentPlans = JSON.parse(
          localStorage.getItem("treatmentPlans") || "{}"
        );
        treatmentPlans[this.reportId] = this.treatmentPlan;
        localStorage.setItem("treatmentPlans", JSON.stringify(treatmentPlans));

        loading.close(); // 关闭加载状态

        this.$message({
          message: "治疗方案已成功保存",
          type: "success",
          duration: 2000,
        });
        this.isEditing = false;
      } catch (error) {
        loading.close(); // 关闭加载状态
        console.error("保存治疗方案出错:", error);
        this.$message.error("保存失败，请稍后重试");
      }
    },
    saveNotes() {
      if (!this.doctorNotes) {
        this.$message.warning("请先填写医生备注");
        return;
      }

      // 发送请求保存医生备注
      request({
        method: "post",
        url: "/diagnose/saveDoctorNotes",
        data: {
          patientId: this.reportId,
          doctorNotes: this.doctorNotes,
        },
      })
        .then((response) => {
          if (
            response.code === 0 ||
            response.code === 200 ||
            response.code === 1
          ) {
            this.$message.success("医生备注已保存");
          } else {
            this.$message.error(response.msg || "保存失败，请稍后重试");
          }
        })
        .catch((error) => {
          console.error("保存医生备注出错:", error);
          this.$message.error("保存失败，请稍后重试");
        });
    },

    percentFormat(percentage) {
      return percentage + "%";
    },

    getConfidenceColor(confidence) {
      if (confidence >= 80) {
        return "#67c23a"; // 高置信度，绿色
      } else if (confidence >= 60) {
        return "#e6a23c"; // 中等置信度，黄色
      } else {
        return "#f56c6c"; // 低置信度，红色
      }
    },

    getMatrixData(probabilities) {
      if (!probabilities || probabilities.length === 0) {
        return [];
      }

      return this.diseaseCategories.map((disease, index) => ({
        disease,
        probability: Math.round(probabilities[index] * 100),
      }));
    },

    generateRandomProbabilities() {
      // 生成随机概率分布
      const probs = Array(this.diseaseCategories.length)
        .fill(0)
        .map(() => Math.random());
      const sum = probs.reduce((a, b) => a + b, 0);
      return probs.map((p) => p / sum);
    },

    getMaxProbabilityIndex(probabilities) {
      return probabilities.indexOf(Math.max(...probabilities));
    },

    generateFinalDiagnosis(leftIndex, rightIndex) {
      // 根据左右眼结果生成综合诊断
      if (leftIndex === rightIndex) {
        return `双眼${this.diseaseCategories[leftIndex]}`;
      } else if (leftIndex === 7 || rightIndex === 7) {
        // 7是"正常"的索引
        const abnormalIndex = leftIndex === 7 ? rightIndex : leftIndex;
        const abnormalSide = leftIndex === 7 ? "右眼" : "左眼";
        return `${abnormalSide}${this.diseaseCategories[abnormalIndex]}，另眼正常`;
      } else {
        return `左眼${this.diseaseCategories[leftIndex]}，右眼${this.diseaseCategories[rightIndex]}`;
      }
    },

    // 根据诊断结果生成建议治疗方案
    generateSuggestionFromDiagnosis(leftDiagnosis, rightDiagnosis) {
      // 根据诊断结果生成建议
      const suggestions = {
        糖尿病: "建议进行血糖控制，定期复查眼底，必要时考虑激光或抗VEGF治疗。",
        青光眼: "建议测量眼压，进行视野检查，必要时使用降眼压药物。",
        白内障: "建议进行视力矫正，必要时考虑白内障手术。",
        AMD: "建议定期监测黄斑区变化，必要时考虑抗VEGF治疗。",
        高血压: "建议控制血压，定期复查眼底。",
        近视: "建议进行屈光矫正，控制近距离用眼时间。",
        "其他疾病/异常": "建议进一步检查确定具体异常类型。",
        正常: "眼底未见明显异常，建议定期检查。",
      };

      // 清理诊断结果字符串，提取核心疾病类型
      const cleanLeftDiagnosis = this.extractDiseaseType(leftDiagnosis);
      const cleanRightDiagnosis = this.extractDiseaseType(rightDiagnosis);

      // 获取相应的治疗建议
      const leftTreatment =
        suggestions[cleanLeftDiagnosis] || "请遵医嘱进行治疗。";
      const rightTreatment =
        suggestions[cleanRightDiagnosis] || "请遵医嘱进行治疗。";

      // 如果左右眼诊断结果相同，返回单一建议
      if (cleanLeftDiagnosis === cleanRightDiagnosis) {
        return leftTreatment;
      } else {
        // 如果左右眼诊断结果不同，分别返回对应建议
        return `左眼：${leftTreatment}\n右眼：${rightTreatment}`;
      }
    },

    // 从诊断结果中提取核心疾病类型
    extractDiseaseType(diagnosis) {
      if (!diagnosis) return "正常";

      // 移除"左眼"/"右眼"前缀
      let cleanDiagnosis = diagnosis
        .replace(/左眼[：:]*|右眼[：:]*/g, "")
        .trim();

      // 检查是否包含各种疾病关键词
      if (cleanDiagnosis.includes("糖尿病")) return "糖尿病";
      if (cleanDiagnosis.includes("青光眼")) return "青光眼";
      if (cleanDiagnosis.includes("白内障")) return "白内障";
      if (cleanDiagnosis.includes("AMD")) return "AMD";
      if (cleanDiagnosis.includes("高血压")) return "高血压";
      if (cleanDiagnosis.includes("近视")) return "近视";
      if (cleanDiagnosis.includes("正常")) return "正常";

      // 如果没有匹配到具体疾病，则归为其他异常
      return cleanDiagnosis.includes("异常")
        ? "其他疾病/异常"
        : "其他疾病/异常";
    },

    async loadReportData() {
      try {
        // 获取路由中的报告ID
        const patientId = this.$route.params.id;

        // 调用API获取诊断报告数据 - 修改为GET请求
        const response = await request({
          method: "get",
          url: "/diagnose/report",
          params: {
            patientId: patientId,
          },
        });

        if (
          response.code === 0 ||
          response.code === 1 ||
          response.code === 200
        ) {
          const data = response.data;
          console.log("Received report data:", data);

          // 设置患者信息
          this.patientInfo = {
            name: data.patientMsg?.name || "",
            gender: data.patientMsg?.gender || "male",
            age: data.patientMsg?.age || 0,
          };

          // 解析图像路径
          const leftImagePath = data.result?.imageLeft || data.imageLeft || "";
          const rightImagePath =
            data.result?.imageRight || data.imageRight || "";

          // 解析概率数组和标签
          const leftProbabilities = data.result?.diseaseLeftProbabilities || [];
          const rightProbabilities =
            data.result?.diseaseRightProbabilities || [];
          const leftLabels = data.result?.diseaseLeftLabels || [];
          const rightLabels = data.result?.diseaseRightLabels || [];

          // 如果API返回了标签和概率，将它们组合成对象数组
          let formattedLeftProbs = this.formatProbabilities(
            leftProbabilities,
            leftLabels
          );
          let formattedRightProbs = this.formatProbabilities(
            rightProbabilities,
            rightLabels
          );

          // 获取左右眼诊断结果
          const leftDiagnosis =
            data.result?.leftResult || data.leftResult || "";
          const rightDiagnosis =
            data.result?.rightResult || data.rightResult || "";

          // 设置报告数据
          this.report = {
            id: data.patientMsg?.patientId || data.patientId || "",
            diagnosisTime: data.diagnosisTime || "",
            time: data.diagnosisTime || "",
            doctor: "主治医师",
            leftEyeImage: leftImagePath,
            rightEyeImage: rightImagePath,
            leftEye: {
              diagnosis: leftDiagnosis,
              confidence: 0,
              probabilities: formattedLeftProbs,
            },
            rightEye: {
              diagnosis: rightDiagnosis,
              confidence: 0,
              probabilities: formattedRightProbs,
            },
            finalDiagnosis: data.result?.finalResult || data.finalResult || "",
            suggestion: this.generateSuggestionFromDiagnosis(
              leftDiagnosis,
              rightDiagnosis
            ),
          };

          // 设置初始治疗方案 - 优先使用API返回的建议
          if (data.treatmentPlan) {
            // 如果API返回了已保存的治疗方案，优先使用它
            this.treatmentPlan = data.treatmentPlan;
          } else {
            // 否则使用自动生成的建议
            this.treatmentPlan = this.report.suggestion;
          }
        } else {
          this.$message.error(response.msg || "获取诊断报告失败");
        }
      } catch (error) {
        console.error("获取诊断报告错误:", error);
        this.$message.error("获取诊断报告失败，请稍后重试");
      } finally {
        this.isLoading = false;
      }
    },

    // 格式化概率数据
    formatProbabilities(probabilities, labels) {
      // 如果没有概率或标签数据，返回空数组
      if (
        !probabilities ||
        !Array.isArray(probabilities) ||
        probabilities.length === 0
      ) {
        return [];
      }

      // 如果已经是对象数组格式，直接返回
      if (
        typeof probabilities[0] !== "number" &&
        probabilities[0] &&
        "name" in probabilities[0]
      ) {
        return probabilities;
      }

      // 如果有概率数据（数字数组）但没有标签数据，使用默认疾病分类
      if (!labels || !Array.isArray(labels) || labels.length === 0) {
        return probabilities.map((prob, index) => ({
          name:
            index < this.diseaseCategories.length
              ? this.diseaseCategories[index]
              : `疾病${index + 1}`,
          probability: prob,
        }));
      }

      // 将概率和标签组合成对象数组
      return probabilities.map((prob, index) => ({
        name: index < labels.length ? labels[index] : `疾病${index + 1}`,
        probability: prob,
      }));
    },

    getTopFiveDiseases(probabilities) {
      // 检查概率数组是否有效
      if (
        !probabilities ||
        !Array.isArray(probabilities) ||
        probabilities.length === 0
      ) {
        return [];
      }

      let diseaseData = [];

      // 处理不同格式的概率数据
      if (typeof probabilities[0] === "number") {
        // 如果是数字数组格式，按照原来的方式处理
        diseaseData = this.diseaseCategories.map((disease, index) => ({
          disease,
          probability:
            index < probabilities.length
              ? Math.round(probabilities[index] * 100)
              : 0,
        }));
      } else if (
        probabilities[0] &&
        ("name" in probabilities[0] || "probability" in probabilities[0])
      ) {
        // 如果是包含name和probability字段的对象数组
        diseaseData = probabilities.map((item) => ({
          disease: item.name || "",
          probability:
            typeof item.probability === "number"
              ? Math.round(item.probability * 100)
              : Math.round(parseFloat(item.probability || 0) * 100),
        }));
      }

      // 按概率从高到低排序
      return diseaseData
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);
    },

    tableCellClassName({ row, column }) {
      // 根据概率高低设置不同的颜色样式
      if (column.property === "probability") {
        const prob = row.probability;
        if (prob >= 80) {
          return "high-probability";
        } else if (prob >= 60) {
          return "medium-probability";
        } else if (prob >= 30) {
          return "low-probability";
        }
      }
      return "";
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

    // 自动调整报告内容缩放以适应一页打印
    adjustPrintScale() {
      // 获取报告元素
      const reportPaper = document.querySelector(".report-paper");
      const a4Container = document.querySelector(".a4-container");
      if (!reportPaper || !a4Container) return;

      // 重置容器样式以确保正确测量
      a4Container.style.height = "auto";
      a4Container.style.minHeight = "auto";
      a4Container.style.maxHeight = "none";
      a4Container.style.overflow = "visible";

      reportPaper.style.height = "auto";
      reportPaper.style.transform = "";

      // 为更准确测量，先等待DOM更新
      setTimeout(() => {
        // 测量内容高度（像素）
        const contentHeight = reportPaper.offsetHeight;

        // A4纸高度 (297mm)，转为像素（假设96dpi，1英寸=25.4mm）
        // 297mm ≈ 1123px
        const a4HeightPx = 1123;
        const maxContentHeightPx = a4HeightPx - 40; // 留一些边距空间

        console.log(
          `报告内容高度: ${contentHeight}px, A4高度限制: ${maxContentHeightPx}px`
        );

        if (contentHeight > maxContentHeightPx) {
          // 计算需要的缩放比例，确保内容适合A4纸高度
          const scale = maxContentHeightPx / contentHeight;

          // 应用缩放
          reportPaper.style.transform = `scale(${scale})`;
          reportPaper.style.transformOrigin = "top center";

          // 调整容器高度以匹配缩放后的内容
          const scaledHeight = contentHeight * scale;
          a4Container.style.height = `${scaledHeight}px`;

          // 保存缩放值
          this.appliedScale = scale;

          console.log(`应用缩放比例: ${scale}, 缩放后高度: ${scaledHeight}px`);
        } else {
          // 如果内容已经适合页面，确保容器高度正确
          a4Container.style.height = `${contentHeight}px`;
          console.log("内容已适合页面，无需缩放");
        }
      }, 100);
    },

    // 重置报告缩放
    resetPrintScale() {
      const paperElement = document.querySelector(".report-paper");
      const containerElement = document.querySelector(".a4-container");

      if (paperElement) {
        paperElement.style.transform = "";
        paperElement.style.transformOrigin = "";
      }

      if (containerElement) {
        containerElement.style.height = "";
        containerElement.style.minHeight = "";
        containerElement.style.maxHeight = "";
      }
    },
  },
  created() {
    // 从路由参数获取报告ID
    this.reportId = this.$route.params.id;
    this.loadReportData();

    // 确保isPrinting初始化为false
    this.isPrinting = false;

    // 检查URL参数是否包含print=true，如果是则自动打印
    if (this.$route.query.print === "true") {
      // 等待数据加载完成
      this.$nextTick(() => {
        // 给页面一些时间渲染
        setTimeout(() => {
          this.printReport();
        }, 1000);
      });
    }
  },
  mounted() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      this.$router.push("/login");
    }

    // 监听打印事件
    window.addEventListener("beforeprint", () => {
      this.isPrinting = true;
    });
    window.addEventListener("afterprint", () => {
      this.isPrinting = false;
    });
  },
  beforeUnmount() {
    // 移除打印事件监听
    window.removeEventListener("beforeprint", () => {
      this.isPrinting = true;
    });
    window.removeEventListener("afterprint", () => {
      this.isPrinting = false;
    });
  },
};
</script>

<style lang="scss" scoped>
@use "sass:color";

.report-detail-container {
  padding: 20px;
  background: #f5f7fa;
  // display: flex;
  justify-content: center;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* A4 容器 */
.a4-container {
  width: 794px; /* A4宽度 210mm -> 794px (96dpi) */
  min-height: 1123px; /* A4高度 297mm */
  background: white;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
  padding: 40px 50px;
  border: 1px solid #dcdfe6;
  // font-family: "SimSun", "宋体", "Microsoft YaHei", sans-serif;
  color: #303133;
  line-height: 1.6;
}

.report-content {
  // 整体居中
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

/* ===== 顶部 LOGO + 医院信息 ===== */
.report-paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #303133;
  padding-bottom: 12px;
  margin-bottom: 16px;

  .report-logo-section {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo-image {
      width: 70px;
      height: 70px;
      object-fit: contain;
    }

    .report-main-title {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
      margin: 0;
      letter-spacing: 2px;
    }
  }

  .report-barcode-section {
    .barcode-placeholder {
      width: 200px;
      height: 60px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect x="10" y="10" width="2" height="40" fill="%23000"/><rect x="15" y="10" width="1" height="40" fill="%23000"/><rect x="20" y="10" width="3" height="40" fill="%23000"/><rect x="26" y="10" width="2" height="40" fill="%23000"/><rect x="30" y="10" width="4" height="40" fill="%23000"/><rect x="36" y="10" width="1" height="40" fill="%23000"/><rect x="39" y="10" width="3" height="40" fill="%23000"/><rect x="45" y="10" width="2" height="40" fill="%23000"/><rect x="49" y="10" width="1" height="40" fill="%23000"/><rect x="52" y="10" width="4" height="40" fill="%23000"/><rect x="58" y="10" width="2" height="40" fill="%23000"/><rect x="62" y="10" width="3" height="40" fill="%23000"/><rect x="68" y="10" width="1" height="40" fill="%23000"/><rect x="71" y="10" width="2" height="40" fill="%23000"/><rect x="75" y="10" width="4" height="40" fill="%23000"/><rect x="81" y="10" width="1" height="40" fill="%23000"/><rect x="84" y="10" width="3" height="40" fill="%23000"/><rect x="90" y="10" width="2" height="40" fill="%23000"/><rect x="94" y="10" width="1" height="40" fill="%23000"/><rect x="97" y="10" width="4" height="40" fill="%23000"/><rect x="103" y="10" width="2" height="40" fill="%23000"/><rect x="107" y="10" width="3" height="40" fill="%23000"/><rect x="113" y="10" width="1" height="40" fill="%23000"/><rect x="116" y="10" width="2" height="40" fill="%23000"/><rect x="120" y="10" width="4" height="40" fill="%23000"/><rect x="126" y="10" width="1" height="40" fill="%23000"/><rect x="129" y="10" width="3" height="40" fill="%23000"/><rect x="135" y="10" width="2" height="40" fill="%23000"/><rect x="139" y="10" width="1" height="40" fill="%23000"/><rect x="142" y="10" width="4" height="40" fill="%23000"/><rect x="148" y="10" width="2" height="40" fill="%23000"/><rect x="152" y="10" width="3" height="40" fill="%23000"/><rect x="158" y="10" width="1" height="40" fill="%23000"/><rect x="161" y="10" width="2" height="40" fill="%23000"/><rect x="165" y="10" width="4" height="40" fill="%23000"/><rect x="171" y="10" width="1" height="40" fill="%23000"/><rect x="174" y="10" width="3" height="40" fill="%23000"/><rect x="180" y="10" width="2" height="40" fill="%23000"/></svg>');
      background-repeat: no-repeat;
      background-position: center;
    }
  }
}

/* ===== 报告编号与日期 ===== */
.report-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 6px 0;
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 12px;
}

/* ===== 分区小标题 ===== */
.section-subtitle {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  background: #f2f6fc;
  border-left: 4px solid #409eff;
  padding: 4px 10px;
  margin: 20px 0 12px;
}

/* ===== 患者信息表格 ===== */
.patient-info-grid {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;

  .info-row {
    display: flex;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .info-item {
      flex: 1;
      padding: 8px 12px;
      font-size: 14px;
      border-right: 1px solid #ebeef5;

      &:last-child {
        border-right: none;
      }

      .info-label {
        font-weight: bold;
        margin-right: 4px;
      }
    }
  }
}

/* ===== 眼底图片展示 ===== */
.eye-images-grid {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;

  .eye-image-container {
    flex: 1;
    text-align: center;

    .eye-image {
      width: 100%;
      height: 240px;
      object-fit: contain;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
    }

    .no-image-placeholder {
      width: 100%;
      height: 240px;
      background: #f9f9f9;
      border: 1px dashed #dcdfe6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #909399;
    }

    .eye-label-below {
      margin-top: 6px;
      font-size: 13px;
      color: #606266;
    }
  }
}

/* ===== 诊断结果 ===== */
.diagnosis-grid {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;

  .diagnosis-item {
    flex: 1;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 12px;
    background: #fff;

    .diagnosis-title {
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .diagnosis-conclusion {
      margin-top: 8px;
      font-size: 14px;

      .conclusion-label {
        font-weight: bold;
        color: #303133;
      }

      .conclusion-value {
        color: #606266;
      }
    }
  }
}

/* ===== 综合诊断结果 ===== */
.final-diagnosis {
  margin-top: 10px;
  padding: 12px;
  padding-top: 0;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #ecf5ff;

  .diagnosis-title {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .final-diagnosis-value {
    font-size: 15px;
    font-weight: bold;
    color: #2c3e50;
  }
}

/* ===== 治疗建议 ===== */
.treatment-content {
  .el-input {
    margin-bottom: 10px;
  }

  .treatment-hint {
    font-size: 13px;
    color: #909399;
    line-height: 1.6;
    margin-top: 5px;
  }

  .treatment-actions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
  }
}

/* ===== 医生签名 ===== */
.doctor-signature {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;

  .signature-text {
    font-size: 14px;
    color: #303133;
    line-height: 1.8;
    text-align: right;
  }
}

/* ===== 页脚提示 ===== */
.report-footer {
  margin-top: 40px;
  font-size: 12px;
  text-align: center;
  color: #909399;
  border-top: 1px dashed #dcdfe6;
  padding-top: 10px;
}

/* ===== 打印优化 ===== */
@media print {
  body {
    background: white;
  }
  .a4-container {
    box-shadow: none;
    border: none;
    margin: 0;
    padding: 20mm;
  }
}
</style>
