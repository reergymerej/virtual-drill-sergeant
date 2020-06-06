import boto3
import db
import os
import json

def get_command():
    return db.random("SELECT id, text FROM commands")

def get_message(command, phone_id):
    return """{0}
http://vds.reergymerej.com/?id={1}""".format(command, phone_id)

def get_phone(phone_id):
    return db.one("SELECT id, phone FROM numbers WHERE id = {0}".format(phone_id))

def send_message(number, message):
    print('Send "{0}" to {1}.'.format(message, number))

    if os.getenv('DEV'):
        return

    sns = boto3.client("sns")
    return sns.publish(
        PhoneNumber=number,
        Message=message
    )

def lambda_handler(event, context):
    phone = get_phone(event.get("phone"))
    phone_id = phone[0]
    number = phone[1]
    command_row = get_command()
    message_id = command_row[0]
    message_text = get_message(command_row[1], phone_id)
    send_message(number, message_text)
    return {
        "message": message_id,
        "phone": phone_id,
    }

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
