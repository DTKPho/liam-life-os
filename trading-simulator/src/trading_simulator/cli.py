"""Command-line entry point: run a simulation and print a performance report."""

from __future__ import annotations

import argparse
import sys

from .engine import SimulationEngine
from .execution import CommissionModel, ExecutionConfig
from .market import MarketSimulator
from .metrics import build_report
from .portfolio import Portfolio
from .strategy import MeanReversionStrategy, SmaCrossoverStrategy, Strategy

STRATEGIES = {"sma", "mean_reversion"}


def build_strategy(name: str, symbol: str, args: argparse.Namespace) -> Strategy:
    if name == "sma":
        return SmaCrossoverStrategy(
            symbol=symbol, fast_window=args.fast, slow_window=args.slow, order_size=args.order_size
        )
    if name == "mean_reversion":
        return MeanReversionStrategy(
            symbol=symbol,
            window=args.window,
            entry_z=args.entry_z,
            exit_z=args.exit_z,
            order_size=args.order_size,
        )
    raise ValueError(f"Unknown strategy '{name}', expected one of {sorted(STRATEGIES)}")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a realistic single-instrument trading simulation.")
    parser.add_argument("--symbol", default="SIM")
    parser.add_argument("--days", type=int, default=252)
    parser.add_argument("--initial-cash", type=float, default=10_000.0)
    parser.add_argument("--max-leverage", type=float, default=1.0)
    parser.add_argument("--seed", type=int, default=None)

    parser.add_argument("--start-price", type=float, default=100.0)
    parser.add_argument("--drift", type=float, default=0.05, help="Annualized drift")
    parser.add_argument("--volatility", type=float, default=0.20, help="Annualized volatility")
    parser.add_argument("--spread-bps", type=float, default=5.0)
    parser.add_argument("--base-volume", type=float, default=10_000.0)

    parser.add_argument("--strategy", choices=sorted(STRATEGIES), default="sma")
    parser.add_argument("--order-size", type=float, default=10.0)
    parser.add_argument("--fast", type=int, default=10, help="SMA strategy: fast window")
    parser.add_argument("--slow", type=int, default=30, help="SMA strategy: slow window")
    parser.add_argument("--window", type=int, default=20, help="Mean reversion: rolling window")
    parser.add_argument("--entry-z", type=float, default=1.5, help="Mean reversion: entry z-score")
    parser.add_argument("--exit-z", type=float, default=0.25, help="Mean reversion: exit z-score")

    parser.add_argument("--commission-pct", type=float, default=0.0005)
    parser.add_argument("--commission-fixed", type=float, default=0.0)
    parser.add_argument("--commission-per-share", type=float, default=0.0)
    parser.add_argument("--commission-min", type=float, default=1.0)
    parser.add_argument("--max-participation", type=float, default=0.10)
    parser.add_argument("--market-impact", type=float, default=0.10)

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    market = MarketSimulator(
        start_price=args.start_price,
        annual_drift=args.drift,
        annual_volatility=args.volatility,
        base_spread_bps=args.spread_bps,
        base_volume=args.base_volume,
        seed=args.seed,
    )
    strategy = build_strategy(args.strategy, args.symbol, args)
    portfolio = Portfolio(initial_cash=args.initial_cash, max_leverage=args.max_leverage)
    execution_config = ExecutionConfig(
        commission=CommissionModel(
            fixed_fee=args.commission_fixed,
            per_share_fee=args.commission_per_share,
            pct_of_notional=args.commission_pct,
            minimum_fee=args.commission_min,
        ),
        max_participation_rate=args.max_participation,
        market_impact_coefficient=args.market_impact,
    )

    engine = SimulationEngine(market=market, strategy=strategy, portfolio=portfolio, execution_config=execution_config)
    result = engine.run(args.days)

    equity_curve = [args.initial_cash] + result.portfolio.equity_series()
    report = build_report(equity_curve, result.portfolio.fills)

    print(f"Simulation: {args.symbol} | strategy={args.strategy} | days={args.days} | seed={args.seed}")
    print("-" * 60)
    print(report)
    if result.rejected_orders:
        print(f"\nRejected orders (insufficient buying power): {len(result.rejected_orders)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
