import math

import pytest

from trading_simulator.metrics import build_report, max_drawdown, sharpe_ratio


def test_max_drawdown_simple_series():
    curve = [100, 120, 90, 95, 130, 80]
    dd = max_drawdown(curve)
    assert dd == pytest.approx((80 - 130) / 130)


def test_max_drawdown_monotonic_up_is_zero():
    assert max_drawdown([100, 110, 120, 130]) == 0.0


def test_sharpe_ratio_zero_for_constant_returns_with_zero_excess():
    returns = [0.0] * 10
    assert sharpe_ratio(returns, periods_per_year=252) == 0.0


def test_sharpe_ratio_positive_for_positive_drift():
    returns = [0.01, 0.012, 0.009, 0.011, 0.010]
    assert sharpe_ratio(returns, periods_per_year=252) > 0


def test_build_report_total_return_and_cagr():
    equity_curve = [10_000 * (1.0005 ** i) for i in range(253)]
    report = build_report(equity_curve, fills=[], periods_per_year=252)
    expected_total_return = equity_curve[-1] / equity_curve[0] - 1.0
    assert report.total_return == pytest.approx(expected_total_return)
    assert report.cagr > 0
    assert report.num_trades == 0
    assert report.win_rate == 0.0


def test_build_report_requires_at_least_two_points():
    with pytest.raises(ValueError):
        build_report([10_000], fills=[])
