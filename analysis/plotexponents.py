
import math
from matplotlib.axes import Axes
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

import addcopyfighandler


def plot_exponents(a: float, ax: Axes):
    x = pd.Series(np.linspace(0, 1, 100))
    y = x.transform(lambda x: math.pow(x, a))
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    sns.lineplot(x=x, y=y, ax=ax)


def compare_exponents():
    fig, axes = plt.subplots(1, 2, sharey=True)
    plot_exponents(0.5, axes[0])
    plot_exponents(2, axes[1])
    plt.show()


def main():
    compare_exponents()


if __name__ == '__main__':
    main()

