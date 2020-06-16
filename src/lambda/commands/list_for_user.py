import json
import db
import os

def list_command(user_id):
    query = """
        select
        uc.id
        ,c.text
        ,uc.enabled
        ,c.id
        from commands c
        left join (
                select *
                from user_commands uc
                where uc.user_id = {user_id}
        ) uc on uc.command_id = c.id
        order by (
                case when enabled then 1
                when enabled is null then 2
                else 3 end
        ) asc, c.text asc
    """.format(user_id=user_id)
    print(query)
    if os.getenv('DEV'):
        return
    return db.all(query)

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

def get_phone_from_event(event):
    return int(event.get("pathParameters", {}).get("phone", 1))

def lambda_handler(event, context):
    user_id = get_phone_from_event(event)
    result = list_command(user_id)
    print(result)
    return get_response(result)

if __name__ == '__main__':
    with open('./list-for-user-event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
