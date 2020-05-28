import boto3

def lambda_handler(_event, _context):
    print("Enabling VDS")
    events = boto3.client('events')
    events.enable_rule(
        Name='CW_rule_cron_job'
    )

if __name__ == '__main__':
    session = boto3.Session(profile_name="virtual-drill-sergeant")
    lambda_handler(1, 1)
