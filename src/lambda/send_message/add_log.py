import json
import db
import os
import psycopg2

def insert_command(command_id, number_id):
    query = """
INSERT INTO command_log(command_id, number_id)
VALUES ({0}, {1})
RETURNING id""".format(command_id, number_id)
    print(query)
    # if os.getenv('DEV'):
    #     return

    return db.insert(query)

def get_command_id_from_event(event):
    responsePayload = event["responsePayload"]
    return responsePayload["message"]

def get_phone_id_from_event(event):
    responsePayload = event["responsePayload"]
    return responsePayload.get("phone", 1)

def lambda_handler(event, context):
    command_id = get_command_id_from_event(event)
    number_id = get_phone_id_from_event(event)
    try:
        return insert_command(command_id, number_id)
    except psycopg2.errors.ForeignKeyViolation as e:
        print("The command_id {0} is not valid.".format(command_id))
        raise(e)
    except Exception as e:
        print("There was an error inserting the record.")
        print(e)
        raise e

if __name__ == '__main__':
    with open('./dummy-event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
