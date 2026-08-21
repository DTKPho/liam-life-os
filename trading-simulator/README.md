# Trading Simulator

Un simulateur de trading réaliste, en Python pur (sans dépendance externe),
qui modélise ce qu'un simulateur "jouet" ignore d'habitude :

- **Marché synthétique** (`market.py`) : mouvement brownien géométrique avec
  volatilité en cluster (processus type GARCH(1,1)) — les périodes calmes et
  agitées s'enchaînent comme sur un vrai marché, pas du bruit i.i.d.
- **Spread bid/ask dynamique** qui s'élargit quand la volatilité instantanée
  augmente (la liquidité se raréfie quand ça bouge vite).
- **Exécution réaliste** (`execution.py`) :
  - les ordres au marché traversent le spread (achat à l'ask, vente au bid) ;
  - **impact de marché** en racine carrée de la participation au volume
    (modèle standard côté sell-side/buy-side, pas un impact linéaire naïf) ;
  - un ordre ne peut pas consommer plus d'un % configurable du volume d'une
    bougie : le reste reste en attente et se répartit sur les bougies
    suivantes, comme un ordre réellement travaillé dans le temps ;
  - ordres **limit** et **stop** qui ne se déclenchent que si le marché
    traverse effectivement leur prix ;
  - **commissions** combinant frais fixe, frais par action et pourcentage du
    notionnel, avec un minimum par ticket.
- **Portefeuille** (`portfolio.py`) : cash, positions (long/short), P&L
  réalisé/latent, courbe d'équité, et un contrôle de levier qui **rejette**
  les ordres non finançables plutôt que de laisser le compte s'endetter
  silencieusement.
- **Stratégies** (`strategy.py`) : croisement de moyennes mobiles (SMA) et
  retour à la moyenne (z-score), plus une classe de base `Strategy` pour en
  écrire d'autres.
- **Métriques de performance** (`metrics.py`) : rendement total, CAGR,
  volatilité annualisée, Sharpe, Sortino, max drawdown, win rate, profit
  factor (P&L calculé par appariement FIFO des lots).

## Installation

```bash
cd trading-simulator
pip install -e .
```

## Utilisation en ligne de commande

```bash
python -m trading_simulator.cli \
  --symbol BTCUSD --days 252 --strategy sma \
  --fast 10 --slow 30 --initial-cash 10000 --seed 42
```

```bash
python -m trading_simulator.cli \
  --strategy mean_reversion --window 20 --entry-z 1.5 --exit-z 0.3 \
  --seed 7 --days 400 --max-leverage 2
```

Options utiles : `--volatility`, `--drift`, `--spread-bps`, `--base-volume`,
`--commission-pct`, `--commission-fixed`, `--max-participation`,
`--market-impact`. Voir `--help` pour la liste complète.

## Utilisation programmatique

```python
from trading_simulator.market import MarketSimulator
from trading_simulator.strategy import SmaCrossoverStrategy
from trading_simulator.portfolio import Portfolio
from trading_simulator.engine import SimulationEngine
from trading_simulator.metrics import build_report

market = MarketSimulator(seed=42, start_price=100.0, annual_volatility=0.25)
strategy = SmaCrossoverStrategy("SIM", fast_window=10, slow_window=30, order_size=10)
portfolio = Portfolio(initial_cash=10_000)

engine = SimulationEngine(market=market, strategy=strategy, portfolio=portfolio)
result = engine.run(n_bars=252)

equity_curve = [10_000] + portfolio.equity_series()
print(build_report(equity_curve, portfolio.fills))
```

## Tests

```bash
pip install pytest
pytest
```
