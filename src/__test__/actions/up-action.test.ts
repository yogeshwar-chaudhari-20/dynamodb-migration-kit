import { UpAction } from "../../actions/up-action";

describe("UpAction", () => {
  let upAction: UpAction;
  const testFileName = "test-migration.js";

  beforeEach(() => {
    upAction = new UpAction(testFileName);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("execute method calls up function if it is a function", async () => {
    const resolveMigrationFilePathSpy = jest
      .spyOn(upAction, "resolveMigrationFilePath")
      .mockResolvedValue("/path/to/migration");

    const mockUp = jest.fn();
    const mockModule = { up: mockUp };
    jest.doMock("/path/to/migration", () => mockModule, { virtual: true });

    await upAction.execute();

    expect(resolveMigrationFilePathSpy).toHaveBeenCalledWith(testFileName);
    expect(mockUp).toHaveBeenCalled();
  });

  test("execute method does not call up if it is not a function", async () => {
    const mockResolvePath = jest
      .spyOn(upAction, "resolveMigrationFilePath")
      .mockResolvedValue("/path/to/migration");

    const mockUp = jest.fn();
    const mockModule = { up: "not a function" };
    jest.doMock("/path/to/migration", () => mockModule, { virtual: true });

    await upAction.execute();

    expect(mockResolvePath).toHaveBeenCalledWith(testFileName);
    expect(mockUp).toHaveBeenCalledTimes(0);
  });

  test("execute method handles missing up function gracefully", async () => {
    const mockResolvePath = jest
      .spyOn(upAction, "resolveMigrationFilePath")
      .mockResolvedValue("/path/to/migration");

    const mockModule = {};
    jest.doMock("/path/to/migration", () => mockModule, { virtual: true });

    await upAction.execute();

    await expect(upAction.execute()).resolves.not.toThrow();
  });

  test("execute method throws error if resolveMigrationFilePath fails", async () => {
    const mockError = new Error("Failed to resolve path");
    jest
      .spyOn(upAction, "resolveMigrationFilePath")
      .mockRejectedValue(mockError);

    await expect(upAction.execute()).rejects.toThrow("Failed to resolve path");
  });
});
