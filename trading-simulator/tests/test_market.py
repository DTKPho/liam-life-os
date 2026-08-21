from trading_simulator.market import MarketSimulator


def test_deterministic_with_seed():
    m1 = MarketSimulator(seed=42)
    m2 = MarketSimulator(seed=42)
    bars1 = m1.run(50)
    bars2 = m2.run(50)
    assert [b.price for b in bars1] == [b.price for b in bars2]


def test_bid_ask_bracket_price():
    market = MarketSimulator(seed=1)
    for bar in market.run(100):
        assert bar.bid <= bar.price <= bar.ask
        assert bar.spread >= 0
        assert bar.volume > 0


def test_prices_stay_positive():
    market = MarketSimulator(start_price=10.0, annual_volatility=1.5, seed=7)
    for bar in market.run(500):
        assert bar.price > 0
        assert bar.bid > 0
