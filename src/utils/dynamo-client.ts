import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";

export class DynamoClient {
  private static instance: DynamoDBClient;

  private constructor() {
    DynamoClient.instance = new DynamoDBClient({});
  }

  public static getInstance(): DynamoDBClient {
    if (DynamoClient.instance == null) {
      new DynamoClient();
    }

    return DynamoClient.instance;
  }

  public static checkConnection = async () => {
    console.log("checking dynamodb connection.");
    try {
      const command = new ListTablesCommand({});
      const dynamoDbClient = DynamoClient.getInstance();

      await dynamoDbClient.send(command);

      console.log("dynamodb connection successful.");
    } catch (error) {
      console.error("error checking dynamodb connection:", error);
      process.exit(1);
    }
  };
}
