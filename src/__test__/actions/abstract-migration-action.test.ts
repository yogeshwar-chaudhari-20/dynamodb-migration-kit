import { resolve } from "path";
import { AbstractMigrationAction } from "../../actions/abstract-migration-action";
import { getConfig } from "../../utils/operations";

// Mock the getConfig function
jest.mock("../../utils/operations", () => ({
  getConfig: jest.fn(),
}));

class TestMigrationAction extends AbstractMigrationAction {
  constructor(migrationFileName: string) {
    super(migrationFileName);
  }

  public async execute(): Promise<void> {}
}

describe("AbstractMigrationAction", () => {
  let testAction: TestMigrationAction;
  const testFileName = "test-migration.js";

  beforeEach(() => {
    testAction = new TestMigrationAction(testFileName);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("resolveMigrationFilePath resolves path correctly", async () => {
    const mockConfig = {
      compiledMigrationsDir: "compiled-migrations",
    };
    (getConfig as jest.Mock).mockResolvedValue(mockConfig);

    const expectedPath = resolve(
      process.cwd(),
      mockConfig.compiledMigrationsDir,
      testFileName
    );
    const resolvedPath = await testAction["resolveMigrationFilePath"](
      testFileName
    );

    expect(resolvedPath).toBe(expectedPath);
    expect(getConfig).toHaveBeenCalledTimes(1);
  });

  test("resolveMigrationFilePath handles different config values", async () => {
    const mockConfig = {
      compiledMigrationsDir: "different-migrations-dir",
    };
    (getConfig as jest.Mock).mockResolvedValue(mockConfig);

    const expectedPath = resolve(
      process.cwd(),
      mockConfig.compiledMigrationsDir,
      testFileName
    );
    const resolvedPath = await testAction["resolveMigrationFilePath"](
      testFileName
    );

    expect(resolvedPath).toBe(expectedPath);
  });

  test("resolveMigrationFilePath throws error if getConfig fails", async () => {
    const mockError = new Error("Config error");
    (getConfig as jest.Mock).mockRejectedValue(mockError);

    await expect(
      testAction["resolveMigrationFilePath"](testFileName)
    ).rejects.toThrow("Config error");
  });
});
