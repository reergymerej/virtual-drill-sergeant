import boto3
import sys
import db
import os
import json
from add_log import insert_command

def get_command(user_id):
    sql = """
        SELECT user_commands.id,
                commands.text,
                user_commands.disabled
        FROM user_commands
        JOIN commands ON commands.id = user_commands.command_id
        WHERE user_commands.user_id = {user_id}
    """.format(user_id=user_id)
    print(sql)
    return db.random(sql)

def get_message(command, user_id, command_log_id):
    return """{command}
complete: http://vds.reergymerej.com/?id={user_id}&log-id={command_log_id}
manage: http://vds.reergymerej.com/?id={user_id}""".format(
    command=command,
    user_id=user_id,
    command_log_id=command_log_id
)

def get_phone(phone_id):
    sql = "SELECT id, phone FROM numbers WHERE id = {0}".format(phone_id)
    print(sql)
    return db.one(sql)

def save_command(user_commands_id, phone_id):
    if os.getenv('DEV'):
        return 'fake-log-id'
    command_log_id = insert_command(user_commands_id)
    return command_log_id

def publish_sns(message, number):
    print("sending to {0}".format(number))
    if os.getenv('DEV'):
        print("...skipping send")
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
        WHERE id = {0}
    """.format(command_id)
    print("updating command for failure {0}".format(command_id))
    db.delete(sql)

def lambda_handler(event, context):
    phone = get_phone(event.get("phone"))
    phone_id = phone[0]
    number = phone[1]
    result = False
    command_row = None
    try:
        command_row = get_command(phone_id)
    except IndexError:
        print("There are no commands to use.")
        result = False
    if command_row:
        user_commands_id = command_row[0]
        command_text = command_row[1]
        command_log_id = save_command(user_commands_id, phone_id)
        print("command saved to log: {0}".format(command_log_id))
        try:
            message_text = get_message(command_text, phone_id, command_log_id)
            print('Send "{0}" to {1}.'.format(message_text, number))
            publish_sns(message_text, number)
            result = True
        except:
            print(sys.exc_info()[1])
            handle_send_failure(command_log_id)
    return {
        "command_log_id": command_log_id,
        "result": result,
    }

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        print(event)
        lambda_handler(event, None)
