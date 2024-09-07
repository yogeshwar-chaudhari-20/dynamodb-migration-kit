import { DownAction } from "../../actions/down-action";

describe("UpAction", () => {
  let downAction: DownAction;
  const testFileName = "test-migration.js";

  beforeEach(() => {
    downAction = new DownAction(testFileName);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("execute method calls down function if it is a function", async () => {
    const resolveMigrationFilePathSpy = jest
      .spyOn(downAction, "resolveMigrationFilePath")
      .mockResolvedValue("/path/to/migration");

    const mockDown = jest.fn();
    const mockModule = { down: mockDown };
    jest.doMock("/path/to/migration", () => mockModule, { virtual: true });

    await downAction.execute();

    expect(resolveMigrationFilePathSpy).toHaveBeenCalledWith(testFileName);
    expect(mockDown).toHaveBeenCalled();
  });

  test("execute method does not call down if it is not a function", async () => {
    const mockResolvePath = jest
      .spyOn(downAction, "resolveMigrationFilePath")
      .mockResolvedValue("/path/to/migration");

    const mockDown = jest.fn();
    const mockModule = { down: "not a function" };
    jest.doMock("/path/to/migration", () => mockModule, { virtual: true });

    await downAction.execute();

    expect(mockResolvePath).toHaveBeenCalledWith(testFileName);
    expect(mockDown).toHaveBeenCalledTimes(0);
  });

  test("execute method handles missing down function gracefully", async () => {
    const mockResolvePath = jest
      .spyOn(downAction, "resolveMigrationFilePath")
      .mockResolvedValue("/path/to/migration");

    const mockModule = {};
    jest.doMock("/path/to/migration", () => mockModule, { virtual: true });

    await downAction.execute();

    await expect(downAction.execute()).resolves.not.toThrow();
  });

  test("execute method throws error if resolveMigrationFilePath fails", async () => {
    const mockError = new Error("Failed to resolve path");
    jest
      .spyOn(downAction, "resolveMigrationFilePath")
      .mockRejectedValue(mockError);

    await expect(downAction.execute()).rejects.toThrow(
      "Failed to resolve path"
    );
  });
});
