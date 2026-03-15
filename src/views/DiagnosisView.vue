<template>
  <app-layout active-menu="/diagnosis">
    <div class="diagnosis-container">
      <!-- 患者信息录入链接 -->
      <div class="patient-info-section">
        <el-button type="primary" @click="showPatientInfoDialog">
          <i class="el-icon-plus"></i>
          <span class="required-field">*</span> 添加患者信息
        </el-button>
        <span class="info-tip">请先添加患者信息再进行诊断</span>
      </div>

      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabChange">
        <el-tab-pane label="个人诊断" name="single">
          <!-- 患者选择 -->
          <div class="patient-selection" v-if="validPatientOptions.length > 0">
            <el-form :inline="true" class="selection-form">
              <el-form-item label="选择患者:">
                <el-select
                  v-model="selectedPatientId"
                  placeholder="请选择患者"
                  @change="handlePatientSelect"
                >
                  <el-option
                    v-for="patient in validPatientOptions"
                    :key="patient.id"
                    :label="`${patient.id} - ${patient.name}`"
                    :value="patient.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <div class="empty-patient-tip" v-else>
            <el-alert
              title="尚未添加患者信息"
              type="warning"
              :closable="false"
              show-icon
            >
              请先点击上方的"添加患者信息"按钮添加患者信息
            </el-alert>
          </div>

          <div class="upload-section">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <div class="eye-upload-container">
                  <h2 class="upload-title">左眼</h2>
                  <el-upload
                    class="eye-uploader"
                    drag
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleLeftEyeChange"
                    :before-upload="beforeUpload"
                  >
                    <template v-if="!leftEyeImage">
                      <el-icon class="upload-icon"><Folder /></el-icon>
                      <div class="upload-text">点击或拖拽文件到此区域上传</div>
                      <div class="upload-tip">
                        支持单个图片上传，格式限JPG/PNG
                      </div>
                    </template>
                    <img v-else :src="leftEyeImage" class="eye-image" />
                  </el-upload>
                  <div v-if="leftEyeImage" class="image-actions">
                    <el-button
                      size="small"
                      type="danger"
                      @click="removeLeftEye"
                    >
                      删除图像
                    </el-button>
                    <div class="image-name">{{ leftEyeFile.name }}</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12">
                <div class="eye-upload-container">
                  <h2 class="upload-title">右眼</h2>
                  <el-upload
                    class="eye-uploader"
                    drag
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleRightEyeChange"
                    :before-upload="beforeUpload"
                  >
                    <template v-if="!rightEyeImage">
                      <el-icon class="upload-icon"><Folder /></el-icon>
                      <div class="upload-text">点击或拖拽文件到此区域上传</div>
                      <div class="upload-tip">
                        支持单个图片上传，格式限JPG/PNG
                      </div>
                    </template>
                    <img v-else :src="rightEyeImage" class="eye-image" />
                  </el-upload>
                  <div v-if="rightEyeImage" class="image-actions">
                    <el-button
                      size="small"
                      type="danger"
                      @click="removeRightEye"
                    >
                      删除图像
                    </el-button>
                    <div class="image-name">{{ rightEyeFile.name }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
            <div class="upload-actions">
              <el-button
                type="primary"
                size="large"
                :disabled="!canProcess"
                @click="processSingleImages"
              >
                开始诊断分析
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="批量诊断" name="batch">
          <!-- 患者选择 -->
          <div class="patient-selection" v-if="validPatientOptions.length > 0">
            <el-form :inline="true" class="selection-form">
              <el-form-item label="选择患者(多选):">
                <el-select
                  v-model="selectedPatientIds"
                  placeholder="请选择患者"
                  multiple
                >
                  <el-option
                    v-for="patient in validPatientOptions"
                    :key="patient.id"
                    :label="`${patient.id} - ${patient.name}`"
                    :value="patient.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <div class="empty-patient-tip" v-else>
            <el-alert
              title="尚未添加患者信息"
              type="warning"
              :closable="false"
              show-icon
            >
              请先点击上方的"添加患者信息"按钮添加患者信息
            </el-alert>
          </div>

          <div class="upload-section">
            <div
              class="batch-upload-container"
              :file-list="batchFileList"
              @drop.prevent="handleDrop"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              :class="{ 'drag-over': isDragOver }"
              webkitdirectory
              directory
              :show-file-list="false"
              @click.prevent="browseFolders"
            >
              <!-- <el-upload class="batch-uploader" drag action="#" multiple>
                <template #default> -->
              <el-icon class="upload-icon"><Folder /></el-icon>
              <div class="upload-text">点击或拖拽文件夹到此区域上传</div>
              <div class="upload-tip">
                支持批量文件夹上传，每个文件夹应包含一位患者的左右眼图像（JPG/PNG格式）
              </div>
              <!-- </template>
              </el-upload> -->
            </div>

            <div class="batch-preview" v-if="batchFileList.length > 0">
              <h3 class="preview-title">
                已上传 {{ patientFolders.length }} 个文件夹，包含
                {{ batchFileList.length }} 组图像
              </h3>

              <el-alert
                v-if="unpairedImages.length > 0"
                title="以下文件夹包含的图像数量不足（少于2张），将被忽略处理"
                type="warning"
                :closable="false"
                show-icon
              >
                <div class="unpaired-list">
                  <span
                    v-for="(folder, index) in patientFolders.filter(
                      (f) => f.files.length < 2
                    )"
                    :key="index"
                    class="unpaired-item"
                  >
                    {{ folder.name }} ({{ folder.files.length }}张)
                  </span>
                </div>
              </el-alert>

              <div class="batch-file-list">
                <h4 class="file-list-title">已上传文件夹列表</h4>
                <el-table
                  :data="batchFileList"
                  style="width: 100%"
                  size="small"
                  border
                >
                  <el-table-column
                    type="index"
                    label="序号"
                    width="50"
                  ></el-table-column>
                  <el-table-column
                    prop="name"
                    label="文件夹名称"
                  ></el-table-column>
                  <el-table-column label="图像数量" width="120">
                    <template #default="scope">
                      <div>
                        <span>{{ scope.row.validFileCount || 0 }}</span>
                        <span class="count-separator">/</span>
                        <span>{{ scope.row.fileCount || 0 }}</span>
                        <span>张有效图像</span>
                      </div>
                      <div
                        v-if="scope.row.hasWarning"
                        class="warning-text mini-warning"
                      >
                        {{ scope.row.warningMessage }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="size"
                    label="大小"
                    width="100"
                    :formatter="formatFileSize"
                  ></el-table-column>
                  <el-table-column label="状态" width="100">
                    <template #default="scope">
                      <el-tag type="success" v-if="scope.row.isProcessable"
                        >可处理</el-tag
                      >
                      <el-tag type="warning" v-else>图像不足</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div class="upload-actions">
                <el-button
                  type="primary"
                  size="large"
                  :disabled="pairedImages.length === 0"
                  @click="processBatchImages"
                >
                  开始批量诊断分析
                </el-button>
                <el-button
                  type="danger"
                  size="large"
                  @click="clearBatchFiles"
                  icon="el-icon-delete"
                >
                  清空文件
                </el-button>
              </div>
            </div>

            <div class="batch-help" v-else>
              <el-alert
                title="批量诊断使用说明"
                type="info"
                :closable="false"
                show-icon
              >
                <p>1. 先在上方选择需要诊断的患者</p>
                <p>
                  2.
                  点击或拖拽包含眼底图像的文件夹到此区域，每个文件夹对应一位患者
                </p>
                <p>3. 每个文件夹内应包含该患者的左右眼图像（至少2张图像）</p>
                <p>4. 上传完成后，点击「开始批量诊断分析」按钮</p>
                <p>5. 使用「清空文件」按钮可以一键清除所有已上传的文件</p>
              </el-alert>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 患者信息及诊断结果列表 -->
      <div class="patient-diagnosis-section">
        <h2 class="section-title">患者诊断列表</h2>
        <el-card class="patient-diagnosis-card">
          <el-table
            v-if="filteredPatientList.length > 0"
            :data="filteredPatientList"
            style="width: 100%"
            border
            :border-style="{ verticalBorderStyle: 'none' }"
            stripe
            :default-sort="{ prop: 'id', order: 'ascending' }"
          >
            <el-table-column
              prop="id"
              label="ID"
              width="80"
              sortable
            ></el-table-column>
            <el-table-column
              prop="name"
              label="姓名"
              width="100"
            ></el-table-column>
            <el-table-column prop="gender" label="性别" width="60">
              <template #default="scope">
                {{ scope.row.gender === "男" ? "男" : "女" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="age"
              label="年龄"
              width="60"
            ></el-table-column>
            <el-table-column label="左眼诊断" width="150">
              <template #default="scope">
                <div
                  :class="{ 'waiting-diagnosis': !scope.row.leftEyeDiagnosis }"
                >
                  {{ scope.row.leftEyeDiagnosis || "待诊断" }}
                </div>
                <div v-if="scope.row.leftEyeConfidence" class="confidence-text">
                  置信度: {{ scope.row.leftEyeConfidence }}%
                </div>
              </template>
            </el-table-column>
            <el-table-column label="右眼诊断" width="150">
              <template #default="scope">
                <div
                  :class="{ 'waiting-diagnosis': !scope.row.rightEyeDiagnosis }"
                >
                  {{ scope.row.rightEyeDiagnosis || "待诊断" }}
                </div>
                <div
                  v-if="scope.row.rightEyeConfidence"
                  class="confidence-text"
                >
                  置信度: {{ scope.row.rightEyeConfidence }}%
                </div>
              </template>
            </el-table-column>
            <el-table-column label="综合诊断">
              <template #default="scope">
                <div
                  :class="{ 'waiting-diagnosis': !scope.row.finalDiagnosis }"
                >
                  {{ scope.row.finalDiagnosis || "待诊断" }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="processTime"
              label="处理时间"
              width="160"
            ></el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <div class="table-actions">
                  <el-button
                    size="small"
                    type="primary"
                    @click="editPatient(scope.row)"
                    style="
                      color: #409eff;
                      background-color: #ecf5ff;
                      border: 1px solid #b3d8ff;
                    "
                    >编辑</el-button
                  >
                  <el-button
                    size="small"
                    type="danger"
                    style="
                      color: #f56c6c !important;
                      background-color: #fef0f0 !important;
                    "
                    @click="deletePatient(scope.row)"
                    >删除</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div v-else class="empty-patient-list">
            <el-empty description="暂无患者信息" :image-size="100">
              <template #description>
                <p>尚未添加任何患者信息</p>
                <p>请点击上方的"添加患者信息"按钮添加患者</p>
              </template>
              <el-button type="primary" @click="showPatientInfoDialog"
                >添加患者信息</el-button
              >
            </el-empty>
          </div>
        </el-card>
      </div>

      <!-- 处理进度对话框 -->
      <el-dialog
        title="处理中"
        v-model="processingDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        width="500px"
      >
        <div class="processing-content">
          <div class="processing-info">
            <p>
              正在处理
              {{ processingMode === "single" ? "单图" : "批量" }} 诊断任务
            </p>
            <p v-if="processingMode === 'batch'">
              进度: {{ processedCount }}/{{ totalProcessCount }}
              <span v-if="totalProcessCount > 1"
                >({{ processingPercentage }}%)</span
              >
            </p>
            <p
              v-if="
                processingMode === 'batch' && uploadedFolderPaths.length > 0
              "
            >
              已成功上传 {{ uploadedFolderPaths.length }} 个文件夹
            </p>
          </div>
          <el-progress
            :percentage="processingPercentage"
            :format="percentageFormat"
            :stroke-width="18"
            status="success"
          ></el-progress>
          <div
            class="task-queue"
            v-if="processingMode === 'batch' && taskQueue.length > 0"
          >
            <h4>
              任务队列 ({{
                taskQueue.filter((t) => t.status === "completed").length
              }}/{{ taskQueue.length }})
            </h4>
            <div class="queue-items">
              <div
                v-for="(task, index) in taskQueue"
                :key="index"
                class="queue-item"
                :class="{
                  active: index === currentTaskIndex,
                  completed: task.status === 'completed',
                  processing: task.status === 'processing',
                  failed: task.status === 'failed',
                }"
              >
                <span class="task-name">{{ task.name }}</span>
                <span class="task-status">{{
                  getTaskStatusText(task.status)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- 诊断结果展示 -->
      <div class="results-section" v-if="showResults">
        <h2 class="section-title">诊断结果</h2>

        <div v-if="processingMode === 'single'" class="single-result">
          <!-- 增加患者信息展示 -->
          <el-card class="patient-info-card" v-if="selectedPatient">
            <template #header>
              <div class="patient-info-header">
                <span>患者信息</span>
              </div>
            </template>
            <div class="patient-info-content">
              <div class="info-item">
                <span class="info-label">ID:</span> {{ selectedPatient.id }}
              </div>
              <div class="info-item">
                <span class="info-label">姓名:</span> {{ selectedPatient.name }}
              </div>
              <div class="info-item">
                <span class="info-label">性别:</span>
                {{ selectedPatient.gender === "男" ? "男" : "女" }}
              </div>
              <div class="info-item">
                <span class="info-label">年龄:</span> {{ selectedPatient.age }}
              </div>
              <div class="info-item" v-if="selectedPatient.phone">
                <span class="info-label">电话:</span>
                {{ selectedPatient.phone }}
              </div>
              <div class="info-item" v-if="selectedPatient.note">
                <span class="info-label">备注:</span> {{ selectedPatient.note }}
              </div>
            </div>
          </el-card>

          <!-- <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12">
              <el-card class="result-card">
                <template #header>
                  <div class="result-header">
                    <span>左眼诊断结果</span>
                  </div>
                </template>
                <div class="result-content">
                  <div class="result-chart">
                    <div ref="leftEyeChart" class="chart-container"></div>
                  </div>
                  <div class="result-diagnosis">
                    <h4>诊断结论</h4>
                    <div class="diagnosis-result">
                      {{ singleResult.leftEye.diagnosis }}
                    </div>
                    <div class="confidence">
                      置信度: {{ singleResult.leftEye.confidence }}%
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12">
              <el-card class="result-card">
                <template #header>
                  <div class="result-header">
                    <span>右眼诊断结果</span>
                  </div>
                </template>
                <div class="result-content">
                  <div class="result-chart">
                    <div ref="rightEyeChart" class="chart-container"></div>
                  </div>
                  <div class="result-diagnosis">
                    <h4>诊断结论</h4>
                    <div class="diagnosis-result">
                      {{ singleResult.rightEye.diagnosis }}
                    </div>
                    <div class="confidence">
                      置信度: {{ singleResult.rightEye.confidence }}%
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row> -->

          <!-- 添加左右眼检测结果分析柱状图 -->
          <!-- <el-card class="result-comparison-card">
            <template #header>
              <div class="result-header">
                <span>左右眼检测结果分析</span>
              </div>
            </template>
            <div class="comparison-chart-container">
              <div ref="comparisonChart" class="comparison-chart"></div>
            </div>
          </el-card> -->

          <el-card class="combined-result-card">
            <template #header>
              <div class="result-header">
                <span>综合诊断结果</span>
                <div class="result-actions">
                  <el-button type="primary" size="small" @click="saveReport"
                    >保存报告</el-button
                  >
                  <el-button type="success" size="small" @click="exportReport"
                    >导出报告</el-button
                  >
                </div>
              </div>
            </template>
            <div class="combined-result-content">
              <div class="combined-diagnosis">
                <h3>最终诊断结论</h3>
                <div class="final-diagnosis">
                  {{ singleResult.finalDiagnosis }}
                </div>
              </div>
              <div class="diagnosis-suggestion">
                <h3>诊断建议</h3>
                <p>{{ singleResult.suggestion }}</p>
              </div>
            </div>
          </el-card>
        </div>

        <div v-else-if="processingMode === 'batch'" class="batch-results">
          <el-card class="batch-results-card">
            <template #header>
              <div class="batch-header">
                <span>批量诊断结果</span>
                <div class="batch-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="saveAllBatchReports"
                    >保存全部报告</el-button
                  >
                  <el-button
                    type="success"
                    size="small"
                    @click="exportAllBatchReports"
                    >导出全部报告</el-button
                  >
                </div>
              </div>
            </template>
            <div class="batch-table">
              <el-table
                :data="batchResults"
                style="width: 100%"
                border
                :border-style="{ verticalBorderStyle: 'none' }"
                stripe
                :default-sort="{ prop: 'id', order: 'ascending' }"
              >
                <el-table-column
                  prop="id"
                  label="ID"
                  sortable
                  width="100"
                ></el-table-column>
                <el-table-column label="左眼诊断" width="180">
                  <template #default="scope">
                    <div>{{ scope.row.leftEye.diagnosis }}</div>
                    <div class="confidence-text">
                      置信度: {{ scope.row.leftEye.confidence }}%
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="右眼诊断" width="180">
                  <template #default="scope">
                    <div>{{ scope.row.rightEye.diagnosis }}</div>
                    <div class="confidence-text">
                      置信度: {{ scope.row.rightEye.confidence }}%
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="finalDiagnosis"
                  label="综合诊断"
                ></el-table-column>
                <el-table-column label="操作" width="180">
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button
                        size="small"
                        type="primary"
                        @click="viewBatchDetail(scope.row)"
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
                        @click="exportBatchReport(scope.row)"
                        style="
                          color: #67c23a;
                          background-color: #f0f9eb;
                          border: 1px solid #c2e7b0;
                        "
                        >导出</el-button
                      >
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="history-section">
        <h2 class="section-title">历史诊断记录</h2>
        <div class="history-search">
          <el-form :inline="true">
            <el-form-item label="患者姓名:">
              <el-input
                v-model="historySearchName"
                placeholder="请输入患者姓名"
                clearable
                @keyup.enter="searchHistoryByName"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchHistoryByName"
                >查询</el-button
              >
              <el-button @click="resetHistorySearch">重置</el-button>
            </el-form-item>
          </el-form>
          <div class="search-result-info" v-if="historySearchName">
            <el-tag type="info"
              >搜索 "{{ historySearchName }}" 的结果:
              {{ historyTotal }} 条记录</el-tag
            >
          </div>
        </div>
        <el-card class="history-card">
          <el-table
            :data="historyRecords"
            style="width: 100%"
            border
            :border-style="{ verticalBorderStyle: 'none' }"
            stripe
            :default-sort="{ prop: 'diagnosisTime', order: 'descending' }"
            v-loading="historyLoading"
          >
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column
              prop="diagnosisTime"
              label="诊断时间"
              sortable
              width="180"
            >
              <template #default="scope">
                {{ formatTime(scope.row.diagnosisTime) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="patientName"
              label="患者姓名"
              width="120"
            ></el-table-column>
            <el-table-column prop="leftEye" label="左眼诊断" width="150">
            </el-table-column>
            <el-table-column prop="rightEye" label="右眼诊断" width="150">
            </el-table-column>
            <el-table-column
              prop="comprehensiveDiagnosis"
              label="综合诊断"
              min-width="180"
            ></el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <div class="table-actions">
                  <el-button
                    size="small"
                    type="primary"
                    style="
                      color: #409eff;
                      background-color: #ecf5ff;
                      border: 1px solid #b3d8ff;
                    "
                    @click="viewHistoryDetail(scope.row)"
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
                    @click="exportHistoryReport(scope.row)"
                    >导出</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              background
              layout="total, prev, pager, next, jumper"
              :total="historyTotal"
              :page-size="historyPageSize"
              :current-page="historyCurrentPage"
              @current-change="handleHistoryPageChange"
            ></el-pagination>
          </div>
        </el-card>
      </div>

      <!-- 患者信息录入对话框 -->
      <el-dialog
        title="患者信息录入"
        v-model="patientInfoDialogVisible"
        width="500px"
      >
        <el-form
          :model="patientForm"
          label-width="80px"
          :rules="patientFormRules"
          ref="patientFormRef"
        >
          <el-form-item label="姓名" prop="name">
            <!-- <span class="required-field">*</span> -->
            <el-input
              v-model="patientForm.name"
              placeholder="请输入患者姓名"
            ></el-input>
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <!-- <span class="required-field">*</span> -->
            <el-radio-group v-model="patientForm.gender">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            <!-- <span class="required-field">*</span> -->
            <el-input-number
              v-model="patientForm.age"
              :min="1"
              :max="120"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="电话">
            <el-input
              v-model="patientForm.phone"
              placeholder="请输入联系电话"
            ></el-input>
          </el-form-item>
          <!-- <el-form-item label="备注">
            <el-input
              type="textarea"
              v-model="patientForm.note"
              placeholder="请输入备注信息"
            ></el-input>
          </el-form-item> -->
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="patientInfoDialogVisible = false"
              >取消</el-button
            >
            <el-button type="primary" @click="submitPatientInfo"
              >提交</el-button
            >
          </span>
        </template>
      </el-dialog>
    </div>
  </app-layout>
</template>

<script>
// import * as echarts from "echarts";
import AppLayout from "@/components/AppLayout.vue";
import { Folder } from "@element-plus/icons-vue";
import request from "@/utils/axios"; // 导入配置好的axios实例

export default {
  name: "DiagnosisView",
  components: {
    AppLayout,
    Folder,
  },
  data() {
    return {
      activeTab: "single",

      // 单图诊断数据
      leftEyeFile: null,
      rightEyeFile: null,
      leftEyeImage: null,
      rightEyeImage: null,

      // 批量诊断数据
      batchFileList: [],
      pairedImages: [],
      unpairedImages: [],
      patientFolders: [], // 添加新的数据结构来存储文件夹信息
      uploadedFolderPaths: [], // 存储上传后的文件夹路径

      // 处理状态
      processingMode: "single", // 'single' 或 'batch'
      processingDialogVisible: false,
      processingPercentage: 0,
      processedCount: 0,
      totalProcessCount: 0,
      taskQueue: [],
      currentTaskIndex: 0,

      // 结果数据
      showResults: false,
      singleResult: {
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
      batchResults: [],

      // 历史记录
      historyRecords: [],
      historyLoading: false,
      historyCurrentPage: 1,
      historyPageSize: 10,
      historyTotal: 0,
      historySearchName: "",

      // 疾病类别
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

      // 患者信息相关
      patientInfoDialogVisible: false,
      patientForm: {
        name: "",
        gender: "",
        age: 0,
        phone: "",
        note: "",
        leftEyeDiagnosis: "",
        rightEyeDiagnosis: "",
        leftEyeConfidence: 0,
        rightEyeConfidence: 0,
        finalDiagnosis: "",
        processTime: "",
      },
      patientFormRules: {
        name: [{ required: true, message: "请输入患者姓名", trigger: "blur" }],
        gender: [
          { required: true, message: "请选择患者性别", trigger: "change" },
        ],
        age: [{ required: true, message: "请输入患者年龄", trigger: "blur" }],
      },
      patientList: [],
      isEditingPatient: false,
      editingPatientId: null,

      // 患者选择
      selectedPatientId: "",
      selectedPatientIds: [],
      selectedPatient: null,

      isDragOver: false,
    };
  },
  computed: {
    canProcess() {
      return this.leftEyeFile && this.rightEyeFile && this.selectedPatientId;
    },
    filteredPatientList() {
      return this.patientList.filter((patient) => patient.id && patient.name);
    },
    validPatientOptions() {
      return this.patientList.filter(
        (patient) =>
          patient.id &&
          patient.name &&
          patient.id !== undefined &&
          patient.name !== undefined
      );
    },
  },
  methods: {
    // 标签页切换
    handleTabChange() {
      this.showResults = false;
    },

    // 患者信息相关
    showPatientInfoDialog() {
      this.isEditingPatient = false;
      this.editingPatientId = null;
      // 初始化一个空的患者表单
      this.patientForm = {
        name: "",
        gender: "",
        age: 0,
        phone: "",
        note: "",
        leftEyeDiagnosis: "",
        rightEyeDiagnosis: "",
        leftEyeConfidence: 0,
        rightEyeConfidence: 0,
        finalDiagnosis: "",
        processTime: "",
      };
      this.patientInfoDialogVisible = true;
    },

    generatePatientId() {
      // 此方法保留为辅助功能，但不再自动调用
      const prefix = "PT";
      const date = new Date();
      const year = date.getFullYear();
      const nextNum = this.patientList.length + 1;
      return `${prefix}${year}${nextNum.toString().padStart(3, "0")}`;
    },

    async submitPatientInfo() {
      try {
        const valid = await this.$refs.patientFormRef.validate();
        if (valid) {
          if (this.isEditingPatient) {
            // 编辑现有患者
            const index = this.patientList.findIndex(
              (p) => p.id === this.editingPatientId
            );
            if (index !== -1) {
              // 保留诊断信息
              const diagnosisInfo = {
                leftEyeDiagnosis: this.patientList[index].leftEyeDiagnosis,
                rightEyeDiagnosis: this.patientList[index].rightEyeDiagnosis,
                leftEyeConfidence: this.patientList[index].leftEyeConfidence,
                rightEyeConfidence: this.patientList[index].rightEyeConfidence,
                finalDiagnosis: this.patientList[index].finalDiagnosis,
                processTime: this.patientList[index].processTime,
              };

              // 构建提交数据
              const patientData = {
                // patientId: this.editingPatientId,
                name: this.patientForm.name,
                gender: this.patientForm.gender,
                age: parseInt(this.patientForm.age),
                phoneNumber: this.patientForm.phone || "",
                // remarks: this.patientForm.note || "",
              };

              // 发送编辑请求
              const response = await request({
                method: "put",
                url: "/patients/update",
                data: patientData,
                headers: {
                  "Content-Type": "application/json",
                },
              });

              // 发送编辑请求
              // const response = await request({
              //   method: "put",
              //   url: `/patients/${this.editingPatientId}`,
              //   data: this.patientForm,
              // });

              if (response.code === 200 || response.code === 1) {
                // 直接赋值替代this.$set
                this.patientList[index] = {
                  ...this.patientForm,
                  id: this.editingPatientId,
                  ...diagnosisInfo,
                };
                this.$message.success("患者信息更新成功");
                this.patientInfoDialogVisible = false;
                //在控制台打印出gender
                console.log("gender:", this.patientForm.gender);
                // 保存到 localStorage
                this.savePatientListToLocalStorage();
              } else {
                this.$message.error(response.msg || "更新失败，请重试");
              }
            }
          } else {
            // 添加新患者
            // 根据API需求构建JSON数据
            const patientData = {
              name: this.patientForm.name,
              gender: this.patientForm.gender,
              age: parseInt(this.patientForm.age),
              phoneNumber: this.patientForm.phone || "",
              remarks: this.patientForm.note || "",
            };

            const response = await request({
              method: "post",
              url: "/patients/add",
              data: patientData,
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (response.code === 200 || response.code === 1) {
              // 添加到列表中，使用后端返回的ID
              // response.data 可能直接是ID值，也可能是包含ID的对象
              const patientId =
                typeof response.data === "object"
                  ? response.data.patientId
                  : response.data;

              this.patientList.push({
                ...this.patientForm,
                id: patientId, // 使用后端返回的ID
                leftEyeDiagnosis: "",
                rightEyeDiagnosis: "",
                leftEyeConfidence: 0,
                rightEyeConfidence: 0,
                finalDiagnosis: "",
                processTime: "",
              });
              this.$message.success("患者信息添加成功");
              this.patientInfoDialogVisible = false;

              // 保存到 localStorage
              this.savePatientListToLocalStorage();
            } else {
              this.$message.error(response.msg || "添加失败，请重试");
            }
          }
        }
      } catch (error) {
        console.error("提交患者信息错误:", error);
        this.$message.error(
          error.response?.data?.msg || "操作失败，请稍后重试"
        );
      }
    },

    editPatient(patient) {
      this.isEditingPatient = true;
      this.editingPatientId = patient.id;
      this.patientForm = { ...patient };
      this.patientInfoDialogVisible = true;
    },

    deletePatient(patient) {
      this.$confirm("此操作将永久删除该患者信息, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const index = this.patientList.findIndex((p) => p.id === patient.id);
          if (index !== -1) {
            this.patientList.splice(index, 1);
            this.$message.success("删除成功");

            // 如果删除的是当前选中的患者，清空选择
            if (this.selectedPatientId === patient.id) {
              this.selectedPatientId = "";
              this.selectedPatient = null;
            }

            // 从批量选择中移除
            if (this.selectedPatientIds.includes(patient.id)) {
              const idIndex = this.selectedPatientIds.indexOf(patient.id);
              this.selectedPatientIds.splice(idIndex, 1);
            }

            // 保存到 localStorage
            this.savePatientListToLocalStorage();
          }
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },

    handlePatientSelect(PatientId) {
      this.selectedPatient = this.patientList.find((p) => p.id === PatientId);
    },

    // 单图上传处理
    handleLeftEyeChange(file) {
      this.leftEyeFile = file.raw;
      this.leftEyeImage = URL.createObjectURL(file.raw);
    },

    handleRightEyeChange(file) {
      this.rightEyeFile = file.raw;
      this.rightEyeImage = URL.createObjectURL(file.raw);
    },

    removeLeftEye() {
      this.leftEyeFile = null;
      this.leftEyeImage = null;
    },

    removeRightEye() {
      this.rightEyeFile = null;
      this.rightEyeImage = null;
    },

    // 文件上传前验证
    beforeUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage) {
        this.$message.error("只能上传图片文件!");
        return false;
      }

      if (!isLt5M) {
        this.$message.error("图片大小不能超过 5MB!");
        return false;
      }

      // 批量诊断模式下的额外验证
      if (this.activeTab === "batch") {
        // 检查是否已选择患者
        if (this.selectedPatientIds.length === 0) {
          this.$message.warning("请先选择患者");
          return false;
        }

        // 检查当前上传的文件数量
        const currentFileCount = this.batchFileList.length + 1;
        const maxExpectedFiles = this.selectedPatientIds.length * 2;

        // 如果上传的文件数量超过预期，提示并阻止上传
        if (currentFileCount > maxExpectedFiles) {
          this.$message.warning(
            `最多只能上传 ${maxExpectedFiles} 张图片（${this.selectedPatientIds.length} 个患者，每个患者 2 张图片）`
          );
          return false;
        }
      }

      return false; // 阻止自动上传
    },

    // 批量上传处理
    handleBatchChange(file, fileList) {
      // 检查是否为文件夹上传
      if (file.raw.webkitRelativePath) {
        // 提取文件夹名称
        const folderPath = file.raw.webkitRelativePath;
        const folderName = folderPath.split("/")[0];

        // 检查该文件夹是否已经在列表中
        const existingFolder = this.patientFolders.find(
          (folder) => folder.name === folderName
        );

        // 处理所有文件（不再过滤只处理图像）
        if (!existingFolder) {
          // 添加新文件夹
          this.patientFolders.push({
            name: folderName,
            files: [file.raw],
            element: file,
          });
        } else {
          // 向现有文件夹添加文件
          existingFolder.files.push(file.raw);
        }

        // 显示当前上传的文件夹情况
        this.updateFolderStatus();
      } else {
        // 单个文件上传处理
        this.batchFileList = fileList;
        this.analyzeBatchFiles();
      }
    },

    handleBatchRemove(file, fileList) {
      this.batchFileList = fileList;
      this.analyzeBatchFiles();
    },

    clearBatchFiles() {
      this.batchFileList = [];
      this.pairedImages = [];
      this.unpairedImages = [];
      this.patientFolders = [];
      // 使用ElUpload的方法清空上传列表
      if (this.$refs.batchUploader) {
        this.$refs.batchUploader.clearFiles();
      }
    },

    analyzeBatchFiles() {
      // 检查文件数量是否为偶数
      if (this.batchFileList.length % 2 !== 0) {
        // this.$message.warning("上传图片数量为奇数，最后一张图片将不会被处理");
      }

      // 计算能处理的图片对数量
      const pairCount = Math.floor(this.batchFileList.length / 2);

      // 检查图片对数量与选择的患者数量关系
      if (this.selectedPatientIds.length > 0) {
        if (pairCount < this.selectedPatientIds.length) {
          this.$message.warning(
            `图片对数量(${pairCount})少于患者数量(${this.selectedPatientIds.length})，未选中的患者将不会被处理`
          );
        } else if (pairCount > this.selectedPatientIds.length) {
          this.$message.warning(
            `图片对数量(${pairCount})多于患者数量(${this.selectedPatientIds.length})，多余的图片对将不会被处理`
          );
        }
      }

      // 按顺序配对图片（只处理偶数张）
      this.pairedImages = [];
      const evenCount = Math.floor(this.batchFileList.length / 2) * 2;
      for (let i = 0; i < evenCount; i += 2) {
        this.pairedImages.push({
          leftEye: this.batchFileList[i],
          rightEye: this.batchFileList[i + 1],
        });
      }

      // 记录未配对的图片
      this.unpairedImages =
        this.batchFileList.length % 2 !== 0
          ? [this.batchFileList[this.batchFileList.length - 1]]
          : [];
    },

    async processBatchImages() {
      if (this.selectedPatientIds.length === 0) {
        this.$message.warning("请先选择患者");
        return;
      }

      // 获取有效的文件夹（至少包含2张图片）
      const validFolders = this.patientFolders.filter(
        (folder) =>
          folder.files.filter((file) => file.type.startsWith("image/"))
            .length >= 2
      );

      if (validFolders.length === 0) {
        this.$message.warning("请上传至少一个包含足够图像的文件夹");
        return;
      }

      // 验证患者数量和文件夹数量是否匹配
      if (this.selectedPatientIds.length < validFolders.length) {
        this.$message.warning(
          `选择的患者数量(${this.selectedPatientIds.length})少于有效的文件夹数量(${validFolders.length})`
        );
        return;
      }

      // 开始处理
      this.processingMode = "batch";
      this.processingDialogVisible = true;
      this.processingPercentage = 0;
      this.processedCount = 0;
      this.totalProcessCount = validFolders.length;
      this.taskQueue = [];
      this.currentTaskIndex = 0;
      this.uploadedFolderPaths = [];

      try {
        // 准备上传文件夹
        for (let i = 0; i < validFolders.length; i++) {
          const patientId = this.selectedPatientIds[i];
          const folder = validFolders[i];

          // 添加到任务队列
          this.taskQueue.push({
            id: patientId,
            name: folder.name,
            status: i === 0 ? "processing" : "waiting",
          });
        }

        // 按照患者ID存储图片路径
        const patientImagePaths = {};

        // 逐个上传文件夹
        for (let i = 0; i < validFolders.length; i++) {
          this.currentTaskIndex = i;
          this.taskQueue[i].status = "processing";

          // 更新进度
          this.processedCount = i;
          this.processingPercentage = Math.floor(
            (i / this.totalProcessCount) * 50
          ); // 上传占总进度的50%

          // 等待一小段时间以便UI更新
          await new Promise((resolve) => setTimeout(resolve, 100));

          const folder = validFolders[i];
          const patientId = this.selectedPatientIds[i];
          const folderPaths = [];

          // 确保每个患者ID有一个图片路径数组
          if (!patientImagePaths[patientId]) {
            patientImagePaths[patientId] = [];
          }

          // 为每个文件创建单独的请求，仅处理图像文件
          const imageFiles = folder.files.filter((file) =>
            file.type.startsWith("image/")
          );

          // 如果图像文件不足两张，则跳过
          if (imageFiles.length < 2) {
            this.taskQueue[i].status = "failed";
            this.$message.warning(`文件夹 ${folder.name} 图像文件不足，已跳过`);
            continue;
          }

          // 限制每个患者只处理两张图片（左右眼）
          const filesToProcess = imageFiles.slice(0, 2);

          for (let j = 0; j < filesToProcess.length; j++) {
            const file = filesToProcess[j];
            const formData = new FormData();

            // 添加文件和路径信息，使用customRelativePath属性（如果存在）
            const filePath =
              file.customRelativePath || file.webkitRelativePath || file.name;
            formData.append("folder", file);
            formData.append("path", filePath);

            try {
              // 上传文件
              const uploadResponse = await request({
                method: "post",
                url: "/common/upload/folder",
                data: formData,
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });

              if (uploadResponse.code === 1 || uploadResponse.code === 200) {
                // 保存返回的文件路径 - 确保它是字符串而不是数组
                const imagePath = uploadResponse.data;

                // 调试上传响应
                console.log(`文件 ${file.name} 上传响应:`, uploadResponse);

                if (imagePath) {
                  // 添加到文件夹路径数组
                  folderPaths.push(imagePath);

                  // 添加到该患者的图片路径数组
                  patientImagePaths[patientId].push(imagePath);

                  console.log(
                    `成功添加图片路径 ${imagePath} 到患者 ${patientId}`
                  );
                } else {
                  console.warn(
                    `上传成功但未返回有效的图片路径:`,
                    uploadResponse
                  );
                }
              } else {
                throw new Error(
                  `文件 ${file.name} 上传失败: ${uploadResponse.msg}`
                );
              }
            } catch (error) {
              console.error(`上传文件 ${file.name} 失败:`, error);
              this.$message.warning(
                `文件 ${file.name} 上传失败，将继续尝试上传其他文件`
              );
            }
          }

          // 如果成功上传了该文件夹的所有文件
          if (folderPaths.length > 0) {
            this.uploadedFolderPaths.push(folderPaths);
            this.taskQueue[i].status = "completed";
            console.log(`患者 ${patientId} 的图片上传成功:`, folderPaths);
          } else {
            // 如果该文件夹的所有文件都上传失败
            this.taskQueue[i].status = "failed";
            this.$message.error(`文件夹 ${folder.name} 所有文件上传失败`);
          }
        }

        // 如果没有成功上传任何文件
        if (this.uploadedFolderPaths.length === 0) {
          throw new Error("所有文件上传失败");
        }

        // 更新进度到80%，表示上传完成，开始诊断
        this.processingPercentage = 80;

        // 构建要诊断的患者ID数组 - 仅选择成功上传了图片的患者
        const selectedPatients = Object.keys(patientImagePaths)
          .filter((patientId) => patientImagePaths[patientId].length >= 2)
          .map((patientId) => parseInt(patientId));

        // 发送批量诊断请求
        if (selectedPatients.length > 0) {
          const doctorId = localStorage.getItem("doctorId") || "456";
          // const doctorId = 9;

          // 检查当前的patientImagePaths结构
          console.log("原始患者图片路径:", patientImagePaths);

          // 准备内部数据
          const batchDiagnosisData = {
            patientIds: selectedPatients,
            doctorId: parseInt(doctorId),
            imagePaths: [], // 将用正确的格式重新填充
          };

          // 构建患者图片路径数组 - 按照API示例格式
          selectedPatients.forEach((patientId) => {
            console.log(
              `处理患者${patientId}的图片路径:`,
              patientImagePaths[patientId]
            );

            if (
              patientImagePaths[patientId] &&
              patientImagePaths[patientId].length > 0
            ) {
              // 处理每个图片路径，注意处理嵌套数组
              patientImagePaths[patientId].forEach((pathItem, index) => {
                console.log(
                  `检查图片路径项[${index}]:`,
                  pathItem,
                  Array.isArray(pathItem)
                );

                // 处理嵌套数组的情况
                if (Array.isArray(pathItem)) {
                  // 如果是数组，提取第一个元素
                  if (pathItem.length > 0 && typeof pathItem[0] === "string") {
                    // 添加直接的字符串，不要包装成数组
                    batchDiagnosisData.imagePaths.push(pathItem[0]);
                    console.log(`添加嵌套路径: ${pathItem[0]}`);
                  }
                } else if (pathItem && typeof pathItem === "string") {
                  // 直接是字符串的情况
                  batchDiagnosisData.imagePaths.push(pathItem);
                  console.log(`添加路径: ${pathItem}`);
                }
              });
            }
          });

          // 输出最终结果
          console.log(
            "处理前的图片路径:",
            JSON.stringify(batchDiagnosisData.imagePaths)
          );

          // 确保imagePaths中的每个元素都是字符串，而不是数组
          const flattenedImagePaths = [];
          batchDiagnosisData.imagePaths.forEach((path) => {
            if (Array.isArray(path)) {
              if (path.length > 0 && typeof path[0] === "string") {
                flattenedImagePaths.push(path[0]);
              }
            } else if (typeof path === "string") {
              flattenedImagePaths.push(path);
            }
          });

          // 使用扁平化后的路径
          batchDiagnosisData.imagePaths = flattenedImagePaths;

          console.log("准备发送的图片路径:", batchDiagnosisData.imagePaths);

          // 验证数据
          if (
            batchDiagnosisData.imagePaths.length === 0 &&
            patientImagePaths &&
            Object.keys(patientImagePaths).length === 0
          ) {
            console.warn("没有找到任何有效的图片路径，将使用默认图片路径");
          }

          // 确保患者ID是数字类型
          batchDiagnosisData.patientIds = batchDiagnosisData.patientIds.map(
            (id) => {
              return typeof id === "string" ? parseInt(id, 10) : id;
            }
          );

          // 确保数据结构与后端期望匹配
          const requestData = {
            patientIds: batchDiagnosisData.patientIds,
            doctorId: batchDiagnosisData.doctorId,
            imagePaths:
              batchDiagnosisData.imagePaths.length > 0
                ? batchDiagnosisData.imagePaths
                : [],
          };

          //"https://jxlg-a07.oss-cn-hangzhou.aliyuncs.com/3e43db62-153c-4262-8d96-a6aece4faa33.jpg","https://jxlg-a07.oss-cn-hangzhou.aliyuncs.com/9ed42e62-bfd7-4274-a17f-fc62f329b85d.jpg","https://jxlg-a07.oss-cn-hangzhou.aliyuncs.com/3e43db62-153c-4262-8d96-a6aece4faa33.jpg","https://jxlg-a07.oss-cn-hangzhou.aliyuncs.com/9ed42e62-bfd7-4274-a17f-fc62f329b85d.jpg",

          // 最终检查请求数据结构
          console.log("最终批量诊断请求数据:", JSON.stringify(requestData));

          // 记录路径信息用于调试
          console.log(
            `路径数组长度: ${requestData.imagePaths.length}, 患者数量: ${requestData.patientIds.length}`
          );
          console.log(`图片路径样例:`, requestData.imagePaths.slice(0, 4));

          // 检查并处理可能存在的嵌套数组
          console.log("发送前检查imagePaths结构:", requestData.imagePaths);

          // 注意：imagePaths数组已经在上面的代码中扁平化处理过了
          // 无需再次扁平化处理

          console.log("最终批量诊断请求数据:", requestData);

          // 发送诊断请求
          try {
            // 将请求数据保存到本地用于调试
            try {
              localStorage.setItem(
                "last_batch_request",
                JSON.stringify(requestData)
              );
            } catch (e) {
              console.warn("Could not save request data to localStorage:", e);
            }

            console.log(
              "准备发送批量诊断请求，数据:",
              JSON.stringify(requestData)
            );

            // 确保发送的是符合API文档的格式
            const diagnosisResponse = await request({
              method: "post",
              url: "/diagnose/batch",
              data: requestData, // 直接发送符合格式的请求数据
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 60000, // 增加超时时间到60秒
            }).catch((error) => {
              console.error("请求发送出错:", error);
              // 保存错误信息用于调试
              localStorage.setItem(
                "last_batch_error",
                JSON.stringify({
                  message: error.message,
                  stack: error.stack,
                  response: error.response
                    ? {
                        status: error.response.status,
                        data: error.response.data,
                      }
                    : null,
                })
              );
              throw error;
            });

            console.log("批量诊断响应:", diagnosisResponse);

            if (
              diagnosisResponse.code === 1 ||
              diagnosisResponse.code === 200
            ) {
              console.log(
                "批量诊断成功，响应数据:",
                JSON.stringify(diagnosisResponse.data)
              );

              // 处理诊断结果
              this.processBatchResults(
                diagnosisResponse.data.results || diagnosisResponse.data
              );
              this.processingPercentage = 100;

              setTimeout(() => {
                this.processingDialogVisible = false;
                this.showResults = true;

                // 刷新历史记录列表
                this.fetchHistoryRecords();
              }, 500);
            } else {
              throw new Error(
                diagnosisResponse.msg || "批量诊断失败: 服务器返回错误"
              );
            }
          } catch (error) {
            console.error("批量诊断请求错误:", error);
            this.$message.error(`批量诊断失败: ${error.message || "未知错误"}`);
            this.processingDialogVisible = false;
          }
        } else {
          throw new Error("没有成功上传文件的患者，无法进行诊断");
        }
      } catch (error) {
        console.error("批量处理错误:", error);
        this.$message.error(error.message || "批量处理失败，请稍后重试");
        this.processingDialogVisible = false;
      }
    },

    processBatchResults(results) {
      // 确保 results 是数组
      if (!Array.isArray(results)) {
        console.error(
          "Invalid results format, attempting to convert:",
          results
        );

        // 尝试从不同的响应格式中提取结果数组
        if (results && typeof results === "object") {
          if (results.results && Array.isArray(results.results)) {
            results = results.results;
          } else if (
            Object.values(results).some((v) => typeof v === "object")
          ) {
            // 可能是对象映射，尝试转换为数组
            results = Object.values(results).filter(
              (v) => typeof v === "object"
            );
          }
        }

        // 最终检查
        if (!Array.isArray(results) || results.length === 0) {
          console.error("Could not convert to valid results array:", results);
          this.$message.error("诊断结果格式错误，无法处理");
          return;
        }
      }

      console.log("处理批量诊断结果:", results);

      this.batchResults = results.map((result) => {
        // 提取诊断信息（兼容不同的返回格式）
        const leftEyeDiagnosis =
          result.leftResult || result.leftEye?.diagnosis || "";
        const rightEyeDiagnosis =
          result.rightResult || result.rightEye?.diagnosis || "";
        const finalDiagnosis =
          result.finalResult || result.finalDiagnosis || "";

        // 计算置信度，兼容不同格式
        let leftConfidence = 0;
        let leftProbabilities = [];
        if (result.diseaseLeft?.probabilities) {
          leftProbabilities = result.diseaseLeft.probabilities;
          leftConfidence = Math.max(...leftProbabilities) * 100;
        } else if (result.leftEye?.confidence) {
          leftConfidence = result.leftEye.confidence;
          leftProbabilities = result.leftEye.probabilities || [];
        }

        let rightConfidence = 0;
        let rightProbabilities = [];
        if (result.diseaseRight?.probabilities) {
          rightProbabilities = result.diseaseRight.probabilities;
          rightConfidence = Math.max(...rightProbabilities) * 100;
        } else if (result.rightEye?.confidence) {
          rightConfidence = result.rightEye.confidence;
          rightProbabilities = result.rightEye.probabilities || [];
        }

        return {
          id: result.patientId || result.id,
          patientId: result.patientId || result.id,
          leftEye: {
            diagnosis: leftEyeDiagnosis,
            confidence: leftConfidence,
            probabilities: leftProbabilities,
          },
          rightEye: {
            diagnosis: rightEyeDiagnosis,
            confidence: rightConfidence,
            probabilities: rightProbabilities,
          },
          finalDiagnosis: finalDiagnosis,
          suggestion: this.generateSuggestion(
            this.diseaseCategories.indexOf(leftEyeDiagnosis),
            this.diseaseCategories.indexOf(rightEyeDiagnosis)
          ),
          time: result.diagnosisTime || new Date().toLocaleString(),
        };
      });

      if (this.batchResults.length === 0) {
        this.$message.warning("没有得到有效的诊断结果");
        return;
      }

      // 更新患者诊断信息
      this.batchResults.forEach((result) => {
        if (!result.id) {
          console.warn("Result missing patient ID:", result);
          return;
        }

        const patientIndex = this.patientList.findIndex(
          (p) => p.id === result.id
        );
        if (patientIndex !== -1) {
          const patient = this.patientList[patientIndex];
          patient.leftEyeDiagnosis = result.leftEye.diagnosis;
          patient.rightEyeDiagnosis = result.rightEye.diagnosis;
          patient.finalDiagnosis = result.finalDiagnosis;
          patient.leftEyeConfidence = result.leftEye.confidence;
          patient.rightEyeConfidence = result.rightEye.confidence;
          patient.processTime = new Date().toLocaleString();

          // 更新患者列表
          this.patientList[patientIndex] = { ...patient };

          try {
            // 保存更新后的患者列表
            this.savePatientListToLocalStorage();
          } catch (error) {
            console.error("保存患者列表到本地存储失败:", error);
          }
        }
      });

      // 添加到历史记录
      this.batchResults.forEach((result) => {
        const historyRecord = {
          id: result.id,
          patientId: result.id,
          patientName: this.getPatientNameById(result.id),
          leftEye: result.leftEye.diagnosis,
          rightEye: result.rightEye.diagnosis,
          comprehensiveDiagnosis: result.finalDiagnosis,
          diagnosisTime: result.time,
        };

        // 添加到历史记录
        this.addToHistory(historyRecord);
      });
    },

    // 根据患者ID获取患者姓名
    getPatientNameById(patientId) {
      const patient = this.patientList.find((p) => p.id === patientId);
      return patient ? patient.name : "未知患者";
    },

    // 历史记录操作
    addToHistory(result) {
      // 执行本地更新 - 实际应用中应发送至服务器
      // 由于我们会在processBatchResults后调用fetchHistoryRecords更新全部历史
      // 这里我们可以先在本地添加，之后会被刷新替换
      this.historyRecords.unshift({
        ...result,
        time: result.diagnosisTime || new Date().toLocaleString(),
      });

      // 通知服务器添加历史记录
      this.saveHistoryRecord(result);
    },

    // 保存历史记录到服务器
    async saveHistoryRecord(record) {
      try {
        await request({
          method: "post",
          url: "/patients/addHistory",
          data: {
            patientId: record.patientId,
            leftResult: record.leftEye,
            rightResult: record.rightEye,
            finalResult: record.comprehensiveDiagnosis,
            diagnosisTime: record.diagnosisTime || new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("保存历史记录失败:", error);
      }
    },

    // 处理图像
    async processSingleImages() {
      if (!this.selectedPatientId) {
        this.$message.warning("请先选择患者");
        return;
      }

      this.processingMode = "single";
      this.processingDialogVisible = true;
      this.processingPercentage = 0;

      try {
        // 创建FormData对象
        const leftFormData = new FormData();
        const rightFormData = new FormData();

        // 添加文件到FormData
        leftFormData.append("file", this.leftEyeFile);
        rightFormData.append("file", this.rightEyeFile);

        // 上传左眼图像
        const leftResponse = await request({
          method: "post",
          url: "/common/upload",
          data: leftFormData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // 上传右眼图像
        const rightResponse = await request({
          method: "post",
          url: "/common/upload",
          data: rightFormData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (leftResponse.code === 1 && rightResponse.code === 1) {
          // 获取上传后的文件路径
          const leftImagePath = leftResponse.data;
          const rightImagePath = rightResponse.data;

          // 调用诊断API
          const doctorId = localStorage.getItem("doctorId");
          // const doctorId = 9;
          const diagnosisResponse = await request({
            method: "post",
            url: "/diagnose",
            data: {
              patientId: this.selectedPatientId,
              doctorId: parseInt(doctorId),
              // doctorId: 9,
              imagePaths: [leftImagePath, rightImagePath],
            },
          });

          if (diagnosisResponse.code === 1) {
            const result = diagnosisResponse.data;

            // 更新诊断结果
            this.singleResult = {
              leftEye: {
                diagnosis: this.getDiagnosisFromLabels(
                  result.diseaseLeft.labels
                ),
                confidence: Math.max(...result.diseaseLeft.probabilities) * 100,
                probabilities: result.diseaseLeft.probabilities,
              },
              rightEye: {
                diagnosis: this.getDiagnosisFromLabels(
                  result.diseaseRight.labels
                ),
                confidence:
                  Math.max(...result.diseaseRight.probabilities) * 100,
                probabilities: result.diseaseRight.probabilities,
              },
              finalDiagnosis: result.finalResult,
              suggestion: this.generateSuggestion(
                this.diseaseCategories.indexOf(
                  this.getDiagnosisFromLabels(result.diseaseLeft.labels)
                ),
                this.diseaseCategories.indexOf(
                  this.getDiagnosisFromLabels(result.diseaseRight.labels)
                )
              ),
            };

            // 更新患者诊断信息
            const patientIndex = this.patientList.findIndex(
              (p) => p.id === this.selectedPatientId
            );
            if (patientIndex !== -1) {
              const patient = this.patientList[patientIndex];
              patient.leftEyeDiagnosis = result.leftResult; // 使用API返回的左眼结果
              patient.rightEyeDiagnosis = result.rightResult; // 使用API返回的右眼结果
              patient.finalDiagnosis = result.finalResult; // 使用API返回的最终结果
              patient.leftEyeConfidence =
                Math.max(...result.diseaseLeft.probabilities) * 100;
              patient.rightEyeConfidence =
                Math.max(...result.diseaseRight.probabilities) * 100;
              patient.processTime = new Date().toLocaleString();

              // this.$set(this.patientList, patientIndex, patient);
              // Use direct assignment for Vue 3 reactivity
              this.patientList[patientIndex] = patient;
            }

            // 更新进度并显示结果
            this.processingPercentage = 100;
            setTimeout(() => {
              this.processingDialogVisible = false;
              this.updatePatientDiagnosis();
              this.showResults = true;

              // 添加到历史记录
              this.addToHistory(this.singleResult);

              // 渲染图表
              // this.$nextTick(() => {
              //   this.renderEyeChart(
              //     "leftEyeChart",
              //     this.singleResult.leftEye.probabilities
              //   );
              //   this.renderEyeChart(
              //     "rightEyeChart",
              //     this.singleResult.rightEye.probabilities
              //   );
              //   this.renderComparisonChart(
              //     this.singleResult.leftEye.probabilities,
              //     this.singleResult.rightEye.probabilities
              //   );
              // });
            }, 500);
          } else {
            throw new Error(diagnosisResponse.msg || "诊断失败");
          }
        } else {
          throw new Error("文件上传失败");
        }
      } catch (error) {
        console.error("处理图像错误:", error);
        this.$message.error(error.message || "图像处理失败，请稍后重试");
        this.processingDialogVisible = false;
      }
    },

    // 根据标签数组获取诊断结果
    getDiagnosisFromLabels(labels) {
      // 根据返回的标签数组中最可能的标签确定诊断结果
      if (labels && labels.length > 0) {
        const label = labels[0]; // 取第一个最可能的标签
        switch (label) {
          case "A":
            return "AMD";
          case "D":
            return "糖尿病";
          case "G":
            return "青光眼";
          case "C":
            return "白内障";
          case "H":
            return "高血压";
          case "M":
            return "近视";
          case "O":
            return "其他疾病/异常";
          case "N":
            return "正常";
          default:
            return "未知";
        }
      }
      return "未知";
    },

    // 根据概率数组获取诊断结果，确保与图表显示的结果一致
    // getDiagnosisFromProbabilities(probabilities) {
    //   if (!probabilities || probabilities.length === 0) {
    //     return "未知";
    //   }
    //   // 找出概率最大值的索引
    //   const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    //   // 返回对应的疾病类别
    //   return this.diseaseCategories[maxIndex] || "未知";
    // },

    updatePatientDiagnosis() {
      // 更新患者诊断信息
      if (this.selectedPatientId && this.singleResult) {
        const patientIndex = this.patientList.findIndex(
          (p) => p.id === this.selectedPatientId
        );
        if (patientIndex !== -1) {
          const patient = this.patientList[patientIndex];
          const now = new Date();

          patient.leftEyeDiagnosis = this.singleResult.leftEye.diagnosis;
          patient.leftEyeConfidence = this.singleResult.leftEye.confidence;
          patient.rightEyeDiagnosis = this.singleResult.rightEye.diagnosis;
          patient.rightEyeConfidence = this.singleResult.rightEye.confidence;
          patient.finalDiagnosis = this.singleResult.finalDiagnosis;
          patient.processTime = now.toLocaleString();

          // this.$set(this.patientList, patientIndex, patient);
          // Use direct assignment for Vue 3 reactivity
          this.patientList[patientIndex] = patient;
        }
      }
    },

    // 渲染左右眼比较柱状图
    // renderComparisonChart(leftEyeProbs, rightEyeProbs) {
    //   const chartDom = this.$refs.comparisonChart;
    //   const myChart = echarts.init(chartDom);

    //   // 找出左右眼概率最大值的索引（即诊断结果）
    //   const leftMaxIndex = leftEyeProbs.indexOf(Math.max(...leftEyeProbs));
    //   const rightMaxIndex = rightEyeProbs.indexOf(Math.max(...rightEyeProbs));

    //   // 获取左右眼诊断名称
    //   const leftDiagnosis = this.diseaseCategories[leftMaxIndex];
    //   const rightDiagnosis = this.diseaseCategories[rightMaxIndex];

    //   // 获取颜色列表，便于保持颜色一致性
    //   const colorList = [
    //     "#FF5252", // 糖尿病
    //     "#7C4DFF", // 青光眼
    //     "#448AFF", // 白内障
    //     "#FFC107", // AMD
    //     "#FF9800", // 高血压
    //     "#00BCD4", // 近视
    //     "#9C27B0", // 其他异常
    //     "#4CAF50", // 正常
    //   ];

    //   const option = {
    //     tooltip: {
    //       trigger: "axis",
    //       axisPointer: {
    //         type: "shadow",
    //       },
    //       formatter: (params) => {
    //         const disease = this.diseaseCategories[params[0].dataIndex];
    //         let result = `${disease}<br/>`;
    //         params.forEach((param) => {
    //           const value = param.value;
    //           result += `${param.seriesName}: ${value}%<br/>`;
    //         });
    //         return result;
    //       },
    //     },
    //     legend: {
    //       data: ["左眼", "右眼"],
    //       textStyle: {
    //         fontSize: 14,
    //       },
    //     },
    //     grid: {
    //       left: "3%",
    //       right: "4%",
    //       bottom: "3%",
    //       containLabel: true,
    //     },
    //     xAxis: {
    //       type: "category",
    //       data: this.diseaseCategories,
    //       axisLabel: {
    //         interval: 0,
    //         rotate: 45,
    //         fontSize: 12,
    //         color: function (value, index) {
    //           // 高亮显示诊断结果所在的标签
    //           if (value === leftDiagnosis || value === rightDiagnosis) {
    //             return "#FF5252";
    //           }
    //           return "#333";
    //         },
    //         fontWeight: function (value, index) {
    //           // 加粗显示诊断结果所在的标签
    //           if (value === leftDiagnosis || value === rightDiagnosis) {
    //             return "bold";
    //           }
    //           return "normal";
    //         },
    //       },
    //     },
    //     yAxis: {
    //       type: "value",
    //       name: "概率 (%)",
    //       max: 100,
    //     },
    //     series: [
    //       {
    //         name: "左眼",
    //         type: "bar",
    //         data: leftEyeProbs.map((p, index) => {
    //           const value = (p * 100).toFixed(1);
    //           // 返回带有诊断标记的项
    //           return {
    //             value: value,
    //             itemStyle: {
    //               color:
    //                 index === leftMaxIndex
    //                   ? colorList[index]
    //                   : "rgba(64, 158, 255, 0.5)",
    //             },
    //             emphasis: {
    //               itemStyle: {
    //                 color:
    //                   index === leftMaxIndex ? colorList[index] : "#409EFF",
    //               },
    //             },
    //           };
    //         }),
    //         markPoint: {
    //           data: [
    //             {
    //               name: "左眼诊断",
    //               coord: [
    //                 leftMaxIndex,
    //                 (leftEyeProbs[leftMaxIndex] * 100).toFixed(1),
    //               ],
    //               value: (leftEyeProbs[leftMaxIndex] * 100).toFixed(1) + "%",
    //               itemStyle: {
    //                 color: colorList[leftMaxIndex],
    //               },
    //               symbolSize: [50, 30],
    //               symbol: "rect",
    //               label: {
    //                 fontSize: 14,
    //                 fontWeight: "bold",
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         name: "右眼",
    //         type: "bar",
    //         data: rightEyeProbs.map((p, index) => {
    //           const value = (p * 100).toFixed(1);
    //           // 返回带有诊断标记的项
    //           return {
    //             value: value,
    //             itemStyle: {
    //               color:
    //                 index === rightMaxIndex
    //                   ? colorList[index]
    //                   : "rgba(255, 107, 107, 0.5)",
    //             },
    //             emphasis: {
    //               itemStyle: {
    //                 color:
    //                   index === rightMaxIndex ? colorList[index] : "#FF6B6B",
    //               },
    //             },
    //           };
    //         }),
    //         markPoint: {
    //           data: [
    //             {
    //               name: "右眼诊断",
    //               coord: [
    //                 rightMaxIndex,
    //                 (rightEyeProbs[rightMaxIndex] * 100).toFixed(1),
    //               ],
    //               value: (rightEyeProbs[rightMaxIndex] * 100).toFixed(1) + "%",
    //               itemStyle: {
    //                 color: colorList[rightMaxIndex],
    //               },
    //               symbolSize: [50, 30],
    //               symbol: "rect",
    //               label: {
    //                 fontSize: 14,
    //                 fontWeight: "bold",
    //               },
    //             },
    //           ],
    //         },
    //       },
    //     ],
    //   };

    //   myChart.setOption(option);

    //   // 响应窗口大小变化
    //   window.addEventListener("resize", function () {
    //     myChart.resize();
    //   });
    // },

    // // 渲染单眼图表
    // renderEyeChart(chartId, probabilities) {
    //   const chartDom = this.$refs[chartId];
    //   const myChart = echarts.init(chartDom);

    //   // 找出概率最大值的索引（即诊断结果）
    //   const maxIndex = probabilities.indexOf(Math.max(...probabilities));

    //   // 获取诊断名称
    //   const diagnosis = this.diseaseCategories[maxIndex];

    //   // 颜色列表，与比较图保持一致
    //   const colorList = [
    //     "#FF5252", // 糖尿病
    //     "#7C4DFF", // 青光眼
    //     "#448AFF", // 白内障
    //     "#FFC107", // AMD
    //     "#FF9800", // 高血压
    //     "#00BCD4", // 近视
    //     "#9C27B0", // 其他异常
    //     "#4CAF50", // 正常
    //   ];

    //   const option = {
    //     tooltip: {
    //       trigger: "axis",
    //       axisPointer: {
    //         type: "shadow",
    //       },
    //       formatter: (params) => {
    //         const dataIndex = params[0].dataIndex;
    //         const value = params[0].value;
    //         return `${this.diseaseCategories[dataIndex]}: ${value}%`;
    //       },
    //     },
    //     grid: {
    //       left: "3%",
    //       right: "4%",
    //       bottom: "3%",
    //       containLabel: true,
    //     },
    //     xAxis: {
    //       type: "category",
    //       data: this.diseaseCategories,
    //       axisLabel: {
    //         interval: 0,
    //         rotate: 45,
    //         fontSize: 12,
    //         color: function (value, index) {
    //           // 高亮显示诊断结果所在的标签
    //           if (value === diagnosis) {
    //             return "#FF5252";
    //           }
    //           return "#333";
    //         },
    //         fontWeight: function (value, index) {
    //           // 加粗显示诊断结果所在的标签
    //           if (value === diagnosis) {
    //             return "bold";
    //           }
    //           return "normal";
    //         },
    //       },
    //     },
    //     yAxis: {
    //       type: "value",
    //       axisLabel: {
    //         formatter: "{value}%",
    //       },
    //       max: 100,
    //     },
    //     series: [
    //       {
    //         name: "概率",
    //         type: "bar",
    //         data: probabilities.map((p, index) => {
    //           const value = (p * 100).toFixed(2);
    //           // 返回带有特殊样式的项
    //           return {
    //             value: value,
    //             itemStyle: {
    //               // 诊断结果用彩色，其他用半透明灰色
    //               color:
    //                 index === maxIndex
    //                   ? colorList[index]
    //                   : "rgba(150, 150, 150, 0.5)",
    //             },
    //             emphasis: {
    //               itemStyle: {
    //                 color:
    //                   index === maxIndex
    //                     ? colorList[index]
    //                     : "rgba(150, 150, 150, 0.8)",
    //               },
    //             },
    //           };
    //         }),
    //         markPoint: {
    //           data: [
    //             {
    //               name: "诊断结果",
    //               coord: [maxIndex, (probabilities[maxIndex] * 100).toFixed(2)],
    //               value: (probabilities[maxIndex] * 100).toFixed(2) + "%",
    //               itemStyle: {
    //                 color: colorList[maxIndex],
    //               },
    //               symbolSize: [50, 30],
    //               symbol: "rect",
    //               label: {
    //                 fontSize: 14,
    //                 fontWeight: "bold",
    //               },
    //             },
    //           ],
    //         },
    //       },
    //     ],
    //   };

    //   myChart.setOption(option);

    //   // 响应窗口大小变化
    //   window.addEventListener("resize", function () {
    //     myChart.resize();
    //   });
    // },

    // 生成建议
    generateSuggestion(leftIndex, rightIndex) {
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
        未知: "建议咨询专业医生进行进一步检查。",
      };

      const leftDisease = this.diseaseCategories[leftIndex] || "未知";
      const rightDisease = this.diseaseCategories[rightIndex] || "未知";

      if (leftDisease === rightDisease) {
        return suggestions[leftDisease];
      } else {
        return `左眼：${suggestions[leftDisease]}\n右眼：${suggestions[rightDisease]}`;
      }
    },

    // 报告操作
    saveReport() {
      this.$message.success("报告已保存到系统");
    },

    exportReport() {
      this.$message.success("报告已导出");
    },

    viewBatchDetail(row) {
      // 查看批量诊断中的单个详情
      this.$router.push(`/reports/detail/${row.id}`);
    },

    exportBatchReport(row) {
      this.$message.success(`ID ${row.id} 的报告已导出`);
    },

    saveAllBatchReports() {
      this.$message.success(`已保存全部 ${this.batchResults.length} 份报告`);
    },

    exportAllBatchReports() {
      this.$message.success(
        `已导出全部 ${this.batchResults.length} 份报告为PDF文件`
      );
    },

    // 历史记录操作
    viewHistoryDetail(row) {
      this.$router.push(`/reports/detail/${row.patientId}`);
    },

    exportHistoryReport(row) {
      this.$message.success(`历史记录 ID ${row.id} 的报告已导出`);
    },

    getTaskStatusText(status) {
      switch (status) {
        case "waiting":
          return "等待中";
        case "processing":
          return "处理中";
        case "completed":
          return "已完成";
        case "failed":
          return "失败";
        default:
          return "未知状态";
      }
    },

    percentageFormat(percentage) {
      return percentage + "%";
    },

    // 获取患者列表
    async fetchPatientList() {
      // 先尝试从 localStorage 读取
      const hasLocalData = this.loadPatientListFromLocalStorage();

      // 如果本地没有数据，再从服务器获取
      if (!hasLocalData) {
        try {
          const response = await request({
            method: "get",
            url: "/patients/pageNow",
            params: {
              page: 1,
              pageSize: 10,
            },
          });

          if (response.code === 200 || response.code === 1) {
            // 将后端返回的患者数据转换为前端需要的格式
            this.patientList = response.data.records.map((patient) => ({
              id: patient.patientId, // 从patientId映射到id
              name: patient.name,
              gender: patient.gender,
              age: patient.age,
              phone: patient.phoneNumber || "", // 如果API返回了phoneNumber字段
              note: patient.remarks || "", // 如果API返回了remarks字段
              leftEyeDiagnosis: patient.leftResult || "",
              rightEyeDiagnosis: patient.rightResult || "",
              leftEyeConfidence: 0, // 后端暂无此字段
              rightEyeConfidence: 0, // 后端暂无此字段
              finalDiagnosis: patient.finalResult || "",
              processTime: patient.diagnosisTime || "",
            }));

            // 保存到 localStorage
            this.savePatientListToLocalStorage();
          } else {
            this.$message.error(response.msg || "获取患者列表失败");
          }
        } catch (error) {
          console.error("获取患者列表错误:", error);
          this.$message.error("获取患者列表失败，请稍后重试");
        }
      }
    },

    // 历史记录操作
    async fetchHistoryRecords() {
      this.historyLoading = true;
      try {
        const response = await request({
          method: "get",
          url: "/patients/pageHistory",
          params: {
            page: this.historyCurrentPage,
            pageSize: this.historyPageSize,
            name: this.historySearchName || undefined,
          },
        });

        if (response.code === 0 || response.code === 1) {
          // 将API返回的数据直接赋值给历史记录，确保字段映射正确
          this.historyRecords = response.data.records.map((record) => {
            // 格式化诊断时间为更易读的格式
            let formattedTime = record.diagnosisTime;
            if (record.diagnosisTime) {
              try {
                // 尝试解析时间字符串并格式化
                const date = new Date(record.diagnosisTime);
                if (!isNaN(date.getTime())) {
                  formattedTime = `${date.getFullYear()}/${(date.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${date
                    .getDate()
                    .toString()
                    .padStart(2, "0")} ${date
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${date
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}:${date
                    .getSeconds()
                    .toString()
                    .padStart(2, "0")}`;
                }
              } catch (e) {
                console.error("日期格式化错误:", e);
              }
            }

            return {
              id: record.patientId,
              patientId: record.patientId,
              patientName: record.name || "未知", // 提供默认值避免空白
              diagnosisTime: formattedTime,
              leftEye: record.leftResult || "未诊断",
              rightEye: record.rightResult || "未诊断",
              comprehensiveDiagnosis: record.finalResult || "未给出综合诊断",
            };
          });

          // 更新总条数
          this.historyTotal = response.data.total;
        } else {
          this.$message.error(response.msg || "获取历史记录失败");
        }
      } catch (error) {
        console.error("获取历史记录错误:", error);
        this.$message.error("获取历史记录失败，请稍后重试");
      } finally {
        this.historyLoading = false;
      }
    },

    // 按姓名搜索历史记录
    searchHistoryByName() {
      this.historyCurrentPage = 1;
      this.fetchHistoryRecords();
    },

    // 重置历史记录搜索
    resetHistorySearch() {
      this.historySearchName = "";
      this.historyCurrentPage = 1;
      this.fetchHistoryRecords();
    },

    // 处理历史记录分页变化
    handleHistoryPageChange(page) {
      this.historyCurrentPage = page;
      this.fetchHistoryRecords();
    },

    // 计算文件大小的格式化方法
    formatFileSize(row, column, cellValue) {
      const size = row.size;
      if (size < 1024) {
        return size + " B";
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + " KB";
      } else {
        return (size / (1024 * 1024)).toFixed(1) + " MB";
      }
    },

    // 判断文件是否已配对
    isFilePaired(file) {
      return file.isPaired === true;
    },

    // 保存患者列表到 localStorage
    savePatientListToLocalStorage() {
      localStorage.setItem("patientList", JSON.stringify(this.patientList));
    },

    // 从 localStorage 读取患者列表
    loadPatientListFromLocalStorage() {
      const savedPatientList = localStorage.getItem("patientList");
      if (savedPatientList) {
        this.patientList = JSON.parse(savedPatientList);
        return true;
      }
      return false;
    },

    formatTime(timeInput) {
      if (!timeInput) return "";
      try {
        let date;
        // 判断传入的是否为数组
        if (Array.isArray(timeInput)) {
          // 假设数组顺序为 [year, month, day, hour, minute, second]
          const [year, month, day, hour, minute, second] = timeInput;
          // 注意：month 需要减1，因为 JavaScript 中月份从0开始
          date = new Date(year, month - 1, day, hour, minute, second);
        } else {
          date = new Date(timeInput);
        }

        if (isNaN(date.getTime())) return timeInput; // 如果日期无效，则返回原始输入

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
      } catch (error) {
        console.error("Error formatting time:", error);
        return timeInput;
      }
    },

    // 处理文件夹上传
    processFolderUpload(file, fileList) {
      // 提取文件夹名称
      const folderPath = file.raw.webkitRelativePath;
      const folderName = folderPath.split("/")[0];

      // 检查该文件夹是否已经在列表中
      const existingFolder = this.patientFolders.find(
        (folder) => folder.name === folderName
      );

      if (!existingFolder) {
        // 添加新文件夹
        this.patientFolders.push({
          name: folderName,
          files: [file.raw],
          element: file,
        });
      } else {
        // 向现有文件夹添加文件
        existingFolder.files.push(file.raw);
      }

      // 显示当前上传的文件夹情况
      this.updateFolderStatus();
    },

    // 更新文件夹状态显示
    updateFolderStatus() {
      // 清除原有的批量文件列表
      this.batchFileList = [];

      // 处理每个文件夹
      this.patientFolders.forEach((folder) => {
        // 统计图像文件数量
        const imageFiles = folder.files.filter((file) =>
          file.type.startsWith("image/")
        );
        const validFileCount = imageFiles.length;
        const isProcessable = validFileCount >= 2;

        // 创建表格数据项
        this.batchFileList.push({
          name: folder.name,
          fileCount: folder.files.length,
          validFileCount: validFileCount,
          size: folder.files.reduce((total, file) => total + file.size, 0),
          isProcessable: isProcessable,
          hasWarning: !isProcessable,
          warningMessage: isProcessable ? "" : "图像不足",
          files: folder.files,
        });
      });

      // 更新配对图像和未配对图像
      this.pairedImages = this.patientFolders.filter(
        (folder) =>
          folder.files.filter((file) => file.type.startsWith("image/"))
            .length >= 2
      );

      this.unpairedImages = this.patientFolders.filter(
        (folder) =>
          folder.files.filter((file) => file.type.startsWith("image/")).length <
          2
      );
    },

    // 浏览文件夹方法
    browseFolders() {
      const input = document.createElement("input");
      input.type = "file";
      input.webkitdirectory = true;
      input.directory = true;
      input.multiple = true;

      input.onchange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // 按文件夹分组文件
        const folderMap = new Map();

        files.forEach((file) => {
          const path = file.webkitRelativePath;
          const parts = path.split("/");

          if (parts.length < 2) return; // 跳过没有路径的文件

          const folderName = parts[0]; // 顶级文件夹名称

          if (!folderMap.has(folderName)) {
            folderMap.set(folderName, []);
          }

          folderMap.get(folderName).push(file);
        });

        // 存储已上传的文件夹名称
        const existingFolderNames = this.patientFolders.map(
          (folder) => folder.name
        );
        // 标记是否有重复上传
        let hasDuplicates = false;

        // 处理每个文件夹并添加到列表
        folderMap.forEach((files, folderName) => {
          // 检查该文件夹是否已经在列表中
          if (existingFolderNames.includes(folderName)) {
            hasDuplicates = true;
            return; // 跳过已存在的文件夹
          }

          // 添加新文件夹
          this.patientFolders.push({
            name: folderName,
            files: files,
            element: { raw: files[0] }, // 保存第一个文件作为代表
          });
        });

        // 如果有重复文件夹，显示提示
        if (hasDuplicates) {
          this.$message.warning("已跳过重复的文件夹");
        }

        // 更新界面显示
        this.updateFolderStatus();
      };

      // 触发文件选择器
      input.click();
    },

    // 文件上传相关方法
    handlePreview(file) {
      // 预览文件，无需操作
    },

    handleRemove(file, fileList) {
      // 移除文件
      this.batchFileList = fileList;
      this.analyzeBatchFiles();
    },

    handleSuccess(response, file, fileList) {
      // 上传成功，不显示消息提示
      this.batchFileList = fileList;
      this.analyzeBatchFiles();
    },

    handleError(err, file, fileList) {
      // 上传失败，不显示消息提示
      console.error("Upload error:", err);
    },

    handleExceed(files, fileList, file) {
      this.$message.warning(
        `当前限制选择 100 个文件，本次选择了 ${files.length} 个文件，请减少文件数量后上传`
      );
    },

    // 添加自定义上传方法
    customUpload(options) {
      const { file, onSuccess, onError } = options;

      // 创建FormData
      const formData = new FormData();
      formData.append("folder", file); // 根据API参数名是folder

      // 发送请求
      request({
        method: "post",
        url: "/common/upload/folder",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then((response) => {
          if (response.code === 1 || response.code === 200) {
            onSuccess(response);
          } else {
            onError(new Error(response.msg || "上传失败"));
          }
        })
        .catch((error) => {
          console.error("Upload error:", error);
          onError(error);
        });
    },

    // 处理拖拽文件夹
    handleDragOver(event) {
      event.preventDefault();
      this.isDragOver = true;
    },

    handleDragLeave(event) {
      event.preventDefault();
      this.isDragOver = false;
    },

    handleDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragOver = false;

      // 检查是否有目录类型的数据
      const items = event.dataTransfer.items;
      if (!items || items.length === 0) {
        return;
      }

      let hasDirectory = false;
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry && entry.isDirectory) {
          hasDirectory = true;
          break;
        }
      }

      if (!hasDirectory) {
        this.$message.warning("请拖拽文件夹而不是单个文件");
        return;
      }

      // 收集所有文件夹条目
      const folderEntries = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry && entry.isDirectory) {
          folderEntries.push(entry);
        }
      }

      // 开始处理文件夹
      this.processFolders(folderEntries);
    },

    // 处理通过拖拽获取的文件夹条目
    processFolders(folderEntries) {
      if (folderEntries.length === 0) {
        return;
      }

      // 获取已有文件夹名称
      const existingFolderNames = this.patientFolders.map(
        (folder) => folder.name
      );

      // 过滤掉已经存在的文件夹
      const uniqueFolderEntries = folderEntries.filter(
        (entry) => !existingFolderNames.includes(entry.name)
      );

      // 如果有重复文件夹，显示提示
      if (uniqueFolderEntries.length < folderEntries.length) {
        this.$message.warning("已跳过重复的文件夹");
      }

      // 如果没有新文件夹要处理，直接返回
      if (uniqueFolderEntries.length === 0) {
        return;
      }

      // 用于跟踪处理进度
      let processedCount = 0;
      const totalCount = uniqueFolderEntries.length;

      // 处理每个文件夹
      uniqueFolderEntries.forEach((folderEntry) => {
        this.processFolderEntry(folderEntry).then(() => {
          processedCount++;
          if (processedCount === totalCount) {
            // 所有文件夹都处理完成
            this.updateFolderStatus();
          }
        });
      });
    },

    // 处理单个文件夹条目
    async processFolderEntry(folderEntry) {
      return new Promise((resolve) => {
        const folderName = folderEntry.name;
        const files = [];

        // 递归读取文件夹内容
        const readEntries = (directoryReader) => {
          directoryReader.readEntries(
            (entries) => {
              if (entries.length === 0) {
                // 读取完毕，添加到患者文件夹列表
                if (files.length > 0) {
                  // 添加新文件夹
                  this.patientFolders.push({
                    name: folderName,
                    files: files,
                    element: { raw: files[0] }, // 保存第一个文件作为代表
                  });
                }
                resolve();
              } else {
                // 继续处理entries
                let pendingEntries = entries.length;

                entries.forEach((entry) => {
                  if (entry.isFile) {
                    entry.file(
                      (file) => {
                        // 不要直接修改webkitRelativePath，而是添加自定义属性
                        const fileWithPath = file;
                        // 使用自定义属性存储路径信息
                        fileWithPath.customRelativePath = `${folderName}/${file.name}`;
                        files.push(fileWithPath);

                        if (--pendingEntries === 0) {
                          readEntries(directoryReader);
                        }
                      },
                      () => {
                        if (--pendingEntries === 0) {
                          readEntries(directoryReader);
                        }
                      }
                    );
                  } else if (entry.isDirectory) {
                    // 如果是子文件夹，递归处理
                    const subDirectoryReader = entry.createReader();
                    readEntries(subDirectoryReader);

                    if (--pendingEntries === 0) {
                      readEntries(directoryReader);
                    }
                  } else {
                    if (--pendingEntries === 0) {
                      readEntries(directoryReader);
                    }
                  }
                });
              }
            },
            (error) => {
              console.error("读取目录失败:", error);
              resolve();
            }
          );
        };

        // 开始读取文件夹
        const directoryReader = folderEntry.createReader();
        readEntries(directoryReader);
      });
    },
  },
  mounted() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      this.$router.push("/login");
    }

    // 获取患者列表
    this.fetchPatientList();

    // 获取历史诊断记录
    this.fetchHistoryRecords();
  },
};
</script>
<style lang="scss" scoped>
/* 定义基础颜色和变量 */
$primary-color: #409eff; // Element Plus Primary Color
$danger-color: #f56c6c; // Element Plus Danger Color
$warning-color: #e6a23c; // Element Plus Warning Color
$success-color: #67c23a; // Element Plus Success Color
$border-color-base: #dcdfe6; // 边框基础色
$background-color-base: #f4f6f8; // 页面背景色
$text-color-primary: #303133; // 主要文字颜色
$text-color-secondary: #909399; // 次要文字颜色
$spacing-base: 20px;
$spacing-small: 10px;
$card-padding: 15px;

.diagnosis-container {
  // 整体容器设置最大宽度，居中，并提供一定的上下外边距
  max-width: 1400px;
  margin: $spacing-base auto;
  padding: $spacing-base;
  background-color: #fff; // 背景色为白色
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05); // 轻微阴影，增加层次感

  /* --- 患者信息录入链接/提示区 --- */
  .patient-info-section {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-base;
    padding: $spacing-small;
    border-bottom: 1px solid #ebeef5;

    .el-button {
      .required-field {
        color: $danger-color;
        font-size: 16px;
        margin-right: 2px;
        margin-left: -5px; /* 调整星号位置 */
      }
    }

    .info-tip {
      margin-left: $spacing-base;
      color: $warning-color;
      font-size: 14px;
      padding: 5px 10px;
      background-color: mix(#fff, $warning-color, 95%);
      border-radius: 4px;
      border: 1px solid mix(#fff, $warning-color, 85%);
    }
  }

  /* --- 标签页定制 --- */
  .el-tabs--card > .el-tabs__header {
    margin-bottom: $spacing-base;
    border-bottom: 2px solid $primary-color;

    .el-tabs__item {
      font-weight: 600;
      color: $text-color-primary;
      border-bottom-color: $border-color-base;

      &.is-active {
        color: $primary-color;
        border-bottom-color: $primary-color;
        background-color: $background-color-base;
      }
    }
  }

  /* --- 患者选择区 --- */
  .patient-selection {
    margin-bottom: $spacing-base;

    .selection-form {
      .el-form-item {
        margin-right: $spacing-base;
        margin-bottom: 0;
        .el-select {
          width: 250px; // 统一选择框宽度
        }
      }
    }
  }

  .empty-patient-tip {
    margin-bottom: $spacing-base;
    .el-alert {
      padding: $spacing-small;
    }
  }

  /* --- 上传区域（个人/批量）--- */
  .upload-section {
    margin-bottom: $spacing-base;
    padding-top: $spacing-base;
    border-top: 1px dashed $border-color-base;

    .el-row {
      margin-bottom: $spacing-base;
    }

    .eye-upload-container {
      padding: $spacing-small;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      height: 100%; // 确保左右等高

      .upload-title {
        font-size: 16px;
        color: $primary-color;
        margin-bottom: $spacing-small;
        padding-bottom: 5px;
        border-bottom: 1px solid #f2f6fc;
      }

      .eye-uploader {
        width: 100%;

        :deep(.el-upload-dragger) {
          width: 100%;
          padding: $spacing-base;
          height: 250px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border: 2px dashed $border-color-base;
          transition: border-color 0.3s;
          background-color: #fafafa;

          &:hover {
            border-color: $primary-color;
          }

          .upload-icon {
            font-size: 40px;
            color: $text-color-secondary;
            margin-bottom: 10px;
          }

          .upload-text {
            color: $text-color-primary;
            font-size: 16px;
            font-weight: 600;
          }

          .upload-tip {
            color: $text-color-secondary;
            font-size: 12px;
            margin-top: 5px;
          }
        }
      }

      .eye-image {
        max-height: 250px;
        width: auto;
        max-width: 100%;
        display: block;
        border-radius: 4px;
      }

      .image-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: $spacing-small;
        .image-name {
          font-size: 12px;
          color: $text-color-secondary;
          max-width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    /* 批量上传容器样式 */
    .batch-upload-container {
      cursor: pointer;
      padding: $spacing-base * 2;
      border: 2px dashed $border-color-base;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: border-color 0.3s, background-color 0.3s;
      background-color: #fafafa;
      margin-bottom: $spacing-base;

      &.drag-over {
        border-color: $primary-color;
        background-color: mix($primary-color, #fff, 10%);
      }

      .upload-icon {
        font-size: 48px;
        color: $primary-color;
        margin-bottom: 10px;
      }

      .upload-text {
        color: $text-color-primary;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 5px;
      }

      .upload-tip {
        color: $text-color-secondary;
        font-size: 14px;
        text-align: center;
      }
    }

    .batch-preview {
      .preview-title {
        font-size: 16px;
        color: $text-color-primary;
        margin-bottom: $spacing-small;
      }

      .unpaired-list {
        margin-top: 5px;
        .unpaired-item {
          display: inline-block;
          margin-right: $spacing-small;
          padding: 2px 5px;
          background-color: mix(#fff, $warning-color, 90%);
          border-radius: 3px;
          font-size: 12px;
          color: $warning-color;
        }
      }

      .batch-file-list {
        margin-top: $spacing-base;

        .file-list-title {
          font-size: 14px;
          color: $text-color-secondary;
          margin-bottom: 5px;
        }

        .count-separator {
          color: $text-color-secondary;
          margin: 0 3px;
        }

        .warning-text.mini-warning {
          color: $warning-color;
          font-size: 10px;
          margin-top: 2px;
        }
      }
    }

    .batch-help {
      margin-top: $spacing-base;
      .el-alert p {
        margin: 5px 0;
        line-height: 1.5;
        font-size: 14px;
        color: $text-color-primary;
      }
    }

    .upload-actions {
      display: flex;
      justify-content: center;
      margin-top: $spacing-base * 1.5;

      .el-button + .el-button {
        margin-left: $spacing-base;
      }
    }
  }

  /* --- 患者诊断列表/结果区标题 --- */
  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: $primary-color;
    margin-bottom: $spacing-small;
    padding-bottom: 5px;
    border-bottom: 2px solid $primary-color;
    margin-top: $spacing-base;
  }

  /* --- 患者诊断列表 --- */
  .patient-diagnosis-section {
    .patient-diagnosis-card {
      margin-top: $spacing-base;
    }

    .el-table {
      font-size: 13px;
      color: $text-color-primary;

      :deep(.el-table__header-wrapper) th {
        background-color: #f5f7fa;
        color: #606266;
        font-weight: 600;
      }

      .waiting-diagnosis {
        color: $text-color-secondary;
        font-style: italic;
      }

      .confidence-text {
        font-size: 11px;
        color: $text-color-secondary;
        margin-top: 2px;
      }

      .table-actions {
        display: flex;
        gap: 5px;
      }
    }

    .empty-patient-list {
      padding: $spacing-base * 2;
      .el-empty {
        padding: 0;
      }
    }
  }

  /* --- 诊断结果展示区 --- */
  .results-section {
    margin-top: $spacing-base * 2;
    padding-top: $spacing-base;
    border-top: 1px solid #ebeef5;

    /* 结果卡片通用样式 */
    .el-card {
      margin-bottom: $spacing-base;
    }
    .result-header,
    .batch-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: $text-color-primary;
    }

    /* 单图结果样式 */
    .single-result {
      .patient-info-card {
        margin-bottom: $spacing-base;
        .patient-info-header {
          font-weight: 600;
          color: $primary-color;
        }
        .patient-info-content {
          display: flex;
          flex-wrap: wrap;
          .info-item {
            width: 50%;
            margin-bottom: 5px;
            font-size: 14px;
            .info-label {
              font-weight: bold;
              color: $text-color-secondary;
              margin-right: 5px;
            }
          }
        }
      }

      .combined-result-card {
        .combined-result-content {
          display: flex;
          gap: $spacing-base * 2;

          h3 {
            font-size: 16px;
            color: $primary-color;
            margin-bottom: $spacing-small;
          }

          .combined-diagnosis,
          .diagnosis-suggestion {
            flex: 1;
          }

          .final-diagnosis {
            font-size: 18px;
            font-weight: bold;
            color: $danger-color;
            padding: 10px;
            border: 1px dashed $danger-color;
            border-radius: 4px;
            background-color: mix($danger-color, #fff, 5%);
          }

          .diagnosis-suggestion p {
            font-size: 14px;
            color: $text-color-primary;
            line-height: 1.6;
          }
        }
      }
    }

    /* 批量结果样式 */
    .batch-results {
      .batch-table {
        margin-top: $spacing-base;
      }
    }
  }

  /* --- 历史记录区 --- */
  .history-section {
    margin-top: $spacing-base * 2;
    padding-top: $spacing-base;
    border-top: 1px solid #ebeef5;

    .history-search {
      padding: $spacing-small 0;
      border-bottom: 1px solid #f2f6fc;
      margin-bottom: $spacing-base;

      .el-form-item {
        margin-right: $spacing-base;
        margin-bottom: $spacing-small;
      }

      .search-result-info {
        margin-top: $spacing-small;
      }
    }

    .history-card {
      .pagination-container {
        display: flex;
        justify-content: flex-end;
        margin-top: $spacing-base;
      }
    }
  }

  /* --- 对话框中的表单样式 --- */
  .el-dialog {
    :deep(.el-dialog__title) {
      font-weight: 600;
      color: $primary-color;
    }
    .el-form-item {
      .required-field {
        color: $danger-color;
        font-size: 14px;
        margin-right: 5px;
      }
    }
  }

  /* --- 处理进度对话框样式 --- */
  .processing-content {
    .processing-info {
      p {
        font-size: 14px;
        line-height: 1.8;
        color: $text-color-primary;
      }
      p:first-child {
        font-weight: 600;
        color: $primary-color;
      }
    }

    .el-progress {
      margin: $spacing-base 0;
    }

    .task-queue {
      margin-top: $spacing-base;
      padding-top: $spacing-small;
      border-top: 1px solid #f2f6fc;

      h4 {
        font-size: 14px;
        color: $text-color-secondary;
        margin-bottom: $spacing-small;
      }

      .queue-items {
        max-height: 200px;
        overflow-y: auto;
        padding-right: 5px;

        .queue-item {
          display: flex;
          justify-content: space-between;
          padding: 5px $spacing-small;
          border-bottom: 1px dotted #ebeef5;
          font-size: 13px;

          &.active {
            background-color: mix($primary-color, #fff, 10%);
            border-radius: 3px;
          }

          .task-status {
            font-weight: 600;
          }

          &.completed .task-status {
            color: $success-color;
          }
          &.processing .task-status {
            color: $primary-color;
          }
          &.failed .task-status {
            color: $danger-color;
          }
        }
      }
    }
  }
}
</style>
