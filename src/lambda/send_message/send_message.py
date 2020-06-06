import boto3
import sys
import db
import os
import json
from add_log import insert_command

def get_command():
    return db.random("SELECT id, text FROM commands")

def get_message(command, phone_id, command_log_id):
    return """{0}
http://vds.reergymerej.com/?id={1}&log-id={2}""".format(command, phone_id, command_log_id)

def get_phone(phone_id):
    return db.one("SELECT id, phone FROM numbers WHERE id = {0}".format(phone_id))

def save_command(message_id, phone_id):
    command_log_id = insert_command(message_id, phone_id)
    return command_log_id

def publish_sns(message, number):
    print("sending to {0}".format(number))
    if os.getenv('DEV'):
        return
    sns = boto3.client("sns")
    return sns.publish(
        PhoneNumber=number,
        Message=message
    )

def handle_send_failure(command_id):
    sql = """
DELETE
FROM command_log
WHERE id = {0}""".format(command_id)
    print("updating command for failure {0}".format(command_id))
    db.delete(sql)

def lambda_handler(event, context):
    phone = get_phone(event.get("phone"))
    phone_id = phone[0]
    number = phone[1]

    command_row = get_command()
    message_id = command_row[0]

    command_log_id = save_command(message_id, phone_id)
    print("command saved to log: {0}".format(command_log_id))

    result = False
    try:
        message_text = get_message(command_row[1], phone_id, command_log_id)
        print('Send "{0}" to {1}.'.format(message_text, number))
        publish_sns(message_text, number)
        result = True
    except:
        print(sys.exc_info()[1])
        handle_send_failure(command_log_id)

    return {
        "message": message_id,
        "phone": phone_id,
        "result": result,
    }

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
