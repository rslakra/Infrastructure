// Multi-Region Website Infrastructure - Pulumi Example (TypeScript)
// This is a simplified example for AWS

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const projectName = config.get("projectName") || "multiregion-website";
const environment = config.get("environment") || "prod";
const awsRegion = config.get("awsRegion") || "us-east-1";

// VPC
const vpc = new aws.ec2.Vpc(`${projectName}-vpc`, {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: `${projectName}-vpc`,
        Environment: environment,
    },
});

// Internet Gateway
const igw = new aws.ec2.InternetGateway(`${projectName}-igw`, {
    vpcId: vpc.id,
    tags: {
        Name: `${projectName}-igw`,
    },
});

// Public Subnets
const publicSubnet1 = new aws.ec2.Subnet(`${projectName}-public-1`, {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: `${awsRegion}a`,
    mapPublicIpOnLaunch: true,
    tags: {
        Name: `${projectName}-public-1`,
        "kubernetes.io/role/elb": "1",
    },
});

const publicSubnet2 = new aws.ec2.Subnet(`${projectName}-public-2`, {
    vpcId: vpc.id,
    cidrBlock: "10.0.2.0/24",
    availabilityZone: `${awsRegion}b`,
    mapPublicIpOnLaunch: true,
    tags: {
        Name: `${projectName}-public-2`,
        "kubernetes.io/role/elb": "1",
    },
});

// Private Subnets
const privateSubnet1 = new aws.ec2.Subnet(`${projectName}-private-1`, {
    vpcId: vpc.id,
    cidrBlock: "10.0.10.0/24",
    availabilityZone: `${awsRegion}a`,
    tags: {
        Name: `${projectName}-private-1`,
        "kubernetes.io/role/internal-elb": "1",
    },
});

const privateSubnet2 = new aws.ec2.Subnet(`${projectName}-private-2`, {
    vpcId: vpc.id,
    cidrBlock: "10.0.11.0/24",
    availabilityZone: `${awsRegion}b`,
    tags: {
        Name: `${projectName}-private-2`,
        "kubernetes.io/role/internal-elb": "1",
    },
});

// NAT Gateway
const natGatewayEip = new aws.ec2.Eip(`${projectName}-nat-eip`, {
    domain: "vpc",
    tags: {
        Name: `${projectName}-nat-eip`,
    },
});

const natGateway = new aws.ec2.NatGateway(`${projectName}-nat`, {
    allocationId: natGatewayEip.id,
    subnetId: publicSubnet1.id,
    tags: {
        Name: `${projectName}-nat`,
    },
});

// Route Tables
const publicRouteTable = new aws.ec2.RouteTable(`${projectName}-public-rt`, {
    vpcId: vpc.id,
    routes: [{
        cidrBlock: "0.0.0.0/0",
        gatewayId: igw.id,
    }],
    tags: {
        Name: `${projectName}-public-rt`,
    },
});

const privateRouteTable = new aws.ec2.RouteTable(`${projectName}-private-rt`, {
    vpcId: vpc.id,
    routes: [{
        cidrBlock: "0.0.0.0/0",
        natGatewayId: natGateway.id,
    }],
    tags: {
        Name: `${projectName}-private-rt`,
    },
});

