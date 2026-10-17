<template>
  <div class="layout">

    <aside class="sidebar">

      <div class="logo">
        <div class="logo-icon">✦</div>

        <div>
          <h1>IMPACTA</h1>
          <span>Gestión de donaciones</span>
        </div>
      </div>

      <nav class="menu">

        <RouterLink to="/dashboard" class="menu-item" exact-active-class="active">
          <span>⌂</span>
          <span>Inicio</span>
        </RouterLink>

        <RouterLink
          v-if="can('beneficiarios', 'consultar')"
          to="/beneficiarios" class="menu-item" exact-active-class="active" >
          <span>♙</span>
          <span>Beneficiarios</span>
        </RouterLink>

        <RouterLink v-if="can('beneficiarios', 'consultar')" to="/entregas" class="menu-item" exact-active-class="active">
          <span>↗</span>
          <span>Entregas</span>
        </RouterLink>

        <RouterLink v-if="can('voluntarios', 'consultar')" to="/voluntarios" class="menu-item" exact-active-class="active">
          <span>♟</span>
          <span>Voluntarios</span>
        </RouterLink>

        <RouterLink v-if="can('departamentos', 'consultar')" to="/departamentos" class="menu-item" exact-active-class="active">
          <span>▤</span>
          <span>Departamentos</span>
        </RouterLink>

        <RouterLink v-if="can('municipios', 'consultar')" to="/municipios" class="menu-item" exact-active-class="active">
          <span>⌖</span>
          <span>Municipios</span>
        </RouterLink>

        <RouterLink v-if="can('donantes', 'consultar')" to="/donantes" class="menu-item">
          <span>♧</span>
          <span>Donantes</span>
        </RouterLink>

        <RouterLink v-if="can('donaciones', 'consultar')" to="/donaciones" class="menu-item">
          <span>♢</span>
          <span>Donaciones</span>
        </RouterLink>

        <RouterLink v-if="can('inventario', 'consultar')" to="/inventario" class="menu-item">
          <span>▣</span>
          <span>Inventario</span>
        </RouterLink>

        <RouterLink v-if="can('campanas', 'consultar')" to="/campanas" class="menu-item">
          <span>⊙</span>
          <span>Campañas</span>
        </RouterLink>

      </nav>

      <div class="sidebar-bottom">

        <RouterLink v-if="isAdministrator()" to="/permisos" class="menu-item">
          <span>▣</span>
          <span>Permisos</span>
        </RouterLink>

        <RouterLink to="/configuracion" class="menu-item">
          <span>⚙</span>
          <span>Configuración</span>
        </RouterLink>

        <a
          href="#"
          class="menu-item logout"
          @click.prevent="cerrarSesion"
        >
          <span>↪</span>
          <span>Cerrar sesión</span>
        </a>

      </div>

    </aside>

    <main class="main-content">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
//import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { hasPermission, isAdministrator } from '../services/permissions'

const router = useRouter()
const can = hasPermission

function cerrarSesion() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('usuario')
  router.push('/login')
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  background: #f5f7f6;
  color: #1f2937;
}

/* SIDEBAR */

.sidebar {
  width: 250px;
  min-height: 100vh;
  background: #123b35;
  color: white;
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* LOGO */

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px 35px;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: #6fb98f;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  font-weight: bold;
}

.logo h1 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 1px;
}

.logo span {
  font-size: 10px;
  color: #b9d5cd;
}

/* MENU */

.menu {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  color: #d8e7e2;
  text-decoration: none;
  font-size: 14px;
  transition: 0.2s;
}

.menu-item span:first-child {
  width: 22px;
  text-align: center;
  font-size: 17px;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.menu-item.active {
  background: #6fb98f;
  color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
}

/* PARTE INFERIOR */

.sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.logout {
  color: #b9d5cd;
}

/* CONTENIDO */

.main-content {
  flex: 1;
  min-width: 0;
  padding: 35px;
  box-sizing: border-box;
}

/* RESPONSIVE */

@media (max-width: 700px) {

  .sidebar {
    width: 80px;
    padding: 20px 10px;
  }

  .logo {
    justify-content: center;
    padding-bottom: 25px;
  }

  .logo > div:last-child {
    display: none;
  }

  .menu-item {
    justify-content: center;
  }

  .menu-item span:last-child {
    display: none;
  }

  .main-content {
    padding: 20px;
  }

}
</style>
