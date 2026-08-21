"""Ties market data, strategy, execution and portfolio together into a run loop."""

from __future__ import annotations

from dataclasses import dataclass, field

from .execution import ExecutionConfig, ExecutionEngine
from .market import Bar, MarketSimulator
from .orders import Order, OrderStatus
from .portfolio import InsufficientFundsError, Portfolio
from .strategy import Strategy


@dataclass
class SimulationResult:
    portfolio: Portfolio
    bars: list[Bar]
    rejected_orders: list[Order] = field(default_factory=list)


class SimulationEngine:
    def __init__(
        self,
        market: MarketSimulator,
        strategy: Strategy,
        portfolio: Portfolio,
        execution: ExecutionEngine | None = None,
        execution_config: ExecutionConfig | None = None,
    ) -> None:
        self.market = market
        self.strategy = strategy
        self.portfolio = portfolio
        self.execution = execution or ExecutionEngine(execution_config)
        self._open_orders: list[Order] = []

    def run(self, n_bars: int) -> SimulationResult:
        bars: list[Bar] = []
        rejected: list[Order] = []

        for _ in range(n_bars):
            bar = self.market.next_bar()
            bars.append(bar)
            marks = {self.strategy.symbol: bar.price}

            new_orders = self.strategy.on_bar(bar, self.portfolio)
            self._open_orders.extend(new_orders)

            still_open: list[Order] = []
            for order in self._open_orders:
                fill = self.execution.process(order, bar)
                if fill is not None:
                    try:
                        self.portfolio.apply_fill(fill, marks)
                    except InsufficientFundsError:
                        order.status = OrderStatus.REJECTED
                        rejected.append(order)
                        continue
                if order.status in (OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED):
                    still_open.append(order)
            self._open_orders = still_open

            self.portfolio.record_equity(bar.index, marks)

        return SimulationResult(portfolio=self.portfolio, bars=bars, rejected_orders=rejected)
