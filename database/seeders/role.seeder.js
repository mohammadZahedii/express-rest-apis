const RoleModel = require(`${config.path.models}/Role`);

const { PERMISSIONS, ROLE_KEYS } = require(`${config.path.constants}`);

const defaultRoles = [
  {
    key: ROLE_KEYS.USER,
    name: "user",
    label: "کاربر عادی",
    permissions: [PERMISSIONS.COURSES_READ],
    isSystem: true,
  },
  {
    key: ROLE_KEYS.EDITOR,
    name: "editor",
    label: "مدیر محتوا",
    permissions: [
      PERMISSIONS.COURSES_READ,
      PERMISSIONS.COURSES_CREATE,
      PERMISSIONS.COURSES_UPDATE,
    ],
    isSystem: true,
  },

  {
    key: ROLE_KEYS.ADMIN,
    name: "admin",
    label: "مدیر",
    permissions: Object.values(PERMISSIONS),
    isSystem: true,
  },
];

async function seedDefaultRoles() {
  const operations = defaultRoles.map((role) => {
    const { key, ...roleData } = role;
    return {
      updateOne: {
        filter: {
          key: role.key,
        },
        update: {
          $setOnInsert: roleData,
        },
        upsert: true,
      },
    };
  });

  const result = await RoleModel.bulkWrite(operations, {
    ordered: false,
  });

  console.log("Default roles seeded successfully.");
  console.log(`Inserted roles: ${result.upsertedCount}`);
  console.log(`Matched roles: ${result.matchedCount}`);

  return result;
}

module.exports = seedDefaultRoles;
