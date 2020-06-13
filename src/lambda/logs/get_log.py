import db
import boto3
import json

def get_phone_from_event(event):
    return int(event.get("pathParameters", {}).get("phone", 1))

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

def get_log(user_id):
    sql = """
        select command_log.id
            ,commands.text
            ,command_log.executed
        from command_log
        join user_commands on user_commands.id = command_log.user_commands_id
        join commands on commands.id = user_commands.command_id
        where user_commands.user_id = {user_id}
        order by command_log.created_at desc
    """.format(user_id=user_id)
    print(sql)
    return db.all(sql)

def lambda_handler(event, context):
    phone = get_phone_from_event(event)
    user_id = phone
    print("Getting VDS logs for phone {0}".format(phone))
    try:
        log = get_log(user_id)
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
