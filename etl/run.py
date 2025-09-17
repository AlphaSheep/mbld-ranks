import logging
import schedule
import time
from functools import wraps

from extract_and_load import load_from_mysql_to_duckdb


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')
_logger = logging.getLogger(__name__)


def try_and_fail_safely(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            func(*args, **kwargs)
        except Exception as e:
            _logger.error(f"An error occurred: {e}", exc_info=True)
    return wrapper


# Schedule the ETL to run daily at 05:00
scheduled_job = schedule.every().day.at("05:00").do(try_and_fail_safely(load_from_mysql_to_duckdb))

# Also run the ETL immediately at startup (wrapped to log errors)
try_and_fail_safely(load_from_mysql_to_duckdb)()


while True:
    schedule.run_pending()
    time.sleep(100)
