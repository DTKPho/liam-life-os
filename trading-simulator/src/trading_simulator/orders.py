"""Order and fill primitives."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class Side(Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderType(Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    STOP = "STOP"


class OrderStatus(Enum):
    PENDING = "PENDING"
    FILLED = "FILLED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


@dataclass
class Order:
    symbol: str
    side: Side
    quantity: float
    order_type: OrderType = OrderType.MARKET
    limit_price: float | None = None
    stop_price: float | None = None
    created_at: int = 0
    status: OrderStatus = OrderStatus.PENDING
    filled_quantity: float = 0.0

    def __post_init__(self) -> None:
        if self.quantity <= 0:
            raise ValueError("Order quantity must be positive")
        if self.order_type == OrderType.LIMIT and self.limit_price is None:
            raise ValueError("LIMIT orders require a limit_price")
        if self.order_type == OrderType.STOP and self.stop_price is None:
            raise ValueError("STOP orders require a stop_price")

    @property
    def remaining_quantity(self) -> float:
        return self.quantity - self.filled_quantity


@dataclass(frozen=True)
class Fill:
    order: Order
    price: float
    quantity: float
    commission: float
    slippage: float
    timestamp: int
    liquidity_flag: str = field(default="taker")

    @property
    def notional(self) -> float:
        return self.price * self.quantity
