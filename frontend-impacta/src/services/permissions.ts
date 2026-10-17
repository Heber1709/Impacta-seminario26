import { reactive } from 'vue'

export type PermissionSection =
  | 'beneficiarios'
  | 'voluntarios'
  | 'departamentos'
  | 'municipios'
  | 'donantes'
  | 'donaciones'
  | 'inventario'
  | 'campanas'
  | 'usuarios'

export type PermissionAction = 'consultar' | 'agregar' | 'editar'

export type UserPermissions = Partial<
  Record<PermissionSection, Partial<Record<PermissionAction, boolean>>>
>

interface AuthenticatedUser {
  id: string
  rol: string
  permisos?: UserPermissions
}

const permissionState = reactive({
  user: null as AuthenticatedUser | null,
})

export function setCurrentUser(user: AuthenticatedUser | null): void {
  permissionState.user = user
}

export function hasPermission(
  section: PermissionSection,
  action: PermissionAction
): boolean {
  if (permissionState.user?.rol === 'ADMINISTRADOR') {
    return true
  }

  if (section === 'usuarios' && action !== 'consultar') {
    return false
  }

  return permissionState.user?.permisos?.[section]?.[action] === true
}

export function isAdministrator(): boolean {
  return permissionState.user?.rol === 'ADMINISTRADOR'
}

export function currentUser(): AuthenticatedUser | null {
  return permissionState.user
}
