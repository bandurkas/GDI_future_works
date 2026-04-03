import asyncio
import os
import sys
from dotenv import load_dotenv

# Добавляем путь для импорта наших модулей
sys.path.append("/root/polymarket-bot")

from notifier import notify_session_stats, notify_gold_stats
from trader import PolymarketTrader

async def main():
    load_dotenv("/root/polymarket-bot/.env")
    trader = PolymarketTrader()
    
    # Имитируем данные для теста
    summary = "✅ 13 - ❌ 7\nWin rate: 65.0%"
    all_time = {"total": 27, "wins": 20, "win_rate": 0.741}
    
    print("Fetching real balance from Polymarket...")
    balance = await trader.get_usdc_balance()
    
    print(f"Current Balance: ${balance:,.2f}")
    
    print("Sending BTC stats test report to Telegram...")
    await notify_session_stats(summary, all_time, balance=balance)
    
    print("Sending Gold stats test report to Telegram...")
    await notify_gold_stats(summary, all_time, balance=balance)
    print("Done!")

if __name__ == '__main__':
    asyncio.run(main())
