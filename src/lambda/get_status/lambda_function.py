import boto3
import json

def get_phone_from_event(event):
    return int(event.get("pathParameters", {}).get("phone", 1))

def get_rule_for_phone(phone):
    rule_name = "CW_rule_cron_job"
    if phone == 3:
        rule_name = "VDS_send_message"
    return rule_name

def get_response(body):
    return {
        "isBase64Encoded": "false",
        "statusCode": 200, # 204 won't send body to api gateway for some reason
        "headers": {
            "Access-Control-Allow-Origin":"*",
            "Content-Type": "application/json"
        },
        "body": json.dumps(body),
    }

def main(event, _context):
    phone = get_phone_from_event(event)
    print("Checking VDS status for phone {0}".format(phone))

    events = boto3.client('events')

    rule_name = 'CW_rule_cron_job'
    rule_details = events.describe_rule(
        Name=get_rule_for_phone(phone)
    )

    state = rule_details["State"]
    print("{0} is {1}.".format(rule_name, state))

    return get_response({
        "status": state
    })

if __name__ == '__main__':
    session = boto3.Session(profile_name="virtual-drill-sergeant")
    main(None, None)
