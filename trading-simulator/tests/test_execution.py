import pytest

from trading_simulator.execution import CommissionModel, ExecutionConfig, ExecutionEngine
from trading_simulator.market import Bar
from trading_simulator.orders import Order, OrderStatus, OrderType, Side


def make_bar(index=0, price=100.0, bid=99.9, ask=100.1, volume=1000.0):
    return Bar(index=index, price=price, bid=bid, ask=ask, volume=volume)


def test_market_buy_fills_at_ask_plus_impact():
    engine = ExecutionEngine(ExecutionConfig(commission=CommissionModel(pct_of_notional=0.0, minimum_fee=0.0)))
    order = Order(symbol="X", side=Side.BUY, quantity=10, order_type=OrderType.MARKET)
    bar = make_bar()
    fill = engine.process(order, bar)
    assert fill is not None
    assert fill.price >= bar.ask
    assert order.status == OrderStatus.FILLED


def test_market_sell_fills_at_bid_minus_impact():
    engine = ExecutionEngine(ExecutionConfig(commission=CommissionModel(pct_of_notional=0.0, minimum_fee=0.0)))
    order = Order(symbol="X", side=Side.SELL, quantity=10, order_type=OrderType.MARKET)
    bar = make_bar()
    fill = engine.process(order, bar)
    assert fill is not None
    assert fill.price <= bar.bid


def test_large_order_partially_fills_and_rolls_over():
    config = ExecutionConfig(max_participation_rate=0.10, commission=CommissionModel(pct_of_notional=0.0, minimum_fee=0.0))
    engine = ExecutionEngine(config)
    order = Order(symbol="X", side=Side.BUY, quantity=1000, order_type=OrderType.MARKET)
    bar = make_bar(volume=1000.0)

    fill1 = engine.process(order, bar)
    assert fill1 is not None
    assert fill1.quantity == pytest.approx(100.0)
    assert order.status == OrderStatus.PARTIALLY_FILLED

    bar2 = make_bar(index=1, volume=1000.0)
    fill2 = engine.process(order, bar2)
    assert fill2 is not None
    assert order.remaining_quantity == pytest.approx(800.0)


def test_limit_order_does_not_fill_until_price_reached():
    engine = ExecutionEngine()
    order = Order(symbol="X", side=Side.BUY, quantity=5, order_type=OrderType.LIMIT, limit_price=90.0)
    bar = make_bar(bid=99.9, ask=100.1)
    assert engine.process(order, bar) is None
    assert order.status == OrderStatus.PENDING

    bar_low = make_bar(index=1, price=89.0, bid=88.9, ask=89.1)
    fill = engine.process(order, bar_low)
    assert fill is not None
    assert fill.price <= 90.0


def test_stop_order_triggers_when_price_touches_stop():
    engine = ExecutionEngine()
    order = Order(symbol="X", side=Side.SELL, quantity=5, order_type=OrderType.STOP, stop_price=95.0)
    bar_above = make_bar(price=100.0, bid=99.9, ask=100.1)
    assert engine.process(order, bar_above) is None

    bar_hit = make_bar(index=1, price=94.0, bid=93.9, ask=94.1)
    fill = engine.process(order, bar_hit)
    assert fill is not None


def test_commission_minimum_applied():
    model = CommissionModel(fixed_fee=0.0, per_share_fee=0.0, pct_of_notional=0.0001, minimum_fee=2.5)
    assert model.compute(quantity=1, price=10.0) == pytest.approx(2.5)


def test_larger_order_suffers_more_impact():
    config = ExecutionConfig(max_participation_rate=1.0, commission=CommissionModel(pct_of_notional=0.0, minimum_fee=0.0))
    small = ExecutionEngine(config)
    big = ExecutionEngine(config)
    bar = make_bar(volume=1000.0)

    small_order = Order(symbol="X", side=Side.BUY, quantity=10, order_type=OrderType.MARKET)
    big_order = Order(symbol="X", side=Side.BUY, quantity=500, order_type=OrderType.MARKET)

    small_fill = small.process(small_order, bar)
    big_fill = big.process(big_order, bar)
    assert small_fill is not None and big_fill is not None
    small_impact_bps = (small_fill.price - bar.ask) / bar.ask
    big_impact_bps = (big_fill.price - bar.ask) / bar.ask
    assert big_impact_bps > small_impact_bps
