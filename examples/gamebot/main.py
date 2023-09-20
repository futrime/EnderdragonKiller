import asyncio
import os
import random
from typing import List

import dotenv

from enderdragonkiller.gamebot import GameBot, Position


async def main() -> None:
    """Main function of the demo."""

    dotenv.load_dotenv()

    bot_list: List[GameBot] = []
    for i in range(5):
        bot = GameBot(os.getenv("HOST", default="localhost"), f"bot{i}")
        bot_list.append(bot)

    while True:
        for bot in bot_list:
            current_position = bot.position
            bot.goto(
                Position(
                    current_position.x + random.randint(-30, 30),
                    current_position.y,
                    current_position.z + random.randint(-30, 30),
                )
            )
        await asyncio.sleep(1.0)


if __name__ == "__main__":
    asyncio.run(main())
