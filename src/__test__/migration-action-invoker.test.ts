import { AbstractMigrationAction } from "../actions/abstract-migration-action";
import { MigrationActionInvoker } from "../migration-action-invoker";

class MockMigrationAction extends AbstractMigrationAction {
  execute = jest.fn();
}

describe("MigrationActionInvoker", () => {
  let migrationActionInvoker: MigrationActionInvoker;
  let mockMigrationFileName: string;
  let mockMigrationAction: MockMigrationAction;

  beforeEach(() => {
    migrationActionInvoker = new MigrationActionInvoker();
    mockMigrationFileName = "test-migration-file.js";
    mockMigrationAction = new MockMigrationAction(mockMigrationFileName);
  });

  it("should execute the action successfully", async () => {
    await migrationActionInvoker.executeAction(mockMigrationAction);

    expect(mockMigrationAction.execute).toHaveBeenCalledTimes(1);
  });

  it("should add the action to history after successful execution", async () => {
    await migrationActionInvoker.executeAction(mockMigrationAction);

    expect(migrationActionInvoker.history).toContain(mockMigrationAction);
  });

  it("should throw an error when action execution fails", async () => {
    const error = new Error("execution failed");
    mockMigrationAction.execute.mockRejectedValue(error);

    await expect(
      migrationActionInvoker.executeAction(mockMigrationAction)
    ).rejects.toThrow("execution failed");
  });

  it("should log an error when action execution fails", async () => {
    const error = new Error("execution failed");
    mockMigrationAction.execute.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(
      migrationActionInvoker.executeAction(mockMigrationAction)
    ).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith({
      message: "Error executing migration action.",
      action: "MockMigrationAction",
      error: error,
    });

    consoleSpy.mockRestore();
  });

  it("should not add the action to history when execution fails", async () => {
    const error = new Error("execution failed");
    mockMigrationAction.execute.mockRejectedValue(error);

    await expect(
      migrationActionInvoker.executeAction(mockMigrationAction)
    ).rejects.toThrow();

    expect(migrationActionInvoker.history).not.toContain(mockMigrationAction);
  });
});
