import Role from './role.model';
import { v4 as uuidv4 } from 'uuid';
import Permission from '../Permission/permission.model';

export const getRolesWithPermissions = async (): Promise<Role[]> => {
  const roles: Role[] = await Role.findAll({
    include: {
      model: Permission,
      through: { attributes: [] },
    },
  });
  if (!roles.length) {
    throw new Error('No roles were found');
  }
  return roles;
};

export const createRoleWithPermissions = async (
  name: string,
  permissionUuids: string[]
): Promise<void> => {
  const permissions: Permission[] = await Permission.findAll({
    where: {
      uuid: permissionUuids,
    },
  });
  if (!permissions.length) {
    throw new Error('Wrong permissionUuids');
  }
  const role: Role = await Role.create({
    uuid: uuidv4(),
    name,
  });
  await role.$add('permissions', permissions);
};

export const addPermissionToRole = async (
  permissionUuid: string,
  roleUuid: string
): Promise<void> => {
  const role: Role = await Role.findByPk(roleUuid, { include: Permission });
  const permission: Permission = await Permission.findByPk(permissionUuid, {
    include: Role,
  });
  if (!role || !permission) {
    throw new Error('Incorrect data');
  }
  await role.$remove('permissions', role.permissions);
  role.permissions.push(permission);
  await role.$add('permissions', role.permissions);
};
