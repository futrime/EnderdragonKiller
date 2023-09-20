from javascript import require

mineflayer = require("mineflayer")


class GameBot:
    """A bot that acts as a player in Minecraft."""

    def __init__(
        self, host: str, username: str, port: int = 25565, version: str = "1.20.1"
    ):
        self._bot = mineflayer.createBot(
            {
                "auth": "offline",
                "host": host,
                "port": port,
                "username": username,
                "version": version,
            }
        )
