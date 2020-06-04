import db
import os
import json

def update_log(id):
    query = """
        UPDATE command_log SET executed = TRUE
        WHERE id = {0}
    """.format(id)
    print(query)
    if os.getenv('DEV'):
        return

    return db.insert(query)

def get_command_id_from_event(event):
    print(event)
    return int(event["pathParameters"]["id"])

def lambda_handler(event, context):
    command_id = get_command_id_from_event(event)
    try:
        update_log(command_id)
        return {
            "isBase64Encoded": "false",
            "statusCode": 200, # 204 won't send body to api gateway for some reason
            "headers": {
                "Access-Control-Allow-Origin":"*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({})
        }

    except Exception as e:
        print("There was an updating the log.")
        print(e)
        raise e

if __name__ == '__main__':
    lambda_handler(None, None)
