import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';

export interface ProductServiceProps extends cdk.StackProps {
  productsTable: dynamodb.Table;
  stocksTable: dynamodb.Table;
  rdsInstance: DatabaseInstance;
  rdsSecurityGroups: SecurityGroup[];
  rdsVpc: Vpc;
}
