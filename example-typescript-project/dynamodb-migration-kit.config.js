var config = {
  // dir path where raw typescript migration scripts will be created.
  migrationsDir: "src/migrations",

  // dir path where compiled migrations will be stored, usually under dist or build.
  compiledMigrationsDir: "dist/migrations",

  // default table - no support for using custom table name.
  migrationHistoryTableName: "migration-history-table",
};

module.exports = config;
