import psycopg2
import rds_config

def get_connection():
    """
    Create db connection
    """

    db_host = rds_config.db_host
    db_user = rds_config.db_username
    password = rds_config.db_password
    database = rds_config.db_name

    try:
        connection = psycopg2.connect(
            host = db_host,
            port = 5432,
            user = db_user,
            password = password,
            database = database
        )
    except:
        e = sys.exc_info()[0]
        print("ERROR: Unexpected error: Could not connect to db instance.")
        print(e)
        sys.exit()

    print("SUCCESS: Connection to RDS instance succeeded")
    return connection
