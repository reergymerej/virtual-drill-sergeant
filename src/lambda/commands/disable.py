import json
import db
import os

def disable_command(command_log_id):
    query = """
        UPDATE commands
        SET disabled = TRUE
        WHERE id IN (
        SELECT command_id
        FROM command_log
        WHERE command_log.id = {0}
        )
        RETURNING id, text, disabled
    """.format(command_log_id)
    print(query)
    if os.getenv('DEV'):
        return

    return db.insert(query)

def get_command_log_id_from_event(event):
    return int(event.get("pathParameters", {}).get("commandlogid", None))


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


def lambda_handler(event, context):
    command_log_id = get_command_log_id_from_event(event)
    result = disable_command(command_log_id)
    print(result)
    return get_response(result)

if __name__ == '__main__':
    with open('./disable-event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
