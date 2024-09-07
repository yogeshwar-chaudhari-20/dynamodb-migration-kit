import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const dynamoDBClientSpy = () => {
  return jest.spyOn(DynamoDBClient.prototype as any, "constructor");
};

export const dynamoSendSpy = () => {
  return jest.spyOn(DynamoDBClient.prototype as any, "send");
};
