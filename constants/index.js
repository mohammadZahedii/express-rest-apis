const ROLE_KEYS = Object.freeze({
  USER: "basic_user",
  EDITOR: "editor",
  ADMIN: "admin",
});

const PERMISSIONS = Object.freeze({
  //access to all permissions in super admin role
  SUPER_ADMIN: "*",
  //courses permissions
  COURSES_ALL: "courses:*",
  COURSES_READ: "courses:read",
  COURSES_CREATE: "courses:create",
  COURSES_UPDATE: "courses:update",
  COURSES_DELETE: "courses:delete",

  //courses permissions
  ROLES_ALL: "roles:*",
  ROLES_READ: "roles:read",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",
});

const STATUS_VALUES = Object.freeze({
  project: ["in_progress", "completed", "archived"],
  article: ["draft", "published", "archived"],
});

module.exports = {
  PERMISSIONS,
  ROLE_KEYS,
  STATUS_VALUES,
};
