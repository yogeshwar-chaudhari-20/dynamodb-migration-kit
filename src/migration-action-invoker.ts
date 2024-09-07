import { AbstractMigrationAction } from "./actions/abstract-migration-action";

export class MigrationActionInvoker {
  private _history: AbstractMigrationAction[] = [];

  async executeAction(action: AbstractMigrationAction): Promise<void> {
    try {
      await action.execute();
      this._history.push(action);
    } catch (error) {
      console.error({
        message: "Error executing migration action.",
        action: action.constructor.name,
        error: error,
      });

      throw error;
    }
  }

  public get history(): AbstractMigrationAction[] {
    return this._history;
  }
}
