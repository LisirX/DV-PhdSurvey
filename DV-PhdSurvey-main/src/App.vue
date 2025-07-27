<template>
  <div class="app-layout">
    <!-- 左侧导航栏 (固定宽度，不滚动) -->
    <NavigatorComponent class="app-sidebar" />

    <!-- 右侧主内容区 (占据剩余空间，且自身可滚动) -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import NavigatorComponent from './components/NavigatorComponent.vue';
import { RouterView } from 'vue-router';
</script>

<style>
/* --- 全局样式重置与基础设置 --- */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden; /* 关键：禁止 body 级别的滚动条 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

/* --- 应用主布局 --- */
.app-layout {
  display: flex;
  height: 100vh; /* 整个布局高度占满视窗 */
  width: 100vw;  /* 整个布局宽度占满视窗 */
  background-color: #f0f2f5; /* 背景色 */
}

/* --- 侧边栏样式 --- */
.app-sidebar {
  /*
    flex-shrink: 0 意味着在空间不足时，此元素不会被压缩。
    这确保了侧边栏宽度始终固定。
  */
  flex-shrink: 0; 
  /* 假设您的 NavigatorComponent 宽度是 210px，这里无需再设置 width */
  /* width: 210px; */ 
  height: 100vh; /* 高度占满 */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  z-index: 10; /* 确保在内容之上 */
}

/* --- 主内容区样式 (核心修复) --- */
.main-content {
  /*
    flex-grow: 1 意味着此元素将占据所有剩余的可用空间。
  */
  flex-grow: 1;
  height: 100vh; /* 高度占满 */
  
  /* 
    overflow-y: auto 是最关键的属性。
    它表示：当内容超出此容器的高度时，仅在此容器内部显示垂直滚动条。
  */
  overflow-y: auto;
  
  /* 
    为内容添加一些内边距，使其不会紧贴边缘。
    注意：这里是主内容区内部的 padding，不会影响布局。
  */
  padding: 24px;
  box-sizing: border-box; /* 确保 padding 不会增加容器的总宽度 */
}

/* --- 滚动条美化 (可选，但推荐) --- */
.main-content::-webkit-scrollbar {
  width: 8px;
}
.main-content::-webkit-scrollbar-track {
  background: #f7f9fc;
}
.main-content::-webkit-scrollbar-thumb {
  background-color: #cdd2d8;
  border-radius: 10px;
  border: 2px solid #f7f9fc;
}
.main-content::-webkit-scrollbar-thumb:hover {
  background-color: #a8b0bc;
}
</style>