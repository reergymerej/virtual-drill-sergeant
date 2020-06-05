import db
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

def get_log(phone):
    return db.all( """
        select
            command_log.id,
            commands.text,
            command_log.executed
        from command_log
        inner join commands on command_log.command_id = commands.id
        left join numbers on command_log.number_id = numbers.id
        where numbers.id = {0}
        order by command_log.created_at desc
    """.format(phone))

def lambda_handler(event, context):
    phone = get_phone_from_event(event)
    print("Getting VDS logs for phone {0}".format(phone))
    try:
        log = get_log(phone)
        print(json.dumps(log))
        return get_response(log)
    except Exception as e:
        print("There was an error fetching the log of commands.")
        print(e)
        raise e

if __name__ == '__main__':
    session = boto3.Session(profile_name="virtual-drill-sergeant")
    with open('./dummy-event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
