"""Synthetic market data generation.

Prices follow a Geometric Brownian Motion with optional volatility clustering
(a simple GARCH(1,1)-like process), and each bar exposes a bid/ask spread and
a traded volume so the execution engine can model slippage and market impact
realistically.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass


@dataclass(frozen=True)
class Bar:
    """A single simulated market observation."""

    index: int
    price: float
    bid: float
    ask: float
    volume: float

    @property
    def mid(self) -> float:
        return self.price

    @property
    def spread(self) -> float:
        return self.ask - self.bid


class MarketSimulator:
    """Generates a stream of synthetic OHLC-free bars for one instrument.

    The process combines:
      * Geometric Brownian Motion for the mid price (drift + volatility).
      * A GARCH(1,1)-style volatility update, so calm and turbulent periods
        cluster together like in real markets instead of i.i.d. noise.
      * A spread that widens with instantaneous volatility (liquidity dries
        up when things move fast), expressed in basis points of price.
      * Log-normal volume noise correlated with volatility (more volume when
        the market is agitated).
    """

    def __init__(
        self,
        start_price: float = 100.0,
        annual_drift: float = 0.05,
        annual_volatility: float = 0.20,
        base_spread_bps: float = 5.0,
        vol_spread_sensitivity: float = 2.0,
        base_volume: float = 10_000.0,
        trading_days_per_year: int = 252,
        garch_omega: float = 1e-6,
        garch_alpha: float = 0.08,
        garch_beta: float = 0.90,
        seed: int | None = None,
    ) -> None:
        if start_price <= 0:
            raise ValueError("start_price must be positive")
        if base_spread_bps < 0:
            raise ValueError("base_spread_bps must be non-negative")

        self._rng = random.Random(seed)
        self.price = start_price
        self.annual_drift = annual_drift
        self.annual_volatility = annual_volatility
        self.base_spread_bps = base_spread_bps
        self.vol_spread_sensitivity = vol_spread_sensitivity
        self.base_volume = base_volume
        self.dt = 1.0 / trading_days_per_year

        # GARCH(1,1) state, expressed on daily log-return variance.
        self._omega = garch_omega
        self._alpha = garch_alpha
        self._beta = garch_beta
        daily_var = (annual_volatility ** 2) * self.dt
        self._variance = daily_var
        self._long_run_variance = daily_var
        self._last_shock = 0.0
        self._index = 0

    def _step_volatility(self) -> float:
        self._variance = (
            self._omega
            + self._alpha * (self._last_shock ** 2)
            + self._beta * self._variance
        )
        # Guard against numerical drift to zero/negative variance.
        self._variance = max(self._variance, self._long_run_variance * 1e-4)
        return math.sqrt(self._variance)

    def next_bar(self) -> Bar:
        """Advance the process by one time step and return the new bar."""
        sigma = self._step_volatility()
        z = self._rng.gauss(0.0, 1.0)
        self._last_shock = sigma * z

        drift_term = (self.annual_drift - 0.5 * self.annual_volatility ** 2) * self.dt
        log_return = drift_term + sigma * z
        self.price *= math.exp(log_return)

        # Spread widens with realized volatility relative to its long-run level.
        vol_ratio = sigma / math.sqrt(self._long_run_variance) if self._long_run_variance > 0 else 1.0
        spread_bps = self.base_spread_bps * (
            1.0 + self.vol_spread_sensitivity * max(0.0, vol_ratio - 1.0)
        )
        half_spread = self.price * (spread_bps / 10_000.0) / 2.0
        bid = max(0.0001, self.price - half_spread)
        ask = self.price + half_spread

        volume_noise = math.exp(self._rng.gauss(0.0, 0.3))
        volume = self.base_volume * (1.0 + 3.0 * vol_ratio) * volume_noise

        bar = Bar(index=self._index, price=self.price, bid=bid, ask=ask, volume=max(1.0, volume))
        self._index += 1
        return bar

    def run(self, n_bars: int) -> list[Bar]:
        return [self.next_bar() for _ in range(n_bars)]
