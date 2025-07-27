<template>
  <div class="sidebar-container">
    <!-- Logo 区域 -->
    <div class="logo-container" @click="() => $router.push('/')" title="首页">
      <img src="/icon.svg" alt="Logo" class="sidebar-logo" />
      <h1 class="sidebar-title">博士问卷分析</h1>
    </div>

    <!-- 分割线 -->
    <div class="menu-divider"></div>
    
    <!-- 第一块菜单 -->
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      router
    >
      <el-menu-item
        v-for="item in menuGroup1"
        :key="item.index"
        :index="item.index"
      >
        <el-icon class="menu-item-icon">
          <component :is="item.icon" />
        </el-icon>
        <template #title>
          <span>{{ item.title }}</span>
        </template>
      </el-menu-item>
    </el-menu>

    <!-- 分割线 -->
    <div class="menu-divider"></div>

    <!-- 第二块菜单 -->
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      router
    >
      <el-menu-item
        v-for="item in menuGroup2"
        :key="item.index"
        :index="item.index"
      >
        <el-icon class="menu-item-icon">
          <component :is="item.icon" />
        </el-icon>
        <template #title>
          <span>{{ item.title }}</span>
        </template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { shallowRef, computed } from 'vue'
import { useRoute } from 'vue-router'
import { View, MapLocation, OfficeBuilding, Help, Link, Warning, DataAnalysis } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)

const menuGroup1 = shallowRef([
  { index: '/details', title: '技术细节浏览', icon: View },
])

const menuGroup2 = shallowRef([
  { index: '/GeoFactorPage', title: '地区因素分析', icon: MapLocation },
  { index: '/MentalHealthPage', title: '心理健康分析', icon: OfficeBuilding },
  { index: '/TurtorAndAcademicResearch', title: '学术参与分析', icon: Link },
  { index: '/AcademicAndProspect', title: '工作前景分析', icon: Help },
  { index: '/MotivationAndReviewAnalysis', title: '动机与回顾分析', icon: DataAnalysis },
  { index: '/CovidImpact', title: '疫情影响分析', icon: Warning },
])
</script>

<style scoped>
.sidebar-container {
  --sidebar-bg-color: #2d3a4b;
  --sidebar-width: 210px;
  --sidebar-text-color: #bfcbd9;
  --sidebar-text-active-color: #ffffff;
  --sidebar-menu-item-hover-bg: #263445;
  --sidebar-menu-item-active-bg: #409eff;

  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--sidebar-bg-color);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

.logo-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  height: 60px;
  padding: 0 20px;
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.sidebar-title {
  color: var(--sidebar-text-active-color);
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

/* 菜单区域统一样式 */
.el-menu-vertical {
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;

  --el-menu-bg-color: transparent;
  --el-menu-text-color: var(--sidebar-text-color);
  --el-menu-hover-bg-color: var(--sidebar-menu-item-hover-bg);
  --el-menu-active-color: var(--sidebar-text-active-color);
  --el-menu-item-height: 56px;
}

/* 隐藏滚动条 */
.el-menu-vertical::-webkit-scrollbar {
  display: none;
}
.el-menu-vertical {
  scrollbar-width: none;
}

/* 激活菜单项 */
:deep(.el-menu-item.is-active) {
  background-color: var(--sidebar-menu-item-active-bg) !important;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

/* 菜单图标 */
.menu-item-icon {
  font-size: 18px;
  margin-right: 12px;
  color: currentColor;
}

/* 分割线 */
.menu-divider {
  height: 1px;
  background-color: var(--sidebar-menu-item-hover-bg);
  margin: 12px 0;
  border-radius: 1px;
}
</style>
