import { createRouter, createWebHistory } from 'vue-router'

import HomePage from './pages/HomePage.vue'

import AcademicAndProspect from './pages/AcademicAndProspect.vue'
import GeoFactorPage from './pages/GeoFactorPage.vue'
import Details from './pages/Details.vue'
import MentalHealthPage from './pages/MentalHealthPage.vue'
import TurtorAndAcademicResearch from './pages/TurtorAndAcademicResearch.vue'
import CovidImpact from './pages/CovidImpact.vue'
import MotivationAndReviewAnalysis from './pages/MotivationAndReviewAnalysis.vue'

const routes = [
    { path: '/', component: HomePage },
    { path: '/index', component: HomePage },
    { path: '/details', component: Details },
    { path: '/GeoFactorPage', component: GeoFactorPage },
    { path: '/AcademicAndProspect', component: AcademicAndProspect },
    { path: '/TurtorAndAcademicResearch', component: TurtorAndAcademicResearch },
    { path: '/MentalHealthPage', component: MentalHealthPage },
    { path: '/CovidImpact', component: CovidImpact },
    { path: '/MotivationAndReviewAnalysis', component: MotivationAndReviewAnalysis },
]

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})