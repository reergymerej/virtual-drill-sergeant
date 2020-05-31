import random as get_random
from connect import get_connection

connection = get_connection()

def query(sql):
    cursor = connection.cursor()
    cursor.execute(sql)
    return cursor

def one(sql):
    return query(sql).fetchone()

def all(sql):
    return query(sql).fetchall()

def random(sql):
    results = all(sql)
    return get_random.choice(results)