// Route Table Associations
new aws.ec2.RouteTableAssociation(`${projectName}-public-1-rt-assoc`, {
    subnetId: publicSubnet1.id,
    routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${projectName}-public-2-rt-assoc`, {
    subnetId: publicSubnet2.id,
    routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${projectName}-private-1-rt-assoc`, {
    subnetId: privateSubnet1.id,
    routeTableId: privateRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${projectName}-private-2-rt-assoc`, {
    subnetId: privateSubnet2.id,
    routeTableId: privateRouteTable.id,
});

// EKS Cluster
const cluster = new eks.Cluster(`${projectName}-cluster`, {
    vpcId: vpc.id,
    subnetIds: [privateSubnet1.id, privateSubnet2.id],
    instanceType: "t3.xlarge",
    desiredCapacity: 3,
    minSize: 2,
    maxSize: 10,
    nodeAssociatePublicIpAddress: false,
    tags: {
        Environment: environment,
    },
});

// RDS Subnet Group
const dbSubnetGroup = new aws.rds.SubnetGroup(`${projectName}-db-subnet-group`, {
    subnetIds: [privateSubnet1.id, privateSubnet2.id],
    tags: {
        Name: `${projectName}-db-subnet-group`,
    },
});

// RDS Security Group
const dbSecurityGroup = new aws.ec2.SecurityGroup(`${projectName}-db-sg`, {
    vpcId: vpc.id,
    description: "Security group for RDS PostgreSQL",
    ingress: [{
        fromPort: 5432,
        toPort: 5432,
        protocol: "tcp",
        securityGroups: [cluster.nodeSecurityGroup.id],
    }],
    egress: [{
        fromPort: 0,
        toPort: 0,
        protocol: "-1",
        cidrBlocks: ["0.0.0.0/0"],
    }],
    tags: {
        Name: `${projectName}-db-sg`,
    },
});

// RDS PostgreSQL Instance
const dbInstance = new aws.rds.Instance(`${projectName}-db`, {
    identifier: `${projectName}-postgres`,
    engine: "postgres",
    engineVersion: "15.4",
    instanceClass: "db.t3.medium",
    allocatedStorage: 100,
    storageType: "gp3",
    dbName: "website_db",
    username: config.requireSecret("dbUsername"),
    password: config.requireSecret("dbPassword"),
    dbSubnetGroupName: dbSubnetGroup.name,
    vpcSecurityGroupIds: [dbSecurityGroup.id],
    backupRetentionPeriod: 7,
    skipFinalSnapshot: environment !== "prod",
    tags: {
        Name: `${projectName}-postgres`,
        Environment: environment,
    },
});

// ElastiCache Subnet Group
const cacheSubnetGroup = new aws.elasticache.SubnetGroup(`${projectName}-cache-subnet-group`, {
    subnetIds: [privateSubnet1.id, privateSubnet2.id],
});

// ElastiCache Security Group
const cacheSecurityGroup = new aws.ec2.SecurityGroup(`${projectName}-cache-sg`, {
    vpcId: vpc.id,
    description: "Security group for ElastiCache Redis",
    ingress: [{
        fromPort: 6379,
        toPort: 6379,
        protocol: "tcp",
        securityGroups: [cluster.nodeSecurityGroup.id],
    }],
    egress: [{
        fromPort: 0,
        toPort: 0,
        protocol: "-1",
        cidrBlocks: ["0.0.0.0/0"],
    }],
    tags: {
        Name: `${projectName}-cache-sg`,
    },
});

// ElastiCache Redis Cluster
const redisCluster = new aws.elasticache.ReplicationGroup(`${projectName}-redis`, {
    replicationGroupId: `${projectName}-redis`,
    description: "Redis cluster for caching",
    nodeType: "cache.t3.micro",
    port: 6379,
    parameterGroupName: "default.redis7",
    numCacheClusters: 1,
    subnetGroupName: cacheSubnetGroup.name,
    securityGroupIds: [cacheSecurityGroup.id],
    tags: {
        Name: `${projectName}-redis`,
        Environment: environment,
    },
});

// S3 Bucket for Static Assets
const assetsBucket = new aws.s3.Bucket(`${projectName}-assets-${environment}`, {
    bucket: `${projectName}-assets-${environment}`,
    tags: {
        Name: `${projectName}-assets`,
        Environment: environment,
    },
});

// CloudFront Distribution
const cloudFrontDistribution = new aws.cloudfront.Distribution(`${projectName}-cdn`, {
    enabled: true,
    origins: [{
        originId: assetsBucket.id,
        domainName: assetsBucket.bucketRegionalDomainName,
        s3OriginConfig: {
            originAccessIdentity: "",
        },
    }],
    defaultCacheBehavior: {
        targetOriginId: assetsBucket.id,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD"],
        forwardedValues: {
            queryString: false,
            cookies: {
                forward: "none",
            },
        },
        minTtl: 0,
        defaultTtl: 3600,
        maxTtl: 86400,
    },
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
    tags: {
        Environment: environment,
    },
});

// Export outputs
export const clusterName = cluster.eksCluster.name;
export const clusterEndpoint = cluster.eksCluster.endpoint;
export const kubeconfig = cluster.kubeconfig;
export const dbEndpoint = dbInstance.endpoint;
export const redisEndpoint = redisCluster.primaryEndpointAddress;
export const s3BucketName = assetsBucket.bucket;
export const cloudFrontUrl = cloudFrontDistribution.domainName;


