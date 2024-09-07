import fs from "fs/promises";
import path from "path";
import * as Operations from "../../utils/operations";
import {
  generateTimestamp,
  getMigrationTemplate,
  getPendingMigrations,
  sortedMigrations,
} from "../../utils/operations";

jest.mock("fs/promises");

describe("Utils Functions", () => {
  const mockConfig = {
    migrationsDir: "migrations",
    compiledMigrationsDir: "compiled_migrations",
    migrationHistoryTableName: "history",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  //   test("getConfig returns configuration", async () => {
  //     jest.spyOn(process, "cwd").mockReturnValue("/mock/path");
  //     jest.spyOn(require, "resolve").mockReturnValue({ mockConfig });

  //     const config = await getConfig();
  //     expect(config).toEqual(mockConfig);
  //   });

  test("generateTimestamp returns a formatted timestamp", () => {
    const result = generateTimestamp();
    expect(result).toMatch(/^\d{14}$/);
  });

  test("getMigrationTemplate reads the migration template", async () => {
    const templatePath = "/mock/path/templates/migration.template";
    const templateContent = "migration template content";
    (fs.readFile as jest.Mock).mockResolvedValue(templateContent);

    jest.spyOn(path, "resolve").mockReturnValue(templatePath);

    const content = await getMigrationTemplate();
    expect(content).toBe(templateContent);
    expect(fs.readFile).toHaveBeenCalledWith(templatePath, "utf8");
  });

  test("createConfigFile writes the config file", async () => {
    const configTemplatePath =
      "/mock/path/templates/dynamodb-migration-kit.config.template";
    const configContent = "config file content";
    const configFilePath = "/mock/path/dynamodb-migration-kit.config.js";

    (fs.readFile as jest.Mock).mockResolvedValue(configContent);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    jest.spyOn(path, "resolve").mockImplementation((...paths) => {
      return configTemplatePath;
    });

    jest.spyOn(path, "join").mockReturnValue(configFilePath);

    await Operations.createConfigFile();

    expect(fs.readFile).toHaveBeenCalledWith(configTemplatePath, "utf8");
    expect(fs.writeFile).toHaveBeenCalledWith(configFilePath, configContent);
  });

  test("createMigrationsFolder creates the migrations folder if it does not exist", async () => {
    const migrationsDir = "/mock/path/migrations";
    const basePath = "/mock/path/project";
    const expectedResolvedMigrationsDirPath = basePath + migrationsDir;

    jest.spyOn(Operations, "getConfig").mockImplementation(async () => {
      return { ...mockConfig, migrationsDir };
    });

    jest.spyOn(path, "join").mockReturnValue(expectedResolvedMigrationsDirPath);

    (fs.stat as jest.Mock).mockRejectedValue(new Error("directory not found"));
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

    await Operations.createMigrationsFolder();

    expect(fs.stat).toHaveBeenCalledWith(expectedResolvedMigrationsDirPath);
    expect(fs.mkdir).toHaveBeenCalledWith(expectedResolvedMigrationsDirPath);
  });

  test("createMigrationsFolder handles existing folder", async () => {
    const migrationsDir = "/mock/path/migrations";

    jest
      .spyOn(Operations, "getConfig")
      .mockResolvedValue({ ...mockConfig, migrationsDir });

    jest.spyOn(path, "join").mockReturnValue(migrationsDir);

    (fs.stat as jest.Mock).mockResolvedValue({ isDirectory: () => true });

    await Operations.createMigrationsFolder();

    expect(fs.stat).toHaveBeenCalledWith(migrationsDir);
    expect(fs.mkdir).not.toHaveBeenCalled();
  });

  test("getAllMigrationFiles returns a list of migration files", async () => {
    const files = [
      "20240907000000-migration1.js",
      "20240907000001-migration2.js",
      "other-file.txt",
    ];
    const compiledMigrationsDir = "/mock/path/compiled_migrations";

    jest
      .spyOn(Operations, "getConfig")
      .mockResolvedValue({ ...mockConfig, compiledMigrationsDir });

    jest.spyOn(path, "join").mockReturnValue(compiledMigrationsDir);

    (fs.readdir as jest.Mock).mockResolvedValue(files);

    const result = await Operations.getAllMigrationFiles();

    expect(result).toEqual([
      "20240907000000-migration1.js",
      "20240907000001-migration2.js",
    ]);
    expect(fs.readdir).toHaveBeenCalledWith(compiledMigrationsDir);
  });

  test("getPendingMigrations returns pending migrations", () => {
    const ranMigrations = ["20240907000000-migration1.js"];
    const fileMigrations = [
      "20240907000000-migration1.js",
      "20240907000001-migration2.js",
    ];

    const result = getPendingMigrations(ranMigrations, fileMigrations);

    expect(result).toEqual(["20240907000001-migration2.js"]);
  });

  test("sortedMigrations returns sorted migrations", () => {
    const migrations = [
      "20240907000001-migration2.js",
      "20240907000000-migration1.js",
    ];
    const result = sortedMigrations(migrations);

    expect(result).toEqual([
      "20240907000000-migration1.js",
      "20240907000001-migration2.js",
    ]);
  });
});
