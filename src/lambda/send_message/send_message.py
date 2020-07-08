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
                user_commands.enabled
        FROM user_commands
        JOIN commands ON commands.id = user_commands.command_id
        WHERE user_commands.user_id = {user_id}
            and user_commands.enabled
    """.format(user_id=user_id)
    print(sql)
    return db.random(sql)

def get_message(command, user_id, command_log_id):
    return """{command}
http://vds.reergymerej.com/?id={user_id}&c={command_log_id}#0
""".format(
    command=command,
    user_id=user_id,
    command_log_id=command_log_id
)

def save_command(user_commands_id):
    if os.getenv('DEV'):
        return 'fake-log-id'
    command_log_id = insert_command(user_commands_id)
    return command_log_id

def publish_sns(message, phone_number):
    print("sending to {0}".format(phone_number))
    if os.getenv('DEV'):
        print("...skipping send")
        return
    sns = boto3.client("sns")
    result = sns.publish(
        PhoneNumber=phone_number,
        Message=message,
        MessageAttributes = {
            'AWS.SNS.SMS.SMSType': {
                'DataType': 'String',
                'StringValue': 'Transactional',
            }
        }
    )
    print(result)
    return result

def handle_send_failure(command_id):
    sql = """
        DELETE
        FROM command_log
        WHERE id = {0}
    """.format(command_id)
    print("updating command for failure {0}".format(command_id))
    db.delete(sql)

def send_message_to_user(user_id, phone_number):
    print("generating message for '{user_id}'".format(user_id=user_id))
    result = False
    command_row = None
    command_log_id = None
    try:
        command_row = get_command(user_id)
    except IndexError:
        print("There are no commands to use.")
        result = False
    if command_row:
        user_commands_id = command_row[0]
        command_text = command_row[1]
        command_log_id = save_command(user_commands_id)
        print("command saved to log: {0}".format(command_log_id))
        try:
            message_text = get_message(command_text, user_id, command_log_id)
            print('Send "{0}" to {1}.'.format(message_text, phone_number))
            publish_sns(message_text, phone_number)
            result = True
        except:
            print(sys.exc_info()[1])
            handle_send_failure(command_log_id)
    return (user_id, result, command_log_id)

def lambda_handler(event, context):
    active_agent_user_ids = json.loads(event.get("responsePayload").get("body"))
    print(active_agent_user_ids)
    all_results = []
    for user_id_list in active_agent_user_ids:
        user_id = user_id_list[0]
        phone_number = user_id_list[1]
        result = send_message_to_user(user_id, phone_number)
        all_results.append(result)

    print("all results")
    print(all_results)
    return all_results

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        print(event)
        lambda_handler(event, None)
