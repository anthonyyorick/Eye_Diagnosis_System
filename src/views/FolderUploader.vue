<template>
  <div
    class="folder-uploader"
    @dragover.prevent
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    :class="{ 'drag-over': isDragOver }"
  >
    <div class="folder-uploader-content" @click="onClickUpload">
      <el-icon class="upload-icon"><Folder /></el-icon>
      <div class="upload-text">点击或拖拽多个文件夹到此区域上传</div>
      <div class="upload-tip">
        支持批量文件夹上传，每个文件夹应包含一位患者的左右眼图像（JPG/PNG格式）
      </div>
    </div>
    <input
      ref="folderInput"
      type="file"
      webkitdirectory
      directory
      multiple
      style="display: none"
      @change="onInputChange"
    />
  </div>
</template>

<script>
import { Folder } from "@element-plus/icons-vue";

export default {
  name: "FolderUploader",
  components: {
    Folder,
  },
  props: {
    // 是否允许多个文件夹
    multiple: {
      type: Boolean,
      default: true,
    },
    // 文件类型限制
    accept: {
      type: String,
      default: "image/*",
    },
    // 文件大小限制（MB）
    maxSize: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      isDragOver: false,
    };
  },
  methods: {
    // 用户点击上传区域
    onClickUpload() {
      this.$refs.folderInput.click();
    },

    // 处理文件输入变化
    onInputChange(event) {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      // 处理选择的文件
      this.processInputFiles(files);

      // 重置input，以便可以再次选择相同的文件夹
      event.target.value = "";
    },

    // 拖放相关事件
    onDragEnter() {
      this.isDragOver = true;
    },

    onDragLeave() {
      this.isDragOver = false;
    },

    onDrop(event) {
      this.isDragOver = false;

      // 获取拖放的文件
      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) return;

      // 检查是否有文件夹结构
      const hasWebkitRelativePath = files.some(
        (file) => file.webkitRelativePath
      );

      if (hasWebkitRelativePath) {
        // 如果有文件夹结构，直接处理
        this.processInputFiles(files);
      } else {
        // 如果没有文件夹结构，尝试使用DataTransferItemList API
        const items = event.dataTransfer.items;
        if (items) {
          let folderEntryCount = 0;

          for (let i = 0; i < items.length; i++) {
            const entry =
              items[i].webkitGetAsEntry && items[i].webkitGetAsEntry();
            if (entry && entry.isDirectory) {
              folderEntryCount++;
              this.processDirectoryEntry(entry);
            }
          }

          if (folderEntryCount > 0) {
            this.$emit("processing-start", folderEntryCount);
          } else {
            // 如果没有检测到文件夹，提示用户
            this.$emit("error", "请拖放文件夹而不是单个文件");
          }
        }
      }
    },

    // 处理输入的文件（从input或拖放）
    processInputFiles(files) {
      // 提示开始处理
      this.$emit("processing-start", files.length);

      // 按文件夹分组文件
      const folderMap = new Map();

      // 遍历文件并按文件夹分组
      files.forEach((file) => {
        if (!file.webkitRelativePath) return;

        const path = file.webkitRelativePath;
        const parts = path.split("/");

        if (parts.length < 2) return;

        const folderName = parts[0];

        if (!folderMap.has(folderName)) {
          folderMap.set(folderName, []);
        }

        // 验证文件类型和大小
        const isValidType = file.type.startsWith("image/");
        const isValidSize = file.size <= this.maxSize * 1024 * 1024;

        // 保存文件及其验证状态
        folderMap.get(folderName).push({
          file: file,
          isValid: isValidType && isValidSize,
          invalidReason: !isValidType
            ? "非图像文件"
            : !isValidSize
            ? "文件过大"
            : null,
        });
      });

      // 处理每个文件夹
      const folders = [];

      folderMap.forEach((files, folderName) => {
        // 创建文件夹对象
        const validFiles = files.filter((f) => f.isValid).map((f) => f.file);
        const invalidFiles = files.filter((f) => !f.isValid);

        folders.push({
          name: folderName,
          files: files.map((f) => f.file),
          validFiles: validFiles,
          invalidFiles: invalidFiles.map((f) => ({
            name: f.file.name,
            reason: f.invalidReason,
          })),
          isProcessable: validFiles.length >= 2,
        });
      });

      // 发送处理结果
      this.$emit("folders-processed", folders);
    },

    // 处理目录条目（使用FileSystem API）
    processDirectoryEntry(directoryEntry) {
      const folderName = directoryEntry.name;
      const folderFiles = [];
      const invalidFiles = [];

      // 发送进度更新
      this.$emit("processing-folder", folderName);

      // 递归读取目录
      this.readDirectoryEntries(
        directoryEntry,
        folderFiles,
        invalidFiles,
        () => {
          // 处理完成后，创建文件夹对象
          const folder = {
            name: folderName,
            files: folderFiles,
            validFiles: folderFiles.filter(
              (file) =>
                file.type.startsWith("image/") &&
                file.size <= this.maxSize * 1024 * 1024
            ),
            invalidFiles: invalidFiles,
            isProcessable:
              folderFiles.filter(
                (file) =>
                  file.type.startsWith("image/") &&
                  file.size <= this.maxSize * 1024 * 1024
              ).length >= 2,
          };

          // 发送文件夹处理完成事件
          this.$emit("folder-processed", folder);
        }
      );
    },

    // 读取目录中的所有条目
    readDirectoryEntries(directoryEntry, folderFiles, invalidFiles, callback) {
      const directoryReader = directoryEntry.createReader();
      const readEntries = () => {
        directoryReader.readEntries(
          (entries) => {
            if (entries.length === 0) {
              // 所有条目都已读取完毕
              callback && callback();
            } else {
              // 处理这批条目
              let pendingCount = entries.length;

              entries.forEach((entry) => {
                if (entry.isFile) {
                  // 处理文件
                  entry.file(
                    (file) => {
                      // 为文件添加路径信息
                      file.webkitRelativePath = `${directoryEntry.name}/${file.name}`;

                      // 验证文件类型和大小
                      const isValidType = file.type.startsWith("image/");
                      const isValidSize =
                        file.size <= this.maxSize * 1024 * 1024;

                      if (isValidType && isValidSize) {
                        folderFiles.push(file);
                      } else {
                        invalidFiles.push({
                          name: file.name,
                          reason: !isValidType ? "非图像文件" : "文件过大",
                        });
                      }

                      // 减少待处理计数
                      pendingCount--;
                      if (pendingCount === 0) {
                        // 继续读取下一批
                        readEntries();
                      }
                    },
                    (error) => {
                      console.error(`读取文件失败: ${error}`);
                      pendingCount--;
                      if (pendingCount === 0) {
                        readEntries();
                      }
                    }
                  );
                } else if (entry.isDirectory) {
                  // 递归处理子目录
                  this.readDirectoryEntries(
                    entry,
                    folderFiles,
                    invalidFiles,
                    () => {
                      pendingCount--;
                      if (pendingCount === 0) {
                        readEntries();
                      }
                    }
                  );
                } else {
                  pendingCount--;
                  if (pendingCount === 0) {
                    readEntries();
                  }
                }
              });
            }
          },
          (error) => {
            console.error(`读取目录失败: ${error}`);
            callback && callback();
          }
        );
      };

      // 开始读取目录
      readEntries();
    },
  },
};
</script>

<style scoped>
.folder-uploader {
  width: 100%;
  height: 250px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.folder-uploader:hover {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.06);
}

.folder-uploader.drag-over {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.folder-uploader-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.upload-icon {
  font-size: 64px;
  color: #409eff;
  margin-bottom: 20px;
}

.upload-text {
  font-size: 18px;
  color: #606266;
  margin-bottom: 10px;
  font-weight: 500;
}

.upload-tip {
  font-size: 14px;
  color: #909399;
  max-width: 80%;
  text-align: center;
  line-height: 1.5;
}
</style>
