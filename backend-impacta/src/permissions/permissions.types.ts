export const permissionSections = [
  'beneficiarios',
  'voluntarios',
  'departamentos',
  'municipios',
  'donantes',
  'donaciones',
  'inventario',
  'campanas',
  'usuarios',
] as const;

export type PermissionSection = (typeof permissionSections)[number];
export type PermissionAction = 'consultar' | 'agregar' | 'editar';

export interface SectionPermission {
  consultar: boolean;
  agregar: boolean;
  editar: boolean;
}

export type UserPermissions = Partial<
  Record<PermissionSection, Partial<SectionPermission>>
>;

export interface RequiredPermission {
  section: PermissionSection;
  action: PermissionAction;
}
