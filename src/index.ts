#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs/promises";
import { join, resolve } from "path";
import { DownAction } from "./actions/down-action";
import { UpAction } from "./actions/up-action";
import { MigrationActionInvoker } from "./migration-action-invoker";
import { DynamoClient } from "./utils/dynamo-client";
import { DynamoDbHistoryTable } from "./utils/dynamodb-history-table";
import {
  createConfigFile,
  createMigrationsFolder,
  generateTimestamp,
  getAllMigrationFiles,
  getConfig,
  getMigrationTemplate,
  getPendingMigrations,
  sortedMigrations,
} from "./utils/operations";

const program = new Command();
const dynamoClient = DynamoClient.getInstance();

const invoker = new MigrationActionInvoker();

const migrationHistoryTable = new DynamoDbHistoryTable(
  "migration-history-table",
  dynamoClient
);

const setupCommand = async () => {
  await DynamoClient.checkConnection();
  await createConfigFile();
  await createMigrationsFolder();
  await migrationHistoryTable.create();
};

const upCommand = async (options: { profile: any }) => {
  const [ranMigrations, fileMigrations] = await Promise.all([
    migrationHistoryTable.getAllMigrations(),
    getAllMigrationFiles(),
  ]);

  const pendingMigrations = getPendingMigrations(ranMigrations, fileMigrations);

  if (pendingMigrations.length <= 0) {
    console.warn("there are no pending migrations.");
    return;
  }

  const migrationFileName = pendingMigrations[0];

  const upAction = new UpAction(migrationFileName);

  await invoker.executeAction(upAction);
  await migrationHistoryTable.addMigration(migrationFileName);
};

const downCommand = async (options: { profile: any }) => {
  const ranMigrations = await migrationHistoryTable.getAllMigrations();

  if (ranMigrations.length <= 0) {
    console.warn("no migrations to take down.");
    return;
  }

  const migrationFileName = ranMigrations[ranMigrations.length - 1];

  const downAction = new DownAction(migrationFileName);

  await invoker.executeAction(downAction);
  await migrationHistoryTable.removeMigration(migrationFileName);
};

const statusCommand = async (options: { profile: any }) => {
  const [ranMigrations, fileMigrations] = await Promise.all([
    migrationHistoryTable.getAllMigrations(),
    getAllMigrationFiles(),
  ]);

  const allMigrations = sortedMigrations([...ranMigrations, ...fileMigrations]);

  const tableData = allMigrations.map((migration) => ({
    Migration: migration,
    Status: ranMigrations.includes(migration) ? "Completed" : "Pending",
  }));

  console.table(tableData, ["Migration", "Status"]);
};

// CLI starts here
program
  .name("dynamodb-migration-kit")
  .description("CLI to manage DynamoDB migrations.")
  .version("1.0.0");

program
  .command("setup")
  .description(
    "Create the migration-history-table in DynamoDB to track the status."
  )
  .action(setupCommand);

program
  .command("up")
  .description("Run UP migration")
  .option("--profile <profile>", "Specify AWS profile.")
  .action(upCommand);

program
  .command("down")
  .description("Run DOWN migration")
  .option("--profile <profile>", "Specify AWS profile.")
  .action(downCommand);

program
  .command("status")
  .description("Check migration status")
  .option("--profile <profile>", "Specify AWS profile")
  .action(statusCommand);

program
  .command("create <migration-name>")
  .description("Create a new migration file")
  .action(async (migrationName: string) => {
    const config = await getConfig();
    const migrationsDir = resolve(process.cwd(), config.migrationsDir);

    try {
      const stats = await fs.stat(migrationsDir);
      if (!stats.isDirectory()) {
        throw new Error(
          `${config.migrationsDir} is not a directory. please run "dynamodb-migration-kit setup" before creating a migration.`
        );
      }
    } catch (err) {
      throw new Error(
        "please run `dynamodb-migration-kit setup` before creating a migration."
      );
    }

    const timestamp = generateTimestamp();
    const filename = `${timestamp}-${migrationName}.ts`;
    const filePath = join(migrationsDir, filename);

    const content = await getMigrationTemplate();

    await fs.writeFile(filePath, content);

    console.log({
      message: "Migration file created.",
      filePath,
    });
  });

program.parse(process.argv);
