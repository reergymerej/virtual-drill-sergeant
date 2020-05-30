import boto3
import os
import random
from connect import get_connection

def query(connection, sql):
    cursor = connection.cursor()
    cursor.execute(sql)
    return cursor

def one(connection, sql):
    return query(connection, sql).fetchone()

def all(connection, sql):
    return query(connection, sql).fetchall()

def get_message(connection):
    commands = all(connection, "SELECT text FROM commands")
    return random.choice(commands)[0]

def get_number(connection):
    return one(connection, "SELECT phone FROM numbers")[0]

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
    connection = get_connection()
    number = get_number(connection)
    message = get_message(connection)
    send_message(number, message)

if __name__ == '__main__':
    lambda_handler(None, None)
