"""Performance metrics computed from an equity curve and fill history."""

from __future__ import annotations

import math
from dataclasses import dataclass

from .orders import Fill, Side


@dataclass(frozen=True)
class PerformanceReport:
    total_return: float
    cagr: float
    annualized_volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    num_trades: int
    win_rate: float
    profit_factor: float
    total_commission: float

    def __str__(self) -> str:  # pragma: no cover - formatting only
        return (
            f"Total return:        {self.total_return:+.2%}\n"
            f"CAGR:                 {self.cagr:+.2%}\n"
            f"Annualized vol:       {self.annualized_volatility:.2%}\n"
            f"Sharpe ratio:         {self.sharpe_ratio:.2f}\n"
            f"Sortino ratio:        {self.sortino_ratio:.2f}\n"
            f"Max drawdown:         {self.max_drawdown:.2%}\n"
            f"Trades:               {self.num_trades}\n"
            f"Win rate:             {self.win_rate:.2%}\n"
            f"Profit factor:        {self.profit_factor:.2f}\n"
            f"Total commission:     {self.total_commission:.2f}"
        )


def _returns(equity_curve: list[float]) -> list[float]:
    return [
        (equity_curve[i] / equity_curve[i - 1]) - 1.0
        for i in range(1, len(equity_curve))
        if equity_curve[i - 1] > 0
    ]


def max_drawdown(equity_curve: list[float]) -> float:
    peak = float("-inf")
    worst = 0.0
    for value in equity_curve:
        peak = max(peak, value)
        if peak > 0:
            drawdown = (value - peak) / peak
            worst = min(worst, drawdown)
    return worst


def sharpe_ratio(returns: list[float], periods_per_year: int, risk_free_rate: float = 0.0) -> float:
    if len(returns) < 2:
        return 0.0
    period_rf = risk_free_rate / periods_per_year
    excess = [r - period_rf for r in returns]
    mean = sum(excess) / len(excess)
    variance = sum((r - mean) ** 2 for r in excess) / (len(excess) - 1)
    std = math.sqrt(variance)
    if std == 0:
        return 0.0
    return (mean / std) * math.sqrt(periods_per_year)


def sortino_ratio(returns: list[float], periods_per_year: int, risk_free_rate: float = 0.0) -> float:
    if len(returns) < 2:
        return 0.0
    period_rf = risk_free_rate / periods_per_year
    excess = [r - period_rf for r in returns]
    mean = sum(excess) / len(excess)
    downside = [min(0.0, r) for r in excess]
    downside_variance = sum(d ** 2 for d in downside) / len(downside)
    downside_std = math.sqrt(downside_variance)
    if downside_std == 0:
        return 0.0
    return (mean / downside_std) * math.sqrt(periods_per_year)


def _round_trip_pnls(fills: list[Fill]) -> list[float]:
    """Derive realized P&L per closing trade using FIFO lot matching."""
    lots: dict[str, list[list[float]]] = {}  # symbol -> [[qty, price], ...] (qty signed)
    pnls: list[float] = []

    for fill in fills:
        symbol_lots = lots.setdefault(fill.order.symbol, [])
        signed_qty = fill.quantity if fill.order.side == Side.BUY else -fill.quantity
        remaining = signed_qty

        while remaining != 0 and symbol_lots and (symbol_lots[0][0] > 0) != (remaining > 0):
            lot_qty, lot_price = symbol_lots[0]
            closing = min(abs(lot_qty), abs(remaining))
            direction = 1 if lot_qty > 0 else -1
            pnl = closing * (fill.price - lot_price) * direction
            pnls.append(pnl)

            lot_qty -= direction * closing
            remaining -= direction * closing
            if abs(lot_qty) < 1e-9:
                symbol_lots.pop(0)
            else:
                symbol_lots[0][0] = lot_qty

        if remaining != 0:
            symbol_lots.append([remaining, fill.price])

    return pnls


def build_report(
    equity_curve: list[float],
    fills: list[Fill],
    periods_per_year: int = 252,
    risk_free_rate: float = 0.0,
) -> PerformanceReport:
    if len(equity_curve) < 2:
        raise ValueError("equity_curve needs at least two points to compute metrics")

    returns = _returns(equity_curve)
    total_return = equity_curve[-1] / equity_curve[0] - 1.0
    n_periods = len(equity_curve) - 1
    years = n_periods / periods_per_year
    cagr = (equity_curve[-1] / equity_curve[0]) ** (1 / years) - 1.0 if years > 0 else 0.0

    mean_return = sum(returns) / len(returns) if returns else 0.0
    variance = sum((r - mean_return) ** 2 for r in returns) / (len(returns) - 1) if len(returns) > 1 else 0.0
    annualized_vol = math.sqrt(variance) * math.sqrt(periods_per_year)

    trade_pnls = _round_trip_pnls(fills)
    wins = [p for p in trade_pnls if p > 0]
    losses = [p for p in trade_pnls if p < 0]
    win_rate = len(wins) / len(trade_pnls) if trade_pnls else 0.0
    gross_profit = sum(wins)
    gross_loss = abs(sum(losses))
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else float("inf") if gross_profit > 0 else 0.0

    return PerformanceReport(
        total_return=total_return,
        cagr=cagr,
        annualized_volatility=annualized_vol,
        sharpe_ratio=sharpe_ratio(returns, periods_per_year, risk_free_rate),
        sortino_ratio=sortino_ratio(returns, periods_per_year, risk_free_rate),
        max_drawdown=max_drawdown(equity_curve),
        num_trades=len(trade_pnls),
        win_rate=win_rate,
        profit_factor=profit_factor,
        total_commission=sum(f.commission for f in fills),
    )
