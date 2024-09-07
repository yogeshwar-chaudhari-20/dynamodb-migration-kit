import { AbstractMigrationAction } from "./abstract-migration-action";

export class UpAction extends AbstractMigrationAction {
  constructor(migrationFileName: string) {
    super(migrationFileName);
  }

  public async execute(): Promise<void> {
    const migrationFilePath = await this.resolveMigrationFilePath(
      this.migrationFileName
    );

    const module = require(migrationFilePath);

    if (module && typeof module.up === "function") {
      await module.up();
    }
  }
}
