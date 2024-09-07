import { AbstractMigrationAction } from "./abstract-migration-action";

export class DownAction extends AbstractMigrationAction {
  constructor(migrationFileName: string) {
    super(migrationFileName);
  }

  async execute(): Promise<void> {
    const migrationFilePath = await this.resolveMigrationFilePath(
      this.migrationFileName
    );

    const module = require(migrationFilePath);

    if (module && typeof module.down === "function") {
      await module.down();
    }
  }
}
