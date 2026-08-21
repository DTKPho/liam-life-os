import pytest

from trading_simulator.orders import Fill, Order, OrderType, Side
from trading_simulator.portfolio import InsufficientFundsError, Portfolio


def make_fill(symbol="X", side=Side.BUY, quantity=10, price=100.0, commission=1.0):
    order = Order(symbol=symbol, side=side, quantity=quantity, order_type=OrderType.MARKET)
    order.filled_quantity = quantity
    return Fill(order=order, price=price, quantity=quantity, commission=commission, slippage=0.0, timestamp=0)


def test_buy_updates_cash_and_position():
    p = Portfolio(initial_cash=10_000)
    p.apply_fill(make_fill(side=Side.BUY, quantity=10, price=100.0, commission=1.0))
    assert p.cash == pytest.approx(10_000 - 1_000 - 1.0)
    assert p.positions["X"].quantity == 10
    assert p.positions["X"].avg_price == pytest.approx(100.0)


def test_sell_reduces_position_and_realizes_pnl():
    p = Portfolio(initial_cash=10_000)
    p.apply_fill(make_fill(side=Side.BUY, quantity=10, price=100.0, commission=0.0))
    p.apply_fill(make_fill(side=Side.SELL, quantity=4, price=110.0, commission=0.0))
    pos = p.positions["X"]
    assert pos.quantity == 6
    assert pos.realized_pnl == pytest.approx(4 * (110.0 - 100.0))


def test_position_can_flip_from_long_to_short():
    p = Portfolio(initial_cash=10_000, max_leverage=5.0)
    p.apply_fill(make_fill(side=Side.BUY, quantity=5, price=100.0, commission=0.0))
    p.apply_fill(make_fill(side=Side.SELL, quantity=8, price=105.0, commission=0.0))
    pos = p.positions["X"]
    assert pos.quantity == pytest.approx(-3)
    assert pos.avg_price == pytest.approx(105.0)
    assert pos.realized_pnl == pytest.approx(5 * (105.0 - 100.0))


def test_insufficient_funds_raises():
    p = Portfolio(initial_cash=100.0, max_leverage=1.0)
    with pytest.raises(InsufficientFundsError):
        p.apply_fill(make_fill(side=Side.BUY, quantity=10, price=100.0, commission=0.0))


def test_leverage_allows_larger_position():
    p = Portfolio(initial_cash=1_000.0, max_leverage=3.0)
    p.apply_fill(make_fill(side=Side.BUY, quantity=20, price=100.0, commission=0.0))
    assert p.positions["X"].quantity == 20


def test_equity_matches_cash_plus_market_value():
    p = Portfolio(initial_cash=10_000)
    p.apply_fill(make_fill(side=Side.BUY, quantity=10, price=100.0, commission=0.0))
    equity = p.equity({"X": 120.0})
    assert equity == pytest.approx(10_000 - 1000 + 10 * 120.0)
