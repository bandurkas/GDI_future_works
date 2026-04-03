import asyncio
import json
import logging
import random
import string
import re

import websockets

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tv_test")

def generate_session():
    return "qs_" + "".join(random.choice(string.ascii_letters) for _ in range(12))

def prepend_header(st):
    return "~m~" + str(len(st)) + "~m~" + st

def construct_message(func, param_list):
    return json.dumps({"m": func, "p": param_list}, separators=(",", ":"))

def create_message(func, param_list):
    return prepend_header(construct_message(func, param_list))

async def test_tv():
    symbol = "OANDA:XAUUSD"
    session = generate_session()
    
    headers = {
        "Origin": "https://www.tradingview.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        async with websockets.connect(
            "wss://data.tradingview.com/socket.io/websocket",
            additional_headers={"Origin": "https://www.tradingview.com"},
            user_agent_header="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ) as ws:
            # 1. Send session
            await ws.send(create_message("quote_create_session", [session]))
            await ws.send(create_message("quote_set_fields", [session, "lp", "ch", "chp", "v"]))
            await ws.send(create_message("quote_add_symbols", [session, symbol]))
            
            logger.info(f"Subscribed to {symbol}")
            
            count = 0
            while count < 5:
                msg = await ws.recv()
                
                # TradingView heartbeat
                if "~h~" in msg:
                    await ws.send(msg)
                    continue
                
                # Split messages
                parts = re.split(r"~m~\d+~m~", msg)
                for part in parts:
                    if not part: continue
                    try:
                        data = json.loads(part)
                        if data["m"] == "qsd" and data["p"][0] == session:
                            v = data["p"][1]["v"]
                            if "lp" in v:
                                logger.info(f"Price for {symbol}: {v['lp']}")
                                count += 1
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
    except Exception as e:
        logger.error(f"Failed to connect: {e}")

if __name__ == "__main__":
    asyncio.run(test_tv())
