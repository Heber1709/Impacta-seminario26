import { createRouter, createWebHistory } from 'vue-router'
import { apiFetch } from '../services/api'
import {
  hasPermission,
  setCurrentUser,
  type PermissionAction,
  type PermissionSection,
} from '../services/permissions'

declare module 'vue-router' {
  interface RouteMeta {
    permission?: {
      section: PermissionSection
      action: PermissionAction
    }
    adminOnly?: boolean
  }
}

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
      component: () => import('../views/DashboardView.vue'),
    },

    {
      path: '/beneficiarios',
      name: 'beneficiarios',
      component: () => import('../views/BeneficiariosView.vue'),
      meta: { permission: { section: 'beneficiarios', action: 'consultar' } }
    },

    {
      path: '/nuevo-beneficiario',
      name: 'nuevo-beneficiario',
      component: () => import('../views/NuevoBeneficiarioView.vue'),
      meta: { permission: { section: 'beneficiarios', action: 'agregar' } }
    },

    {
      path: '/editar-beneficiario/:id',
      name: 'editar-beneficiario',
      component: () => import('../views/NuevoBeneficiarioView.vue'),
      meta: { permission: { section: 'beneficiarios', action: 'editar' } }
    },

    {
      path: '/donantes',
      name: 'donantes',
      component: () => import('../views/DonantesView.vue'),
      meta: { permission: { section: 'donantes', action: 'consultar' } }
    },

    {
      path: '/nuevo-donante',
      name: 'nuevo-donante',
      component: () => import('../views/NuevoDonanteView.vue'),
      meta: { permission: { section: 'donantes', action: 'agregar' } }
    },

    {
      path: '/editar-donante/:id',
      name: 'editar-donante',
      component: () => import('../views/NuevoDonanteView.vue'),
      meta: { permission: { section: 'donantes', action: 'editar' } }
    },

    {
      path: '/donaciones',
      name: 'donaciones',
      component: () => import('../views/DonacionesView.vue'),
      meta: { permission: { section: 'donaciones', action: 'consultar' } }
    },

    {
      path: '/nueva-donacion',
      name: 'nueva-donacion',
      component: () => import('../views/NuevaDonacionView.vue'),
      meta: { permission: { section: 'donaciones', action: 'agregar' } }
    },

    {
      path: '/editar-donacion/:id',
      name: 'editar-donacion',
      component: () => import('../views/NuevaDonacionView.vue'),
      meta: { permission: { section: 'donaciones', action: 'editar' } }
    },

    {
     path: '/nueva-entrega',
     name: 'nueva-entrega',
     component: () => import('../views/NuevaEntregaView.vue'),
     meta: { permission: { section: 'beneficiarios', action: 'agregar' } }
    },

    {
      path: '/inventario',
      name: 'inventario',
      component: () => import('../views/InventarioView.vue'),
      meta: { permission: { section: 'inventario', action: 'consultar' } }
    },

    {
       path: '/nuevo-inventario',
       name: 'nuevo-inventario',  
       component: () => import('../views/NuevoInventarioView.vue'),
       meta: { permission: { section: 'inventario', action: 'agregar' } }
     },
  
     {
       path: '/campanas',
       name: 'campanas',
       component: () => import('../views/CampanasView.vue'),
       meta: { permission: { section: 'campanas', action: 'consultar' } }
      },
     
     {
      path: '/nueva-campana',
      name: 'nueva-campana',
      component: () => import('../views/NuevaCampanaView.vue'),
      meta: { permission: { section: 'campanas', action: 'agregar' } }
     },

     {
      path: '/editar-campana/:id',
      name: 'editar-campana',
      component: () => import('../views/NuevaCampanaView.vue'),
      meta: { permission: { section: 'campanas', action: 'editar' } }
     },

     {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/UsuariosView.vue'),
      meta: { permission: { section: 'usuarios', action: 'consultar' } }
     },

     {
      path: '/permisos',
      name: 'permisos',
      component: () => import('../views/PermisosView.vue'),
      meta: { adminOnly: true }
     },

     {
      path: '/voluntarios',
      name: 'voluntarios',
      component: () => import('../views/VoluntariosView.vue'),
      meta: { permission: { section: 'voluntarios', action: 'consultar' } }
     },

     {
      path: '/departamentos',
      name: 'departamentos',
      component: () => import('../views/DepartamentosView.vue'),
      meta: { permission: { section: 'departamentos', action: 'consultar' } }
     },

     {
      path: '/municipios',
      name: 'municipios',
      component: () => import('../views/MunicipiosView.vue'),
      meta: { permission: { section: 'municipios', action: 'consultar' } }
     },

{
  path: '/configuracion',
  name: 'configuracion',
  component: () => import('../views/ConfiguracionView.vue')
},


]
})

router.beforeEach(async (to) => {
if (to.name === 'login') {
  return true
}

if (!localStorage.getItem('accessToken')) {
  setCurrentUser(null)
  return { name: 'login' }
}

try {
  const response = await apiFetch('/usuarios/me')
  const user = await response.json()
  if (!response.ok) {
    throw new Error(user.message || 'No fue posible validar la sesión.')
  }

  setCurrentUser(user)

  if (to.meta.adminOnly && user.rol !== 'ADMINISTRADOR') {
    return { name: 'dashboard' }
  }

  if (
    to.meta.permission &&
    !hasPermission(to.meta.permission.section, to.meta.permission.action)
  ) {
    return { name: 'dashboard' }
  }

  return true
} catch (error) {
  console.error('No fue posible validar los permisos del usuario.', error)
  localStorage.removeItem('accessToken')
  localStorage.removeItem('usuario')
  setCurrentUser(null)
  return { name: 'login' }
}
})

export default router
