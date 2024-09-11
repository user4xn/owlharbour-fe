import { createRouter, createWebHistory } from 'vue-router'

import { authStore } from '@/stores/auth'

import SigninView from '@/views/Authentication/SigninView.vue'
import SignupView from '@/views/Authentication/SignupView.vue'
import CalendarView from '@/views/CalendarView.vue'
import BasicChartView from '@/views/Charts/BasicChartView.vue'
import MonitorShipView from '@/views/Dashboard/MonitorShipView.vue'
import FormElementsView from '@/views/Forms/FormElementsView.vue'
import FormLayoutView from '@/views/Forms/FormLayoutView.vue'
import SettingsView from '@/views/Pages/SettingsView.vue'
import ProfileView from '@/views/ProfileView.vue'
import TablesView from '@/views/TablesView.vue'
import AlertsView from '@/views/UiElements/AlertsView.vue'
import ButtonsView from '@/views/UiElements/ButtonsView.vue'
import ShipView from '@/views/Ship/ShipView.vue'
import ShipDetailView from '@/views/Ship/ShipDetailView.vue'
import PairingRegistryView from '@/views/Pairing/PairingRegistryView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: MonitorShipView,
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
    }
  },
  {
    path: '/ship',
    name: 'ship',
    component: ShipView,
    meta: {
      title: 'Ship',
      requiresAuth: true,
    }
  },
  {
    path: '/ship/:id/detail',
    name: 'calendar',
    component: ShipDetailView,
    meta: {
      title: 'Ship Detail',
      requiresAuth: true,
    }
  },
  {
    path: '/pairing-registry',
    name: 'pairing-registry',
    component: PairingRegistryView,
    meta: {
      title: 'Pairing Registry',
      requiresAuth: true,
    }
  },
  {
    path: '/harbour-setting',
    name: 'harbour-setting',
    component: SettingsView,
    meta: {
      title: 'Harbour Setting',
      requiresAuth: true,
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      title: 'Profile',
      requiresAuth: true,
    }
  },
  {
    path: '/forms/form-elements',
    name: 'formElements',
    component: FormElementsView,
    meta: {
      title: 'Form Elements',
      requiresAuth: true,
    }
  },
  {
    path: '/forms/form-layout',
    name: 'formLayout',
    component: FormLayoutView,
    meta: {
      title: 'Form Layout',
      requiresAuth: true,
    }
  },
  {
    path: '/tables',
    name: 'tables',
    component: TablesView,
    meta: {
      title: 'Tables',
      requiresAuth: true,
    }
  },
  {
    path: '/pages/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      title: 'Settings',
      requiresAuth: true,
    }
  },
  {
    path: '/charts/basic-chart',
    name: 'basicChart',
    component: BasicChartView,
    meta: {
      title: 'Basic Chart',
      requiresAuth: true,
    }
  },
  {
    path: '/ui-elements/alerts',
    name: 'alerts',
    component: AlertsView,
    meta: {
      title: 'Alerts',
      requiresAuth: true,
    }
  },
  {
    path: '/ui-elements/buttons',
    name: 'buttons',
    component: ButtonsView,
    meta: {
      title: 'Buttons',
      requiresAuth: true,
    }
  },
  {
    path: '/auth/signin',
    name: 'signin',
    component: SigninView,
    meta: {
      title: 'Signin',
    }
  },
  {
    path: '/auth/signup',
    name: 'signup',
    component: SignupView,
    meta: {
      title: 'Signup',
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | OwlHarbour - Harbour Ship Management`
  const auth = authStore()
  const isAuthenticated = auth.isLoggedIn // authentication check

  if (to.meta.requiresAuth) {
    if (isAuthenticated) {
      next()
    } else {
      next({ name: 'signin' })
    }
  } else if (to.name === 'signin' && isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
})

export default router
