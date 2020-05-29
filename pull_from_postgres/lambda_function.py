import sys
import logging
import rds_config
import psycopg2


#rds settings
rds_host  = "virtual-drill-sergeant.cl2pih0c6gge.us-east-1.rds.amazonaws.com"
db_user = rds_config.db_username
password = rds_config.db_password
database = rds_config.db_name


logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    connection = psycopg2.connect(
        host = rds_host,
        port = 5432,
        user = db_user,
        password = password,
        database = database
    )
except:
    e = sys.exc_info()[0]
    logger.error("ERROR: Unexpected error: Could not connect to db instance.")
    logger.error(e)
    sys.exit()

logger.info("SUCCESS: Connection to RDS instance succeeded")

def handler(event, context):
    """
    This function fetches content from MySQL RDS instance
    """

    item_count = 0

    with connection.cursor() as cur:
        print("Getting numbers...")
        cur.execute("select * from numbers")
        for row in cur:
            item_count += 1
            logger.info(row)
            print(row)

    return "done"

if __name__ == '__main__':
    handler(1, 1)
