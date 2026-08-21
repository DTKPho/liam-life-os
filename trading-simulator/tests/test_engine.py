from trading_simulator.engine import SimulationEngine
from trading_simulator.execution import CommissionModel, ExecutionConfig
from trading_simulator.market import MarketSimulator
from trading_simulator.metrics import build_report
from trading_simulator.portfolio import Portfolio
from trading_simulator.strategy import MeanReversionStrategy, SmaCrossoverStrategy


def run_sim(strategy_factory, seed=123, days=300, initial_cash=10_000.0, max_leverage=2.0):
    market = MarketSimulator(seed=seed, start_price=100.0, annual_volatility=0.3)
    strategy = strategy_factory("SIM")
    portfolio = Portfolio(initial_cash=initial_cash, max_leverage=max_leverage)
    execution_config = ExecutionConfig(commission=CommissionModel(pct_of_notional=0.0005, minimum_fee=0.5))
    engine = SimulationEngine(market=market, strategy=strategy, portfolio=portfolio, execution_config=execution_config)
    result = engine.run(days)
    return result, initial_cash


def test_sma_strategy_runs_end_to_end_and_produces_report():
    result, initial_cash = run_sim(lambda s: SmaCrossoverStrategy(s, fast_window=5, slow_window=20, order_size=5))
    equity_curve = [initial_cash] + result.portfolio.equity_series()
    assert len(equity_curve) == 301
    assert all(e > 0 for e in equity_curve)
    report = build_report(equity_curve, result.portfolio.fills)
    assert report.num_trades >= 0
    assert isinstance(report.sharpe_ratio, float)


def test_mean_reversion_strategy_runs_end_to_end():
    result, initial_cash = run_sim(
        lambda s: MeanReversionStrategy(s, window=15, entry_z=1.0, exit_z=0.2, order_size=5)
    )
    equity_curve = [initial_cash] + result.portfolio.equity_series()
    assert all(e > 0 for e in equity_curve)


def test_low_leverage_causes_some_orders_to_be_rejected_under_stress():
    # Very tight leverage + large order size should trigger buying-power rejections
    # rather than silently over-leveraging the account.
    market = MarketSimulator(seed=7, start_price=100.0, annual_volatility=0.4)
    strategy = SmaCrossoverStrategy("SIM", fast_window=3, slow_window=8, order_size=1000)
    portfolio = Portfolio(initial_cash=1_000.0, max_leverage=1.0)
    engine = SimulationEngine(market=market, strategy=strategy, portfolio=portfolio)
    result = engine.run(200)
    assert len(result.rejected_orders) > 0


def test_deterministic_given_seed():
    result1, _ = run_sim(lambda s: SmaCrossoverStrategy(s, fast_window=5, slow_window=20, order_size=5), seed=99)
    result2, _ = run_sim(lambda s: SmaCrossoverStrategy(s, fast_window=5, slow_window=20, order_size=5), seed=99)
    assert result1.portfolio.equity_series() == result2.portfolio.equity_series()
