from typing import Tuple, Optional

import os
from matplotlib.axes import Axes
from mysql import connector as mysql
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import stats

import addcopyfighandler


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


def cube_count_distributions(data: pd.DataFrame) -> None:
    fig, axes = plt.subplots(1, 2, sharey=True)
    sns.histplot(
        data=data,
        x='solved',
        ax=axes[0],
        bins=range(0, 70, 1),
    )
    sns.histplot(
        data=data,
        x='attempted',
        ax=axes[1],
        bins=range(0, 70, 1),
    )
    plt.show()


def accuracy_distribution(data: pd.DataFrame, ax: Optional[Axes] = None) -> None:
    sns.histplot(
        data=data,
        x='accuracy',
        bins=range(50, 101, 2),
        ax=ax,
    )


from numpy.random import random_sample

def add_fuzziness(data: pd.DataFrame) -> pd.DataFrame:
    fuzzy_data = data.copy()

    fuzziness = (-0.5 + random_sample(len(fuzzy_data))) * (100 / fuzzy_data['attempted'])
    fuzzy_data['fuzzy_accuracy'] = fuzzy_data['accuracy'] + fuzziness

    out_of_range = (fuzzy_data['fuzzy_accuracy'] > 100) | (fuzzy_data['fuzzy_accuracy'] < 50)
    fuzzy_data.loc[out_of_range, 'fuzzy_accuracy'] = fuzzy_data.loc[out_of_range, 'fuzzy_accuracy'] - 2 * fuzziness[out_of_range]

    return fuzzy_data


def filter_by_attempt_size(data: pd.DataFrame, size_range: Tuple[int, int]) -> pd.DataFrame:
    return data[(data['attempted'] >= size_range[0]) & (data['attempted'] <= size_range[1])]


def fuzzy_accuracy_distribution(data: pd.DataFrame, ax: Optional[Axes] = None) -> None:
    sns.histplot(
        data=data,
        x='fuzzy_accuracy',
        bins=range(50, 101, 2),
        ax=ax,
    )


def accuracy_distribution_by_attempt_size(data: pd.DataFrame) -> None:
    fig, axes = plt.subplots(2, 2)
    plt.subplots_adjust(hspace=0.7, wspace=0.4)

    fuzz_data = add_fuzziness(data)

    fuzzy_accuracy_distribution(filter_by_attempt_size(fuzz_data, (3, 10)), axes[0][0])
    fuzzy_accuracy_distribution(filter_by_attempt_size(fuzz_data, (11, 20)), axes[0][1])
    fuzzy_accuracy_distribution(filter_by_attempt_size(fuzz_data, (21, 30)), axes[1][0])
    fuzzy_accuracy_distribution(filter_by_attempt_size(fuzz_data, (31, 66)), axes[1][1])

    axes[0][0].set_title('3-10 cubes')
    axes[0][1].set_title('11-20 cubes')
    axes[1][0].set_title('21-30 cubes')
    axes[1][1].set_title('31-66 cubes')

    plt.show()


def speed_distribution(data: pd.DataFrame) -> None:
    sns.histplot(
        data=data,
        x='timePerCube',
        bins=range(0, 601, 10),
    )
    plt.show()


def speed_distribution_subplot(data: pd.DataFrame, ax: Optional[Axes] = None) -> None:
    sns.histplot(
        data=data,
        x='timePerCube',
        bins=range(0, 601, 10),
        ax=ax,
    )


def cubes_per_hour_distribution(data: pd.DataFrame) -> None:
    data['could_solve_per_hour'] = 3600 / data.timePerCube
    sns.histplot(
        data=data,
        x='could_solve_per_hour',
        bins=range(60, 201, 5),
    )
    plt.show()


def speed_distribution_by_attempt_size(data: pd.DataFrame) -> None:
    fig, axes = plt.subplots(2, 2)
    plt.subplots_adjust(hspace=0.7, wspace=0.4)

    speed_distribution_subplot(filter_by_attempt_size(data, (13, 13)), axes[0][0])
    speed_distribution_subplot(filter_by_attempt_size(data, (17, 17)), axes[0][1])
    speed_distribution_subplot(filter_by_attempt_size(data, (25, 25)), axes[1][0])
    speed_distribution_subplot(filter_by_attempt_size(data, (33, 33)), axes[1][1])
    axes[0][0].set_title('13 cubes')
    axes[0][1].set_title('17 cubes')
    axes[1][0].set_title('25 cubes')
    axes[1][1].set_title('33 cubes')

    plt.show()


