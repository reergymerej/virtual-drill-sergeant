# TODO: dedupe
import random as get_random
from connect import get_connection

def query(fn, sql):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(sql)
    if fn:
        result = fn(cursor)

    connection.commit()
    connection.close()
    cursor.close()
    return result

def one(sql):
    fn = lambda cursor: cursor.fetchone()
    return query(fn, sql)

def all(sql):
    fn = lambda cursor: cursor.fetchall()
    return query(fn, sql)

def random(sql):
    fn = lambda cursor: cursor.fetchall()
    results = query(fn, sql)
    return get_random.choice(results)

def insert(sql):
    fn = lambda cursor: None
    return query(fn, sql)
