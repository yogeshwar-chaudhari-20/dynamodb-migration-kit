# DynamoDB Migration Kit

DynamoDB Migration Kit is a tool designed to simplify and manage database migrations for Amazon DynamoDB. It provides a set of commands to create, run, and manage migrations, making it easier to version control your database schema changes.

## Bare bone Philosophy

This kit adheres to a bare-bone approach:

- Minimal dependencies
- Direct use of AWS SDK v3
- Simple, straightforward operations

## Installation

To install the DynamoDB Migration Kit, run the following command:

```bash
npm install dynamodb-migration-kit
```

## Usage

### Initializing the Configuration

[example-typescript-project](https://github.com/yogeshwar-chaudhari-20/dynamodb-migration-kit/tree/main/example-typescript-project)

Before you can start using the migration kit, you need to initialize the configuration:

```bash
export AWS_PROFILE=your-aws-profile

dynamodb-migration-kit setup

# Assumes that AWS profile is set.
# Assumes that your project uses src folder.
# If the operation fails, please create the migrations dir manually.
```

- This command creates a `dynamodb-migration-kit.config.js` file in your project root. You can customize this file to match your project's needs.
- Creates `migrations` dir under `/src`.
- Creates a `migration-history-table` in AWS DynamoDB in AWS environment.

### Creating a New Migration

To create a new migration file:

```bash
dynamodb-migration-kit create <migration-name>

# e.g. dynamodb-migration-kit create first-migration
# output: src/migrations/20240709101010-first-migration.ts
```

This generates a new Typescript file in your migrations directory. (as specified by `dynamodb-migration-kit.config.js`)

### Running Migrations

To run a next pending migration:

```bash
dynamodb-migration-kit up
```

### Rolling Back Migrations

To roll back the last applied migration:

```bash
dynamodb-migration-kit down
```

### Checking Migration Status

To see the status of migrations:

```bash
dynamodb-migration-kit status
```

This command shows which migrations have been applied and which are pending.

## Configuration

The `dynamodb-migration-kit.config.js` file contains important configuration options:

```js
var config = {
  // dir path where raw typescript migration scripts will be created.
  migrationsDir: "src/migrations",

  // dir path where compiled migrations will be stored after code build by your script.
  // usually under dist or build.
  compiledMigrationsDir: "dist/migrations",

  // default table - no support for using custom table name.
  migrationHistoryTableName: "migration-history-table",
};

module.exports = config;
```

## Writing Migrations

Each migration file should export an up and a down function:

```js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = "YOUR_TABLE";
const client = new DynamoDBClient({});

export async function up() {
  // TODO write your migration here.
}

export async function down() {
  // TODO write the statements to rollback your migration
}
```

## Best Practices

- Always create a down function to allow for rollbacks.
- Keep migrations small and focused on a single change.
- Use descriptive names for your migration files.
- Test your migrations in a non-production environment first.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Additional Resources

### Automate migrations with GitHub Actions

- Instructions are registering OIDC provider.
  [Read more](https://aws.amazon.com/blogs/security/use-iam-roles-to-connect-github-actions-to-actions-in-aws/)

- CDK for creating AWS resources.
  [Read more](https://gist.github.com/yogeshwar-chaudhari-20/9cb03ad7ee7002c95d05bd47997a3bc7)

- Github actions workflow.
  [Read more](https://gist.github.com/yogeshwar-chaudhari-20/82a3cd94c82a3edabc393de0f9d937aa).
