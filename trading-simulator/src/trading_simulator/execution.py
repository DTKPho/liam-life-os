"""Order execution simulation: spread crossing, market impact, partial fills, fees.

The model tries to avoid the common "toy simulator" shortcut of filling any
order instantly at the mid price. Instead:

  * Market orders cross the spread (buy at ask, sell at bid).
  * Large orders relative to the bar's volume suffer a square-root market
    impact penalty (the standard practitioner approximation: impact grows
    with the square root of participation rate, not linearly).
  * An order cannot consume more than ``max_participation_rate`` of a bar's
    volume in one step; the remainder stays pending and rolls into future
    bars, just like a real order worked over time.
  * Limit orders only fill when the market actually trades through their
    price, and stop orders only arm once the stop price is touched.
  * Commissions combine a fixed per-order fee, a per-share fee and a
    percentage-of-notional fee, with a minimum ticket charge.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from .market import Bar
from .orders import Fill, Order, OrderStatus, OrderType, Side


@dataclass
class CommissionModel:
    fixed_fee: float = 0.0
    per_share_fee: float = 0.0
    pct_of_notional: float = 0.0005  # 5 bps
    minimum_fee: float = 1.0

    def compute(self, quantity: float, price: float) -> float:
        fee = self.fixed_fee + self.per_share_fee * quantity + self.pct_of_notional * quantity * price
        return max(fee, self.minimum_fee if quantity > 0 else 0.0)


@dataclass
class ExecutionConfig:
    commission: CommissionModel = None  # type: ignore[assignment]
    max_participation_rate: float = 0.10
    market_impact_coefficient: float = 0.10  # in price-fraction units
    latency_bars: int = 0  # extra bars of delay before a market order can fill

    def __post_init__(self) -> None:
        if self.commission is None:
            self.commission = CommissionModel()
        if not 0 < self.max_participation_rate <= 1:
            raise ValueError("max_participation_rate must be in (0, 1]")


class ExecutionEngine:
    """Turns an :class:`Order` plus the current :class:`Bar` into a partial or full fill."""

    def __init__(self, config: ExecutionConfig | None = None) -> None:
        self.config = config or ExecutionConfig()
        self._submission_bar: dict[int, int] = {}

    def _available_volume(self, bar: Bar) -> float:
        return bar.volume * self.config.max_participation_rate

    def _impact_bps(self, quantity: float, bar: Bar) -> float:
        if bar.volume <= 0:
            return 0.0
        participation = quantity / bar.volume
        return self.config.market_impact_coefficient * math.sqrt(max(participation, 0.0)) * 10_000

    def _is_triggered(self, order: Order, bar: Bar) -> bool:
        if order.order_type == OrderType.MARKET:
            return True
        if order.order_type == OrderType.LIMIT:
            assert order.limit_price is not None
            if order.side == Side.BUY:
                return bar.ask <= order.limit_price
            return bar.bid >= order.limit_price
        if order.order_type == OrderType.STOP:
            assert order.stop_price is not None
            if order.side == Side.BUY:
                return bar.ask >= order.stop_price
            return bar.bid <= order.stop_price
        return False

    def process(self, order: Order, bar: Bar) -> Fill | None:
        """Attempt to fill (part of) ``order`` against ``bar``.

        Mutates ``order.filled_quantity``/``order.status`` in place and
        returns a :class:`Fill` for the quantity executed this bar, or
        ``None`` if nothing was executed.
        """
        if order.status in (OrderStatus.FILLED, OrderStatus.CANCELLED, OrderStatus.REJECTED):
            return None

        if id(order) not in self._submission_bar:
            self._submission_bar[id(order)] = bar.index

        if bar.index - self._submission_bar[id(order)] < self.config.latency_bars:
            return None

        if not self._is_triggered(order, bar):
            return None

        base_price = bar.ask if order.side == Side.BUY else bar.bid
        remaining = order.remaining_quantity
        fillable = min(remaining, self._available_volume(bar))
        if fillable <= 0:
            return None

        impact_bps = self._impact_bps(fillable, bar)
        impact = base_price * (impact_bps / 10_000.0)
        # Market impact always moves the price against the trader.
        exec_price = base_price + impact if order.side == Side.BUY else base_price - impact
        exec_price = max(exec_price, 0.0001)

        if order.order_type == OrderType.LIMIT:
            assert order.limit_price is not None
            if order.side == Side.BUY:
                exec_price = min(exec_price, order.limit_price)
            else:
                exec_price = max(exec_price, order.limit_price)

        commission = self.config.commission.compute(fillable, exec_price)
        slippage = abs(exec_price - bar.price) * fillable

        order.filled_quantity += fillable
        order.status = (
            OrderStatus.FILLED if order.remaining_quantity <= 1e-9 else OrderStatus.PARTIALLY_FILLED
        )

        return Fill(
            order=order,
            price=exec_price,
            quantity=fillable,
            commission=commission,
            slippage=slippage,
            timestamp=bar.index,
        )
