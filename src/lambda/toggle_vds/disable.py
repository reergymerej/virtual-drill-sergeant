import json
import boto3

def lambda_handler(_event, _context):
    print("Disabling VDS")
    events = boto3.client('events')
    events.disable_rule(
        Name='CW_rule_cron_job'
    )
    return {
        'message': 'VDS Disabled',
    }

if __name__ == '__main__':
    session = boto3.Session(profile_name="virtual-drill-sergeant")
    lambda_handler(1, 1)
