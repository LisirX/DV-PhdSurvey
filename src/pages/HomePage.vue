<template>
  <div class="page-wrapper">
    <!-- 1. 主视觉与核心内容区 -->
    <main class="hero-container">
      <!-- 动态网格背景 -->
      <div class="grid-background"></div>

      <div class="hero-content">
        <h1 class="hero-title">数据洞察，重塑认知</h1>
        <p class="hero-subtitle">
          一个为深度分析而生的交互式可视化平台。我们致力于对博士生现状的深度分析，洞悉社会现象背后的根本原因。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" round @click="goTo('/GeoFactorPage')">
            <el-icon class="el-icon--left">
              <DataAnalysis />
            </el-icon>
            进入地理因素分析
          </el-button>
          <el-button size="large" round plain @click="goTo('/details')">
            <el-icon class="el-icon--left">
              <View />
            </el-icon>
            查阅详细技术细节
          </el-button>
        </div>
      </div>
    </main>

    <!-- 2. 页脚信息区 -->
    <footer class="page-footer">
      <div class="footer-content">
        <div class="footer-column">
          <h4>制作与开发</h4>
          <p>肖兴程和他的队友们</p>
        </div>
        <div class="footer-column">
          <h4>项目源码</h4>
          <a href="https://github.com/LisirX/DV-PhdSurvey" target="_blank" rel="noopener noreferrer">
            <svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em" style="margin-right: 8px;">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12">
              </path>
            </svg>
            GitHub Repository
          </a>
        </div>
        <div class="footer-column data-sources">
          <h4>数据来源 (Data Sources)</h4>
          <ul>
            <li><a href="https://figshare.com/articles/dataset/Nature_Graduate_Survey_2017/5480716" target="_blank"
                rel="noopener noreferrer">Nature Graduate Survey 2017</a></li>
            <li><a href="https://figshare.com/s/74a5ea79d76ad66a8af8" target="_blank" rel="noopener noreferrer">Nature
                Graduate Survey 2019</a></li>
            <li><a href="https://figshare.com/articles/dataset/Nature_Careers_Graduate_Survey_2022/21277575"
                target="_blank" rel="noopener noreferrer">Nature Careers Graduate Survey 2022</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© {{ new Date().getFullYear() }} 数据可视化平台. All Rights Reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { DataAnalysis, View } from '@element-plus/icons-vue';

const router = useRouter();
const goTo = (path) => router.push(path);
</script>

<style scoped>
/* Google Fonts - 可选，但强烈推荐，以获得最佳字体效果 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');

:root {
  --primary-color: #3b82f6;
  /* A slightly more modern blue */
  --text-primary: #111827;
  /* Dark gray for text */
  --text-secondary: #4b5563;
  /* Lighter gray for subtitles */
  --background-color: #ffffff;
  --grid-color: #e5e7eb;
}

.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  /* 确保页脚能“粘”在底部 */
  background-color: var(--background-color);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* --- 主视觉区域 --- */
.hero-container {
  flex-grow: 1;
  /* 占据所有可用空间，将页脚推向底部 */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 6rem 2rem;
  position: relative;
  overflow: hidden;
  /* 隐藏网格背景的超出部分 */
}

/* --- 动态网格背景 --- */
.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent);
  animation: pan-grid 20s linear infinite;
  z-index: 0;
}

@keyframes pan-grid {
  from {
    background-position: 0 0;
  }

  to {
    background-position: -50px -50px;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.hero-title {
  font-size: 4rem;
  /* 增大字号以增强冲击力 */
  font-weight: 800;
  letter-spacing: -0.05em;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 1.5rem;
  /* 平滑的渐变文字效果 */
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 650px;
  margin: 0 auto 2.5rem auto;
}

.hero-actions .el-button {
  padding: 1.25rem 1.75rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.hero-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
}

.el-icon--left {
  margin-right: 8px;
}

/* --- 页脚 --- */
.page-footer {
  padding: 3rem 5%;
  background-color: #f9fafb;
  border-top: 1px solid var(--grid-color);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto 3rem auto;
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--grid-color);
}

.footer-column h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-column p,
.footer-column a,
.footer-column li {
  font-size: 1rem;
  color: var(--text-primary);
  text-decoration: none;
  margin-bottom: 0.5rem; /* 为列表项添加间距 */
}

.footer-column a:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

/* 新增：为数据来源列表专门设置样式 */
.data-sources ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.data-sources li {
  position: relative;
  padding-left: 20px; /* 为前面的小方块留出空间 */
}

/* 新增：用伪元素创建漂亮的小方块作为列表标记 */
.data-sources li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px; /* 微调垂直位置 */
  width: 6px;
  height: 6px;
  background-color: var(--primary-color);
  border-radius: 2px;
  opacity: 0.5;
}

.footer-bottom {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.8rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hero-actions .el-button {
    width: 100%;
    margin-right: 0;
  }
}
</style>
