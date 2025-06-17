import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: (UserRole | { not: UserRole[] })[]) => {
  const notAllowedRoles = roles
    .filter((role) => typeof role === 'object' && 'not' in role)
    .flatMap((role) => role.not);
  const allowedRoles = roles.filter(
    (role) => typeof role === 'string' && !notAllowedRoles.includes(role),
  );

  return SetMetadata(ROLES_KEY, {
    allowed: allowedRoles,
    notAllowed: notAllowedRoles,
  });
};
