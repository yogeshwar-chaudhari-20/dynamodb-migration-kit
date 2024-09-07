import path from "path";
import fs from "fs/promises";
import { warn } from "console";

export type Config = {
  migrationsDir: string;
  compiledMigrationsDir: string;
  migrationHistoryTableName?: string;
};

let cachedConfig: Config;

export const getConfig = async () => {
  if (!cachedConfig) {
    cachedConfig = require(path.join(
      process.cwd(),
      "dynamodb-migration-kit.config.js"
    ));
  }
  return cachedConfig;
};

export const generateTimestamp = (): string => {
  return new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
};

export const getMigrationTemplate = async (): Promise<string> => {
  const templatePath = path.resolve(
    __dirname,
    "../templates/migration.template"
  );
  return await fs.readFile(templatePath, "utf8");
};

export const createConfigFile = async () => {
  console.log("creating config file.");

  const configTemplate = path.resolve(
    __dirname,
    "../templates",
    "dynamodb-migration-kit.config.template"
  );
  const content = await fs.readFile(configTemplate, "utf8");

  try {
    const configFile = path.join(
      process.cwd(),
      "dynamodb-migration-kit.config.js"
    );
    await fs.writeFile(configFile, content);

    console.log("config file created.");
  } catch (error) {
    console.error({
      message: "error creating config file.",
      error,
    });
  }
};

export const createMigrationsFolder = async () => {
  console.log("creating migrations folder.");

  const config = await getConfig();
  const migrationsDir = path.join(process.cwd(), config.migrationsDir);

  try {
    const stats = await fs.stat(migrationsDir);
    if (stats.isDirectory()) {
      console.warn({
        message: "the `migrations` folder already exists.",
        folderPath: migrationsDir,
      });
      return;
    }
  } catch (err) {}

  try {
    await fs.mkdir(migrationsDir);
    console.log({
      message: "migrations folder created.",
      folderPath: migrationsDir,
    });
  } catch (error) {
    console.error({
      message: "error creating migrations folder.",
      error,
    });
  }
};

export const getAllMigrationFiles = async (): Promise<string[]> => {
  const config = await getConfig();

  const compiledMigrationsDir = path.join(
    process.cwd(),
    config.compiledMigrationsDir
  );

  try {
    const files = await fs.readdir(compiledMigrationsDir);
    return files.filter((file) => file.endsWith(".js"));
  } catch (error) {
    console.error("Error reading migration files:", error);
    return [];
  }
};

export const getPendingMigrations = (
  ranMigrations: string[],
  fileMigrations: string[]
): string[] => {
  return [...new Set(fileMigrations)]
    .filter((migration) => !ranMigrations.includes(migration))
    .sort(
      (a, b) => parseInt(a.split("-")[0], 10) - parseInt(b.split("-")[0], 10)
    );
};

export const sortedMigrations = (migrations: string[]) => {
  return [...new Set(migrations)].sort(
    (a, b) => parseInt(a.split("-")[0], 10) - parseInt(b.split("-")[0], 10)
  );
};
