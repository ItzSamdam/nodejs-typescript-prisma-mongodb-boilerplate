import { Role } from '@prisma/client';

const allRoles = {
  [Role.USER]: ['viewUsers'],
  [Role.ADMIN]: ['getUsers', 'manageUsers', 'addUsers', 'deleteUsers', 'viewUsers']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
