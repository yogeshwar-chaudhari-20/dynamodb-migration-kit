import { getConfig } from "../utils/operations";
import { resolve } from "path";

export abstract class AbstractMigrationAction {
  protected readonly _migrationFileName: string;

  constructor(migrationFileName: string) {
    this._migrationFileName = migrationFileName;
  }

  public abstract execute(): Promise<void>;

  public resolveMigrationFilePath = async (
    migrationFile: string
  ): Promise<string> => {
    const config = await getConfig();
    const resolvedPath = resolve(
      process.cwd(),
      config.compiledMigrationsDir,
      migrationFile
    );

    return resolvedPath;
  };

  public get migrationFileName(): string {
    return this._migrationFileName;
  }
}
