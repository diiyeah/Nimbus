"""
Fallback mock recommendations used when Gemini API is unavailable.
Generated based on the service name and usage patterns.
"""

MOCK_RECS = {
    "EC2":         {"issue": "Instances running at low utilisation — over-provisioned", "action": "Right-size to t3.medium or use Auto Scaling groups", "severity": "critical", "category": "rightsizing"},
    "RDS":         {"issue": "On-demand pricing with low utilisation across database fleet", "action": "Switch to Reserved Instances with 1-year commitment", "severity": "critical", "category": "reserved"},
    "ElastiCache": {"issue": "Cache cluster at very low utilisation", "action": "Downsize node type and enable auto-scaling", "severity": "high", "category": "rightsizing"},
    "EKS":         {"issue": "Node groups running with no spot instance usage", "action": "Introduce Spot node groups for non-critical workloads", "severity": "high", "category": "architecture"},
    "NAT Gateway": {"issue": "High data-transfer charges from single NAT routing", "action": "Deploy VPC endpoints for S3 and DynamoDB", "severity": "medium", "category": "network"},
    "S3":          {"issue": "Standard storage class used for infrequently accessed objects", "action": "Enable S3 Intelligent-Tiering or lifecycle rules", "severity": "medium", "category": "storage"},
    "CloudFront":  {"issue": "Price class set to All Edges with low traffic regions", "action": "Switch to Price Class 100 (US/EU only)", "severity": "low", "category": "network"},
    "Lambda":      {"issue": "Memory allocation higher than average execution needs", "action": "Use AWS Lambda Power Tuning to optimise memory", "severity": "low", "category": "rightsizing"},
}


def get_mock_recommendations(rows: list[dict]) -> list[dict]:
    """Generate mock recommendations based on actual billing rows."""
    results = []
    for row in rows:
        name  = row.get("name", "")
        cost  = row.get("cost", 0)
        usage = row.get("usage", 50)
        waste = 100 - usage

        # Estimate saving as % of cost based on waste level
        if waste >= 70:
            saving_pct, severity = 0.38, "critical"
        elif waste >= 50:
            saving_pct, severity = 0.28, "high"
        elif waste >= 30:
            saving_pct, severity = 0.18, "medium"
        else:
            saving_pct, severity = 0.08, "low"

        template = MOCK_RECS.get(name, {
            "issue":    f"{name} running at {usage}% utilisation — potential savings identified",
            "action":   f"Review {name} configuration and right-size based on actual usage",
            "severity": severity,
            "category": "rightsizing",
        })

        results.append({
            "service":  name,
            "issue":    template["issue"],
            "action":   template["action"],
            "saving":   round(cost * saving_pct, 2),
            "severity": template["severity"],
            "category": template["category"],
        })

    # Sort by saving descending
    results.sort(key=lambda r: r["saving"], reverse=True)
    return results
