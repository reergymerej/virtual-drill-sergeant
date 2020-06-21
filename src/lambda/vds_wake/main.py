import db
import json
import os

def get_active_agents():
    query = """
        -- active agents
        select a.user_id
        ,n.phone
        from agents a
        join numbers n on n.id = a.user_id
        where a.active
        and a.user_id not in (
          -- users who go messages recently
                select distinct(uc.user_id)
                from command_log cl
                join user_commands uc on uc.id = cl.user_commands_id
                where cl.created_at > now() - interval '1 hour'
        )
    """
    print(query)
    return db.all(query)

def get_path_param(event, param):
    return int(event.get("pathParameters", {}).get(param, None))

def get_from_body(event, value):
    body = json.loads(event.get("body", "{}"))
    return body.get(value, "")

def lambda_handler(event, context):
    active_agents = get_active_agents()
    # We should probably fan out once we get more users, but for now, just whip
    # these out.
    print(active_agents)
    return {
        'statusCode': 200,
        'body': json.dumps(active_agents)
    }

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
