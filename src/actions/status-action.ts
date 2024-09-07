import { AbstractMigrationAction } from "./abstract-migration-action";

export class StatusAction extends AbstractMigrationAction {
  public async execute(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
