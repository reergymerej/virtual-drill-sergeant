# TODO: dedupe
import random as get_random
from connect import get_connection

def query(sql):
    # TODO: pool this as performance requires
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(sql)

    connection.commit()
    connection.close()
    cursor.close()
    return cursor

def one(sql):
    return query(sql).fetchone()

def all(sql):
    return query(sql).fetchall()

def random(sql):
    results = all(sql)
    return get_random.choice(results)

def insert(sql):
    return query(sql)
