import boto3
import db
import os
import psycopg2

def get_number():
    return db.one("SELECT phone FROM numbers")[0]

def insert_command(id):
    query = "INSERT INTO command_log(command_id) VALUES ({0})".format(id)
    print(query)
    if os.getenv('DEV'):
        return

    return db.insert(query)

def get_command_id_from_event(event):
    print(event)
    return 999

def lambda_handler(event, context):
    command_id = get_command_id_from_event(event)
    try:
        insert_command(command_id)
    except psycopg2.errors.ForeignKeyViolation as e:
        print("The command_id {0} is not valid.".format(command_id))
    except Exception as e:
        print("There was an error inserting the record.")
        print(e)
        raise e

if __name__ == '__main__':
    lambda_handler(None, None)
