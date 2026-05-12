export const cloudServices = [
  { name: 'EC2',          cost: 4820, usage: 34 },
  { name: 'RDS',          cost: 3100, usage: 28 },
  { name: 'ElastiCache',  cost: 980,  usage: 19 },
  { name: 'EKS',          cost: 2200, usage: 41 },
  { name: 'S3',           cost: 1240, usage: 71 },
  { name: 'Lambda',       cost: 390,  usage: 89 },
  { name: 'CloudFront',   cost: 560,  usage: 66 },
  { name: 'NAT Gateway',  cost: 720,  usage: 55 },
]

export const totalCost = cloudServices.reduce((sum, s) => sum + s.cost, 0)

export const avgUsage = Math.round(
  cloudServices.reduce((sum, s) => sum + s.usage, 0) / cloudServices.length
)

export const mockRecommendations = [
  {
    service:  'EC2',
    issue:    'Instances running at 34% utilisation — severely over-provisioned',
    action:   'Right-size to t3.medium or use Auto Scaling groups to match demand',
    saving:   1820,
    severity: 'critical',
    category: 'rightsizing',
  },
  {
    service:  'RDS',
    issue:    'On-demand pricing with only 28% utilisation across database fleet',
    action:   'Switch to Reserved Instances with 1-year commitment for predictable workloads',
    saving:   1240,
    severity: 'critical',
    category: 'reserved',
  },
  {
    service:  'ElastiCache',
    issue:    'Cache cluster at 19% utilisation — likely over-provisioned at creation',
    action:   'Downsize node type and enable auto-scaling; consider serverless tier',
    saving:   560,
    severity: 'high',
    category: 'rightsizing',
  },
  {
    service:  'EKS',
    issue:    'Node groups running at 41% capacity with no spot instance usage',
    action:   'Introduce Spot node groups for non-critical workloads to cut compute cost',
    saving:   880,
    severity: 'high',
    category: 'architecture',
  },
  {
    service:  'NAT Gateway',
    issue:    'High data-transfer charges from all traffic routing through single NAT',
    action:   'Deploy VPC endpoints for S3 and DynamoDB to bypass NAT Gateway fees',
    saving:   390,
    severity: 'medium',
    category: 'network',
  },
  {
    service:  'S3',
    issue:    'Standard storage class used for infrequently accessed objects',
    action:   'Enable S3 Intelligent-Tiering or lifecycle rules to move cold data to Glacier',
    saving:   310,
    severity: 'medium',
    category: 'storage',
  },
  {
    service:  'CloudFront',
    issue:    'Price class set to All Edges — many regions have negligible traffic',
    action:   'Switch to Price Class 100 (US/EU) to eliminate low-traffic edge locations',
    saving:   180,
    severity: 'low',
    category: 'network',
  },
  {
    service:  'Lambda',
    issue:    'Memory allocation set to 1024 MB but average execution uses under 200 MB',
    action:   'Use AWS Lambda Power Tuning to find optimal memory/cost configuration',
    saving:   95,
    severity: 'low',
    category: 'rightsizing',
  },
]
