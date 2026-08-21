"""Strategy interface and a couple of reference implementations."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections import deque

from .market import Bar
from .orders import Order, OrderType, Side
from .portfolio import Portfolio


class Strategy(ABC):
    """Base class: implement ``on_bar`` to emit orders from market state."""

    def __init__(self, symbol: str) -> None:
        self.symbol = symbol

    @abstractmethod
    def on_bar(self, bar: Bar, portfolio: Portfolio) -> list[Order]:
        """Return the list of new orders to submit for this bar."""

    def position_qty(self, portfolio: Portfolio) -> float:
        pos = portfolio.positions.get(self.symbol)
        return pos.quantity if pos else 0.0


class SmaCrossoverStrategy(Strategy):
    """Goes long when the fast SMA crosses above the slow SMA, flat otherwise."""

    def __init__(self, symbol: str, fast_window: int = 10, slow_window: int = 30, order_size: float = 10.0) -> None:
        if fast_window >= slow_window:
            raise ValueError("fast_window must be smaller than slow_window")
        super().__init__(symbol)
        self.fast_window = fast_window
        self.slow_window = slow_window
        self.order_size = order_size
        self._prices: deque[float] = deque(maxlen=slow_window)
        self._prev_signal: int | None = None

    def _sma(self, window: int) -> float | None:
        if len(self._prices) < window:
            return None
        return sum(list(self._prices)[-window:]) / window

    def on_bar(self, bar: Bar, portfolio: Portfolio) -> list[Order]:
        self._prices.append(bar.price)
        fast = self._sma(self.fast_window)
        slow = self._sma(self.slow_window)
        if fast is None or slow is None:
            return []

        signal = 1 if fast > slow else -1
        orders: list[Order] = []
        if self._prev_signal is not None and signal != self._prev_signal:
            current_qty = self.position_qty(portfolio)
            if signal == 1 and current_qty <= 0:
                qty = self.order_size + abs(current_qty)
                orders.append(Order(symbol=self.symbol, side=Side.BUY, quantity=qty, order_type=OrderType.MARKET))
            elif signal == -1 and current_qty >= 0:
                qty = self.order_size + abs(current_qty)
                orders.append(Order(symbol=self.symbol, side=Side.SELL, quantity=qty, order_type=OrderType.MARKET))
        self._prev_signal = signal
        return orders


class MeanReversionStrategy(Strategy):
    """Trades against short-term deviations from a rolling mean (z-score based)."""

    def __init__(
        self,
        symbol: str,
        window: int = 20,
        entry_z: float = 1.5,
        exit_z: float = 0.25,
        order_size: float = 10.0,
    ) -> None:
        super().__init__(symbol)
        self.window = window
        self.entry_z = entry_z
        self.exit_z = exit_z
        self.order_size = order_size
        self._prices: deque[float] = deque(maxlen=window)

    def _zscore(self) -> float | None:
        if len(self._prices) < self.window:
            return None
        prices = list(self._prices)
        mean = sum(prices) / len(prices)
        variance = sum((p - mean) ** 2 for p in prices) / len(prices)
        std = variance ** 0.5
        if std == 0:
            return 0.0
        return (prices[-1] - mean) / std

    def on_bar(self, bar: Bar, portfolio: Portfolio) -> list[Order]:
        self._prices.append(bar.price)
        z = self._zscore()
        if z is None:
            return []

        qty = self.position_qty(portfolio)
        orders: list[Order] = []
        if qty == 0:
            if z <= -self.entry_z:
                orders.append(Order(symbol=self.symbol, side=Side.BUY, quantity=self.order_size, order_type=OrderType.MARKET))
            elif z >= self.entry_z:
                orders.append(Order(symbol=self.symbol, side=Side.SELL, quantity=self.order_size, order_type=OrderType.MARKET))
        elif qty > 0 and z >= -self.exit_z:
            orders.append(Order(symbol=self.symbol, side=Side.SELL, quantity=qty, order_type=OrderType.MARKET))
        elif qty < 0 and z <= self.exit_z:
            orders.append(Order(symbol=self.symbol, side=Side.BUY, quantity=abs(qty), order_type=OrderType.MARKET))
        return orders
