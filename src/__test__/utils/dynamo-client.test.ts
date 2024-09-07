import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoClient } from "../../utils/dynamo-client";

describe("DynamoClient", () => {
  let sendMock: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    sendMock = jest.spyOn(DynamoDBClient.prototype, "send");

    logSpy = jest.spyOn(console, "log").mockImplementation();
    errorSpy = jest.spyOn(console, "error").mockImplementation();

    exitSpy = jest.spyOn(process, "exit").mockImplementation();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getInstance", () => {
    it("should return the same instance of DynamoDBClient", () => {
      const instance1 = DynamoClient.getInstance();
      const instance2 = DynamoClient.getInstance();

      expect(instance1).toBeInstanceOf(DynamoDBClient);
      expect(instance1).toBe(instance2);
    });
  });

  describe("checkConnection", () => {
    it("should log success message when connection is successful", async () => {
      sendMock.mockResolvedValueOnce({});

      await DynamoClient.checkConnection();

      expect(sendMock).toHaveBeenCalledWith(expect.any(ListTablesCommand));
    });

    it("should handle errors and call process.exit(1) when connection fails", async () => {
      sendMock.mockRejectedValueOnce(new Error("Connection failed"));

      await DynamoClient.checkConnection();

      expect(sendMock).toHaveBeenCalledWith(expect.any(ListTablesCommand));
      expect(errorSpy).toHaveBeenCalledWith(
        "error checking dynamodb connection:",
        expect.any(Error)
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
