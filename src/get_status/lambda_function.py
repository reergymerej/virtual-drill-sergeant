import boto3
import json
import logging

def main(_event, _context):
    events = boto3.client('events')

    rule_name = 'CW_rule_cron_job'
    rule_details = events.describe_rule(
        Name=rule_name
    )

    state = rule_details["State"]
    print("{0} is {1}.".format(rule_name, state))

    return {
        'statusCode': 200,
        'body': json.dumps({
            "status": state
        })
    }

if __name__ == '__main__':
    session = boto3.Session(profile_name="virtual-drill-sergeant")
    main(None, None)
