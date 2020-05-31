import json
import boto3
import db
import os
import psycopg2

def get_log():
    return db.all( """
        select
            command_log.id,
            commands.text
        from command_log
        inner join commands on command_log.command_id = commands.id
        order by command_log.created_at desc
    """)

def lambda_handler(event, context):
    try:
        log = get_log()
        print(json.dumps(log))
        return log
    except Exception as e:
        print("There was an error fetching the log of commands.")
        print(e)
        raise e

if __name__ == '__main__':
    lambda_handler(None, None)
