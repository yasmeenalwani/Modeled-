import { defineBackend } from '@aws-amplify/backend';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as cdk from 'aws-cdk-lib';

/**
 * RDS PostgreSQL Instance for Analytics
 * 
 * Used for:
 * - Revenue reporting
 * - Trend analysis
 * - Complex queries
 * - Business intelligence
 */
export function createRDSInstance(stack: cdk.Stack) {
  // VPC for RDS (required)
  const vpc = new ec2.Vpc(stack, 'AnalyticsVPC', {
    maxAzs: 2,
    natGateways: 1, // Can reduce to 0 for cost savings (use VPC endpoints)
  });

  // Security group for RDS
  const dbSecurityGroup = new ec2.SecurityGroup(stack, 'RDSSecurityGroup', {
    vpc,
    description: 'Security group for RDS analytics database',
    allowAllOutbound: true,
  });

  // Allow Lambda to connect to RDS
  dbSecurityGroup.addIngressRule(
    ec2.Peer.ipv4(vpc.vpcCidrBlock),
    ec2.Port.tcp(5432),
    'Allow Lambda access'
  );

  // Database credentials (stored in Secrets Manager)
  const dbCredentials = rds.Credentials.fromGeneratedSecret('analytics-db-admin', {
    secretName: 'modeled-analytics-db-credentials',
    excludeCharacters: '"@/\\',
  });

  // RDS PostgreSQL Instance
  const database = new rds.DatabaseInstance(stack, 'AnalyticsDatabase', {
    engine: rds.DatabaseInstanceEngine.postgres({
      version: rds.PostgresEngineVersion.VER_15_4,
    }),
    instanceType: ec2.InstanceType.of(
      ec2.InstanceClass.T3,
      ec2.InstanceSize.MICRO // Free tier eligible, upgrade as needed
    ),
    vpc,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    },
    securityGroups: [dbSecurityGroup],
    credentials: dbCredentials,
    databaseName: 'modeled_analytics',
    allocatedStorage: 20, // GB - free tier
    maxAllocatedStorage: 100, // Auto-scale up to 100GB
    storageEncrypted: true,
    backupRetention: cdk.Duration.days(7),
    deleteAutomatedBackups: false,
    removalPolicy: cdk.RemovalPolicy.SNAPSHOT, // Keep snapshot if deleted
    multiAz: false, // Set to true for production
    publiclyAccessible: false, // Only accessible from VPC
  });

  // Output connection info
  new cdk.CfnOutput(stack, 'RDSInstanceEndpoint', {
    value: database.instanceEndpoint.hostname,
    description: 'RDS instance endpoint',
  });

  new cdk.CfnOutput(stack, 'RDSInstancePort', {
    value: database.instanceEndpoint.port.toString(),
    description: 'RDS instance port',
  });

  new cdk.CfnOutput(stack, 'RDSDatabaseName', {
    value: 'modeled_analytics',
    description: 'RDS database name',
  });

  new cdk.CfnOutput(stack, 'RDSSecretArn', {
    value: database.secret?.secretArn || '',
    description: 'RDS credentials secret ARN',
  });

  return {
    database,
    vpc,
    securityGroup: dbSecurityGroup,
    credentials: dbCredentials,
  };
}

