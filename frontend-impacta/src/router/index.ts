import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      redirect: '/login'
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },

    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },

    {
      path: '/beneficiarios',
      name: 'beneficiarios',
      component: () => import('../views/BeneficiariosView.vue')
    },

    {
      path: '/nuevo-beneficiario',
      name: 'nuevo-beneficiario',
      component: () => import('../views/NuevoBeneficiarioView.vue')
    },

    {
      path: '/donantes',
      name: 'donantes',
      component: () => import('../views/DonantesView.vue')
    },

    {
      path: '/nuevo-donante',
      name: 'nuevo-donante',
      component: () => import('../views/NuevoDonanteView.vue')
    },

    {
      path: '/donaciones',
      name: 'donaciones',
      component: () => import('../views/DonacionesView.vue')
    },

    {
      path: '/nueva-donacion',
      name: 'nueva-donacion',
      component: () => import('../views/NuevaDonacionView.vue')
    },

    {
      path: '/inventario',
      name: 'inventario',
      component: () => import('../views/InventarioView.vue')
    },

    {
       path: '/nuevo-inventario',
       name: 'nuevo-inventario',  
       component: () => import('../views/NuevoInventarioView.vue')
     },
  
     {
       path: '/campanas',
       name: 'campanas',
       component: () => import('../views/CampanasView.vue')
      },
     
     {
      path: '/nueva-campana',
      name: 'nueva-campana',
      component: () => import('../views/NuevaCampanaView.vue')
     },

     {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/UsuariosView.vue')
     },

{
  path: '/configuracion',
  name: 'configuracion',
  component: () => import('../views/ConfiguracionView.vue')
},


]
})
export default router
