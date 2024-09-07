import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = "YOUR_TABLE";
const client = new DynamoDBClient({});

export async function up() {
  // TODO write your migration here.
  console.log("second-migration: up successful");
}

export async function down() {
  // TODO write the statements to rollback your migration
  console.log("second-migration: down successful");
}
