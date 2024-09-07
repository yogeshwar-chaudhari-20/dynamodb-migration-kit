// Registering GitHub as OIDC provider with AWS
// https://aws.amazon.com/blogs/security/use-iam-roles-to-connect-github-actions-to-actions-in-aws/

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const account = this.account;
    const githubOrganization = "your-organization";
    const githubRepository = "your-repository";

    // IAM role with federated principal - Github Actions has access to it from a specific repo.
    const githubDynamoDbMigrationWorkflowRole = new iam.Role(
      this,
      "GithubDynamoDbMigrationWorkflowRole",
      {
        roleName: "github-dynamodb-migration-workflow-role",
        description:
          "Role to be used my Github Actions for dynamoDB migrations",
        assumedBy: new iam.FederatedPrincipal(
          `arn:aws:iam::${account}:oidc-provider/token.actions.githubusercontent.com`,
          {
            StringEquals: {
              "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            },
            StringLike: {
              "token.actions.githubusercontent.com:sub": `repo:${githubOrganization}/${githubRepository}:*`,
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    // Create a policy to allow limmited access to DynamoDB table.
    const rmaDynoTableAccessPolicyDocument = new iam.PolicyStatement({
      actions: [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:ConditionCheckItem",
        "dynamodb:PutItem",
        "dynamodb:DescribeTable",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
      ],
      // Restrict this to concerned tables
      resources: ["*"],
    });

    githubDynamoDbMigrationWorkflowRole.addToPolicy(
      rmaDynoTableAccessPolicyDocument
    );

    new cdk.CfnOutput(this, "RoleArn", {
      value: githubDynamoDbMigrationWorkflowRole.roleArn,
      description: "AWS role for Github Actions to assume",
    });
  }
}
