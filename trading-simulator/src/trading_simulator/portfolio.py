"""Cash/positions accounting with realized & unrealized P&L, equity curve, margin checks."""

from __future__ import annotations

from dataclasses import dataclass, field

from .orders import Fill, Side


@dataclass
class Position:
    symbol: str
    quantity: float = 0.0
    avg_price: float = 0.0
    realized_pnl: float = 0.0

    def market_value(self, price: float) -> float:
        return self.quantity * price

    def unrealized_pnl(self, price: float) -> float:
        return self.quantity * (price - self.avg_price)


class InsufficientFundsError(RuntimeError):
    pass


@dataclass
class EquityPoint:
    index: int
    cash: float
    equity: float


class Portfolio:
    """Tracks cash, positions and an equity curve as fills are applied.

    Supports going short. Buying power is checked against cash for long
    entries and against ``max_leverage`` for the overall gross exposure, so
    a strategy cannot silently accumulate an unfinanceable position like a
    naive simulator would allow.
    """

    def __init__(self, initial_cash: float, max_leverage: float = 1.0) -> None:
        if initial_cash <= 0:
            raise ValueError("initial_cash must be positive")
        if max_leverage < 1.0:
            raise ValueError("max_leverage must be >= 1.0")
        self.cash = initial_cash
        self.max_leverage = max_leverage
        self.positions: dict[str, Position] = {}
        self.equity_curve: list[EquityPoint] = []
        self.fills: list[Fill] = []

    def _position(self, symbol: str) -> Position:
        return self.positions.setdefault(symbol, Position(symbol=symbol))

    def gross_exposure(self, marks: dict[str, float]) -> float:
        return sum(abs(p.market_value(marks.get(p.symbol, p.avg_price))) for p in self.positions.values())

    def equity(self, marks: dict[str, float]) -> float:
        unrealized = sum(p.unrealized_pnl(marks.get(p.symbol, p.avg_price)) for p in self.positions.values())
        position_cost_basis = sum(p.quantity * p.avg_price for p in self.positions.values())
        return self.cash + position_cost_basis + unrealized

    def can_afford(self, fill: Fill, marks: dict[str, float]) -> bool:
        signed_qty = fill.quantity if fill.order.side == Side.BUY else -fill.quantity
        cash_after = self.cash - signed_qty * fill.price - fill.commission
        projected_positions = dict(self.positions)
        pos = projected_positions.get(fill.order.symbol, Position(symbol=fill.order.symbol))
        pos = Position(symbol=pos.symbol, quantity=pos.quantity + signed_qty, avg_price=pos.avg_price)
        projected_positions[fill.order.symbol] = pos

        gross = sum(
            abs(p.quantity) * marks.get(p.symbol, fill.price) for p in projected_positions.values()
        )
        equity_after = cash_after + sum(
            p.quantity * marks.get(p.symbol, fill.price) for p in projected_positions.values()
        )
        if equity_after <= 0:
            return False
        return gross <= equity_after * self.max_leverage

    def apply_fill(self, fill: Fill, marks: dict[str, float] | None = None) -> None:
        marks = marks or {}
        if not self.can_afford(fill, marks):
            raise InsufficientFundsError(
                f"Fill of {fill.quantity} {fill.order.symbol} @ {fill.price:.4f} "
                f"exceeds available buying power (leverage cap {self.max_leverage}x)"
            )

        signed_qty = fill.quantity if fill.order.side == Side.BUY else -fill.quantity
        pos = self._position(fill.order.symbol)
        old_qty = pos.quantity

        same_direction = old_qty == 0 or (old_qty > 0) == (signed_qty > 0)
        if same_direction:
            new_qty = old_qty + signed_qty
            pos.avg_price = (pos.avg_price * old_qty + fill.price * signed_qty) / new_qty
            pos.quantity = new_qty
        else:
            new_qty = old_qty + signed_qty
            closing_qty = min(abs(old_qty), abs(signed_qty))
            realized = closing_qty * (fill.price - pos.avg_price) * (1 if old_qty > 0 else -1)
            pos.realized_pnl += realized
            if abs(new_qty) < 1e-9:
                pos.quantity = 0.0
                pos.avg_price = 0.0
            elif (new_qty > 0) != (old_qty > 0):
                # Position flipped sign: leftover quantity opens fresh at the fill price.
                pos.quantity = new_qty
                pos.avg_price = fill.price
            else:
                # Partial close: remaining quantity keeps its original entry price.
                pos.quantity = new_qty

        self.cash -= signed_qty * fill.price
        self.cash -= fill.commission
        self.fills.append(fill)

    def record_equity(self, index: int, marks: dict[str, float]) -> None:
        self.equity_curve.append(EquityPoint(index=index, cash=self.cash, equity=self.equity(marks)))

    def equity_series(self) -> list[float]:
        return [p.equity for p in self.equity_curve]
