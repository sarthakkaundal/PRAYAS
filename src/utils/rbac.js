export const ROLES = {
  CITIZEN: 'Citizen',
  RESPONDER: 'Responder',
  REGIONAL_ADMIN: 'RegionalAdmin',
  SUPER_ADMIN: 'SuperAdmin'
};

const permissions = {
  [ROLES.CITIZEN]: ['submit_reports', 'view_shelters', 'view_map', 'view_alerts'],
  [ROLES.RESPONDER]: ['submit_reports', 'view_shelters', 'view_map', 'view_alerts', 'update_report_status'],
  [ROLES.REGIONAL_ADMIN]: ['submit_reports', 'view_shelters', 'view_map', 'view_alerts', 'update_report_status', 'manage_reports', 'manage_shelters', 'manage_regional_funds'],
  [ROLES.SUPER_ADMIN]: ['submit_reports', 'view_shelters', 'view_map', 'view_alerts', 'update_report_status', 'manage_reports', 'manage_shelters', 'manage_regional_funds', 'full_system_access']
};

export const hasPermission = (role, action) => {
  if (!role || !permissions[role]) return false;
  return permissions[role].includes(action);
};
