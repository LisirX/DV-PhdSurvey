<template>
    <div class="tech-details-container">
        <header class="page-header">
            <h1 class="main-title">技术架构与实现细节</h1>
            <p class="subtitle">深入了解本数据可视化平台背后的技术栈、设计模式与核心实现。</p>
        </header>

        <div class="content-wrapper">
            <!-- 技术栈概览 -->
            <section class="tech-section">
                <h2 class="section-title">
                    <el-icon>
                        <Cpu />
                    </el-icon>
                    技术栈 (Tech Stack)
                </h2>
                <div class="tech-stack-grid">
                    <div class="tech-item" v-for="tech in techStack" :key="tech.name">
                        <img :src="tech.logo" :alt="`${tech.name} Logo`" class="tech-logo" />
                        <div class="tech-info">
                            <h3 class="tech-name">{{ tech.name }}</h3>
                            <p class="tech-description">{{ tech.description }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 架构设计 -->
            <section class="tech-section">
                <h2 class="section-title">
                    <el-icon>
                        <Connection />
                    </el-icon>
                    架构设计 (Architecture)
                </h2>
                <el-timeline>
                    <el-timeline-item timestamp="前端框架" placement="top">
                        <el-card>
                            <h4 v-text="'Vue 3 Composition API & &lt;script setup&gt;'"></h4>
                            <p>采用 Vue 3 最新的组合式 API 和 <code>&lt;script setup&gt;</code>
                                语法糖，实现了更高效、更内聚的组件逻辑组织，极大提升了代码的可读性和可维护性。</p>
                        </el-card>
                    </el-timeline-item>
                    <el-timeline-item timestamp="响应式系统" placement="top">
                        <el-card>
                            <h4>数据驱动视图</h4>
                            <p>严格遵循数据驱动的开发模式。所有图表和UI元素都由响应式状态 (<code>ref</code>, <code>computed</code>)
                                驱动。通过修改数据，视图会自动、高效地更新，并带有平滑的过渡动画。</p>
                        </el-card>
                    </el-timeline-item>
                    <el-timeline-item timestamp="组件化设计" placement="top">
                        <el-card>
                            <h4>高内聚、低耦合的组件</h4>
                            <p>将复杂的UI拆分为一系列可复用的组件（如各种图表组件、导航栏、页脚等）。通过 Props 和 Events (或 <code>v-model</code>)
                                进行父子组件通信，确保了组件的独立性和可测试性。</p>
                        </el-card>
                    </el-timeline-item>
                    <el-timeline-item timestamp="数据抽象层" placement="top">
                        <el-card>
                            <h4>统一的数据接口</h4>
                            <p>在 <code>src/data.ts</code> 中封装了所有数据获取逻辑。这使得组件不关心数据来源（是本地 JSON 还是未来可能的
                                API），也便于集中处理加载状态和错误。</p>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>
            </section>

            <!-- 核心模块详解 -->
            <section class="tech-section">
                <h2 class="section-title">
                    <el-icon>
                        <PieChart />
                    </el-icon>
                    核心模块详解
                </h2>
                <el-collapse v-model="activeCollapse" accordion>
                    <el-collapse-item name="1" title="ECharts 深度集成与优化">
                        <div>
                            <p><strong>按需引入与 Tree-shaking:</strong> 通过 <code>echarts/core</code>
                                和显式导入图表/组件的方式，确保最终打包体积最小化。</p>
                            <p><strong>动态主题与颜色管理:</strong> 在 <code>src/util/colors.ts</code> 中建立中心化的颜色映射表
                                (<code>colorMapping</code>)，保证了全站图表视觉风格的一致性。</p>
                            <p><strong>平滑的过渡动画:</strong> 为动态更新的数据项添加唯一 <code>id</code>，并启用
                                <code>universalTransition</code>，实现了在数据筛选和切换时流畅的动画效果，极大提升了用户体验。</p>
                            <p><strong>健壮的生命周期管理:</strong> 在组件卸载 (<code>onUnmounted</code>) 时，通过
                                <code>!chart.isDisposed()</code> 等防御性检查，确保 ECharts 实例被安全地销毁，避免了内存泄漏和常见的 DOM 错误。</p>
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="2" title="响应式联动仪表盘">
                        <div>
                            <p><strong>中央状态驱动:</strong> 在分析页面（如心理健康分析）中，定义一个核心的响应式状态（如 <code>selectedMhGroup</code>）。
                            </p>
                            <p><strong>计算属性 (Computed) 的妙用:</strong> 每个图表的 `options` 都被封装在一个 <code>computed</code>
                                属性中。当中央状态改变时，所有依赖该状态的图表 `options` 会自动重新计算。</p>
                            <p><strong>监听器 (Watcher) 更新视图:</strong> 使用 <code>watch</code> 监听 `options` 的变化，并调用
                                <code>myChart.setOption(newOptions, false)</code> 来触发图表的合并更新，从而实现全视图的无缝联动。</p>
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="3" title="挑战与解决方案: 数据来源的非一致性">
                        <div>
                            <p><strong>问题现象:</strong> 由于原始数据是问卷调查的数据，因此可以发现原始数据是杂乱无章的，充满了大量的纯文本内容。</p>
                            <p><strong>最终解决方案:</strong></p>
                            <ol>
                                <li>量化部分可以量化的量。比如：五级量表、数字内容等等。</li>
                                <li>对于开放性问题，采用词云分析，字段呈现更直观。</li>
                                <li>采取统一<code>.json</code>格式储存数据，把原始数据转化为半结构化数据。</li>
                                <li>多人协作的过程中，充分对齐颗粒度，统一定义处理标准。</li>
                                <li>精准定位问题痛点，选取关键数据进行分析。</li>
                            </ol>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </section>
            <!-- 致谢 -->
            <section class="tech-section">
                <h2 class="section-title">致谢</h2>
                <p>
                    本项目基于
                    <a href="https://github.com/cyber-loafing/2025_ZJU-SummerSchool-project-template">2025_ZJU-SummerSchool-project-template</a>
                    增量开发而来。
                </p>
                <p>感谢所有开源社区的贡献者和开发者们，正是你们的努力让我们能够在此基础上构建出更好的应用。</p>
                <p>本项目采用MIT License。</p>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Cpu, Connection, PieChart } from '@element-plus/icons-vue';

