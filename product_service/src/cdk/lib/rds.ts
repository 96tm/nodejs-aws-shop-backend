import { Construct } from 'constructs';

import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
} from 'aws-cdk-lib/aws-rds';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Vpc,
  SubnetType,
  SecurityGroup,
  Peer,
  Port,
} from 'aws-cdk-lib/aws-ec2';
import { Duration, RemovalPolicy, SecretValue } from 'aws-cdk-lib';

import '../../utils/load_env';

export class RdsConstruct extends Construct {
  readonly dbInstance: DatabaseInstance;
  readonly dbSecurityGroups: SecurityGroup[];
  readonly dbVpc: Vpc;

  constructor(scope: Construct, id: string = 'RdsConstruct') {
    super(scope, id);
    const engine = DatabaseInstanceEngine.postgres({
      version: PostgresEngineVersion.VER_15_3,
    });
    const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO);

    const vpc = new Vpc(this, 'RdsVPC', {
      subnetConfiguration: [
        {
          name: 'rds-public-subnet',
          subnetType: SubnetType.PUBLIC,
        },
      ],
      natGateways: 0,
    });
    this.dbVpc = vpc;

    const securityGroup = new SecurityGroup(this, 'RdsSecurityGroup', {
      securityGroupName: 'rds-security-group',
      vpc,
    });
    this.dbSecurityGroups = [securityGroup];

    // sorry about that
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.allTraffic());

    this.dbInstance = new DatabaseInstance(this, 'RdsInstance', {
      vpc,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      instanceType,
      engine,
      port: parseInt(process.env.POSTGRES_PORT),
      securityGroups: [securityGroup],
      databaseName: process.env.POSTGRES_NAME,
      backupRetention: Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: RemovalPolicy.DESTROY,
      credentials: Credentials.fromPassword(
        process.env.POSTGRES_USER,
        SecretValue.unsafePlainText(process.env.POSTGRES_PASSWORD)
      ),
    });
  }
}
