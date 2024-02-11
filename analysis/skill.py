from functools import lru_cache
import re
from typing import Tuple, Optional

import os
import math
from matplotlib.axes import Axes
from mysql import connector as mysql
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pyparsing import alphanums
import seaborn as sns
from scipy.optimize import minimize, differential_evolution, dual_annealing

import addcopyfighandler


ACCURACY_EXPONENT = 0.5
SPEED_EXPONENT = 0.5


def fetch_data() -> pd.DataFrame:
    conn = mysql.connect(
        database='wca_public',
        user = os.environ['MYSQL_USER'],
        password = os.environ['MYSQL_PASSWORD'],
    )

    query = "SELECT * FROM multisolves;"

    data = pd.read_sql(query, conn)
    data['accuracy'] = data['accuracy'] * 100
    return data


def dump_to_csv(data: pd.DataFrame) -> None:
    with open('results.csv', 'w') as f:
        data.to_csv(f, index=False, lineterminator='\n')


def add_rank_column(data: pd.DataFrame, column: str, ascending: bool = True) -> pd.DataFrame:
    data.sort_values(by=column, inplace=True)
    data[f'rank_{column}'] = data[column].rank(method='dense', ascending=ascending)

    return data


def add_calculate_score(data: pd.DataFrame, accuracy_exponent: float, time_exponent: float) -> pd.DataFrame:
    data['score'] = data.solved * \
        data.accuracy.transform(lambda x: math.pow(x / 100, accuracy_exponent)) / \
        data.fraction_time_used.transform(lambda x: math.pow(x, time_exponent))

    return data


def cost_function(data: pd.DataFrame, accuracy_exponent: float, time_exponent: float) -> float:
    data = add_calculate_score(data, accuracy_exponent, time_exponent)
    data = add_rank_column(data, 'score', ascending=False)
    sqr_error = (data.rank_score - data.rank_result) ** 2

    # print('guessing', accuracy_exponent, time_exponent, np.sqrt(sqr_error.sum()))

    return np.sqrt(sqr_error.sum())


def optimize_exponents(data: pd.DataFrame) -> Tuple[float, float]:
    data = add_rank_column(data, 'result')
    data['available_time'] = data.attempted.transform(lambda x: x * 600 if x < 6 else 3600)
    data['fraction_time_used'] = data.seconds / data.available_time

    bounds = [(0, 2), (0, 1)]

    result = differential_evolution(
        lambda x: cost_function(data, x[0], x[1]),
        bounds,
        maxiter=1000,
        tol=1e-4,
    )

    if not result.success:
        raise Exception('Failed to optimize: ' + result.message)

    print(f"Accuracy exponent: {result.x[0]:.4f}, Time exponent: {result.x[1]:.4f}")

    return result.x






def add_max_columns(data: pd.DataFrame) -> pd.DataFrame:
    data['could_solve_per_hour'] = 3600 / data.timePerCube
    data.sort_values(by='attempt_num', inplace=True)
    data.reset_index(inplace=True)

    data['max_potential'] = data.groupby('personId')['could_solve_per_hour'].transform(lambda x: x.shift(1).cummax())
    data['most_prev_solved'] = data.groupby('personId')['solved'].transform(lambda x: x.shift(1).cummax())
    data['largest_prev_attempt'] = data.groupby('personId')['attempted'].transform(lambda x: x.shift(1).cummax())
    data['fastest_prev_solve'] = data.groupby('personId')['timePerCube'].transform(lambda x: x.shift(1).cummin())
    data['best_prev_rank'] = data.groupby('personId')['rank_result'].transform(lambda x: x.shift(1).cummin())

    return data


def add_world_records(data: pd.DataFrame) -> pd.DataFrame:
    data.sort_values(by='date', inplace=True)
    data['world_record'] = data['score'].transform(lambda x: x.cummax())
    return data



def main():
    sns.set_style('darkgrid')
    plt.rcParams['figure.figsize'] = (8, 4.5)

    data = fetch_data()

    data = add_rank_column(data, 'result')
    data = add_max_columns(data)

    data['available_time'] = data.attempted.transform(lambda x: x * 600 if x < 6 else 3600)
    data['fraction_time_used'] = data.seconds / data.available_time

    data = add_calculate_score(data, 1, 0.5)
    data = add_rank_column(data, 'score', ascending=False)

    data = add_world_records(data)

    wr_history = data[data['score'] == data['world_record']]
    print(wr_history)

    wr_history.to_csv('wr_history.csv', index=False, lineterminator='\n')

    dump_to_csv(data)

    print()



if __name__ == '__main__':
    main()

