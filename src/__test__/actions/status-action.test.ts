import { StatusAction } from "../../actions/status-action";

describe("StatusAction", () => {
  const testMigrationFileName = "test-migration-file.js";

  it("should throw an error when execute is called", async () => {
    const statusAction = new StatusAction(testMigrationFileName);

    await expect(statusAction.execute()).rejects.toThrow(
      "Method not implemented."
    );
  });
});