const activeCollapse = ref('1');

const techStack = ref([
    {
        name: 'Vue 3',
        description: '核心前端框架，采用 Composition API 进行开发。',
        logo: 'https://vuejs.org/images/logo.png'
    },
    {
        name: 'Vite',
        description: '下一代前端构建工具，提供极速的开发服务器和优化的打包。',
        logo: 'https://vitejs.dev/logo.svg'
    },
    {
        name: 'Element Plus',
        description: '基于 Vue 3 的企业级 UI 组件库，提供了丰富、美观的组件。',
        logo: 'https://element-plus.org/images/element-plus-logo.svg'
    },
    {
        name: 'Apache ECharts',
        description: '强大的数据可视化库，用于生成各种交互式图表。',
        logo: 'https://echarts.apache.org/zh/images/logo.png'
    },
    {
        name: 'TypeScript',
        description: '为 JavaScript 添加了类型系统，增强了代码的健壮性和可维护性。',
        logo: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg'
    },
    {
        name: 'Vue Router',
        description: 'Vue 的官方路由管理器，用于构建单页面应用 (SPA)。',
        logo: 'https://vuejs.org/images/logo.png' // Vue Router shares the Vue logo
    }
]);
</script>

<style scoped>
.tech-details-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    color: #333;
}

.page-header {
    text-align: center;
    margin-bottom: 4rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
}

.main-title {
    font-size: 2.8rem;
    font-weight: 800;
    color: #111827;
    margin-bottom: 0.5rem;
}

.subtitle {
    font-size: 1.2rem;
    color: #6b7280;
}

.content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4rem;
}

.section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 2px solid #3b82f6;
    padding-bottom: 0.5rem;
}

/* Tech Stack Section */
.tech-stack-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.tech-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    background-color: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.tech-logo {
    width: 50px;
    height: 50px;
    object-fit: contain;
    flex-shrink: 0;
}

.tech-name {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
}

.tech-description {
    font-size: 0.9rem;
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
}

/* Timeline Section */
.el-timeline {
    padding-left: 10px;
}

.el-card {
    border-left: 4px solid #3b82f6;
}

.el-card h4 {
    margin-top: 0;
}

/* Collapse Section */
.el-collapse {
    border-top: none;
    border-bottom: none;
}

.el-collapse-item {
    background-color: #f9fafb;
    margin-bottom: 1rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

:deep(.el-collapse-item__header) {
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0 1.5rem;
    background-color: #fff;
}

:deep(.el-collapse-item__wrap) {
    border-top: 1px solid #e5e7eb;
}

:deep(.el-collapse-item__content) {
    padding: 1.5rem;
    font-size: 1rem;
    line-height: 1.8;
}

:deep(.el-collapse-item__content p) {
    margin-bottom: 1rem;
}

:deep(.el-collapse-item__content p:last-child) {
    margin-bottom: 0;
}
</style>