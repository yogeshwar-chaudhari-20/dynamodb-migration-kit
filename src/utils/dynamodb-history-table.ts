import {
  DynamoDBClient,
  CreateTableCommand,
  ScalarAttributeType,
  KeyType,
  DescribeTableCommand,
  ResourceNotFoundException,
  ScanCommand,
  ScanCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  DeleteItemCommandInput,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export class DynamoDbHistoryTable {
  private readonly _tableName;
  private readonly _dynamoDBClient: DynamoDBClient;

  constructor(tableName: string, dynamoDBClient: DynamoDBClient) {
    this._tableName = tableName;
    this._dynamoDBClient = dynamoDBClient;
  }

  private async tableExists(): Promise<boolean> {
    try {
      await this._dynamoDBClient.send(
        new DescribeTableCommand({ TableName: this._tableName })
      );
      return true;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        return false;
      }

      throw error;
    }
  }

  create = async () => {
    console.log(`creating "${this._tableName}".`);
    const exists = await this.tableExists();

    if (exists) {
      console.warn(`table already exists.`);
      return;
    }

    const params = {
      AttributeDefinitions: [
        {
          AttributeName: "migration-id",
          AttributeType: ScalarAttributeType.S,
        },
      ],
      KeySchema: [
        {
          AttributeName: "migration-id",
          KeyType: KeyType.HASH,
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
      TableName: this._tableName,
    };

    try {
      const command = new CreateTableCommand(params);
      await this._dynamoDBClient.send(command);
      console.log(`${this.tableName} table created successfully.`);
    } catch (error) {
      console.error({
        message: "error creating table.",
        tableName: this.tableName,
        error,
      });
    }
  };

  getAllMigrations = async (): Promise<string[]> => {
    try {
      let lastEvaluatedKey = undefined;
      let allItems: any[] = [];

      do {
        // Scan the table to get all items
        const scanParams: ScanCommandInput = {
          TableName: this._tableName,
          ExclusiveStartKey: lastEvaluatedKey,
        };

        const command = new ScanCommand(scanParams);
        const data = await this._dynamoDBClient.send(command);

        if (data.Items) {
          allItems = [
            ...allItems,
            ...data.Items.map((item) => unmarshall(item)),
          ];
        }

        // Set the last evaluated key for pagination
        lastEvaluatedKey = data.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      // Sort the items by the 'applied-at' attribute
      allItems.sort(
        (a, b) => Number(a["applied-at"]) - Number(b["applied-at"])
      );

      return allItems.map((item) => item["migration-id"]);
    } catch (error) {
      console.error("Error reading and sorting migrations:", error);
      return [];
    }
  };

  addMigration = async (migrationId: string): Promise<void> => {
    try {
      const timestamp = new Date().getTime();

      const params: PutItemCommandInput = {
        TableName: this._tableName,
        Item: {
          "migration-id": { S: migrationId },
          "applied-at": { S: timestamp.toString() },
        },
      };

      await this._dynamoDBClient.send(new PutItemCommand(params));
    } catch (error) {
      console.error({
        message: "Error adding migration.",
        migrationId,
        error,
      });

      throw error;
    }
  };

  removeMigration = async (migrationId: string): Promise<void> => {
    try {
      const params: DeleteItemCommandInput = {
        TableName: this._tableName,
        Key: {
          "migration-id": { S: migrationId },
        },
      };

      await this._dynamoDBClient.send(new DeleteItemCommand(params));
    } catch (error) {
      console.error({
        message: "Error removing migration.",
        migrationId,
        error,
      });

      throw error;
    }
  };

  public get tableName(): string {
    return this._tableName;
  }

  public get dynamoDBClient(): DynamoDBClient {
    return this._dynamoDBClient;
  }
}