def speed_vs_solved_by_accuracy_scatter(data: pd.DataFrame) -> None:
    sns.scatterplot(
        x='solved',
        y='timePerCube',
        hue='accuracy',
        data=data,
        palette='viridis_r',
    )
    plt.xlim(0, 70)
    plt.ylim(0, 600)

    plt.show()


def predicted_speed_vs_solved_by_accuracy_scatter() -> None:
    t = lambda n, a: min(3600 * (a/100) / n , 600)

    approx = pd.DataFrame([{
        'solved': n,
        'accuracy': a,
        'timePerCube': t(n, a),
    } for n in range(2, 66) for a in range(50, 101, 5)])

    sns.scatterplot(
        x='solved',
        y='timePerCube',
        hue='accuracy',
        data=approx,
        palette='viridis_r',
    )
    plt.xlim(0, 70)
    plt.ylim(0, 600)

    plt.show()


def speed_vs_solved_by_accuracy_scatter_without_time_limit(data: pd.DataFrame) -> None:
    sns.scatterplot(
        x='solved',
        y='timePerCube',
        hue='accuracy',
        data=data[(data['seconds'] < 2700) & (data['timePerCube'] < 450)],
        palette='viridis_r',
    )
    plt.xlim(0, 70)
    plt.ylim(0, 600)

    plt.show()


def population_size_below_time_limit(data: pd.DataFrame, attempt_size: int) -> None:
    time_threshold = 0.75
    max_time = 3600 * time_threshold
    max_time_per_cube = 600 * time_threshold

    data_subset = data[(data['attempted'] <= attempt_size)]

    count = len(data_subset)
    count_below_time_limit = len(data_subset[
        (data_subset['seconds'] < max_time) &
        (data_subset['timePerCube'] < max_time_per_cube)
    ])

    print(f'Number of attempts of at least {attempt_size} cubes: {count}')
    print(f'Number of attempts of at least {attempt_size} cubes and well below time limit: {count_below_time_limit}')
    print(f'Percentage: { 100 - count_below_time_limit / count * 100}%')


def pair_plot(data: pd.DataFrame) -> None:
    sns.pairplot(
        data=data,
        vars=['solved', 'attempted', 'fuzzy_accuracy', 'timePerCube'],
        hue='attempt_num',
        palette='viridis_r',
    )
    plt.show()




def speed_vs_accuracy_bivariate_histogram(data: pd.DataFrame) -> None:
    data=add_fuzziness(data)

    spearman_corr, p_value_spearman = stats.spearmanr(data['accuracy'], data['timePerCube'])
    print(f"Spearman correlation coefficient: {spearman_corr}, p-value: {p_value_spearman}")

    sns.histplot(
        data=data,
        x='timePerCube',
        y='fuzzy_accuracy',
    )
    plt.show()



def add_largest_prev_attempt_column(data: pd.DataFrame) -> pd.DataFrame:
    data.sort_values(by='attempt_num', inplace=True)
    data.reset_index(inplace=True)
    data['largest_prev_attempt'] = data.groupby('personId')['attempted'].transform(lambda x: x.shift(1).cummax())
    return data


def attempt_size_vs_largest_prev_attempt_scatter(data: pd.DataFrame) -> None:
    data = add_largest_prev_attempt_column(data)

    sns.scatterplot(
        x='largest_prev_attempt',
        y='solved',
        hue='timePerCube',
        data=data,
        palette='viridis_r',
    )
    plt.show()


def main():

    sns.set_style('darkgrid')
    plt.rcParams['figure.figsize'] = (8, 4.5)


    data = fetch_data()

    attempt_size_vs_largest_prev_attempt_scatter(data)

    plt.show()


if __name__ == '__main__':
    main()
