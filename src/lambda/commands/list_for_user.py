import json
import db
import os

def list_command(user_id):
    query = """
        select uc.id
                ,uc.text
                ,uc.enabled
                ,uc.id
        from (
                select u.id as id
                ,c.text as text
                ,u.enabled as enabled
                ,c.id as command_id
                from commands c
                left join user_commands u on c.id = u.command_id
                where c.id not in (
                        select u.command_id
                        from user_commands u
                        where u.user_id = {user_id}
                )
                union
                select u.id as id
                ,c.text as text
                ,u.enabled as enabled
                ,c.id as command_id
                from commands c
                left join user_commands u on c.id = u.command_id
                where c.id in (
                        select u.command_id
                        from user_commands u
                        where u.user_id = {user_id}
                )
                and u.user_id = {user_id}
        ) as uc
        order by (
                case when enabled then 1
                when enabled is null then 2
                else 3 end
        ) asc, text asc
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
