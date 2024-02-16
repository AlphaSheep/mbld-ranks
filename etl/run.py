from functools import wraps
import schedule
import time

from extract_and_load import load_from_mysql_to_duckdb


def try_and_fail_safely(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            func(*args, **kwargs)
        except Exception as e:
            print(f"An error occurred: {e}")
    return wrapper


schedule.every().day.at("05:00").do(try_and_fail_safely(load_from_mysql_to_duckdb))


while True:
    schedule.run_pending()
    time.sleep(100)
