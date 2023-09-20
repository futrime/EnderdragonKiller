from javascript import require

from .position import Position

mineflayer = require("mineflayer")
pathfinder = require("mineflayer-pathfinder")


class GameBot:
    """A bot that acts as a player in Minecraft."""

    def __init__(
        self, host: str, username: str, port: int = 25565, version: str = "1.20.1"
    ):
        """
        Args:
            host: The hostname of the Minecraft server.
            username: The username of the bot.
            port: The port of the Minecraft server.
            version: The version of the Minecraft server.
        """

        self._bot = mineflayer.createBot(
            {
                "auth": "offline",
                "host": host,
                "port": port,
                "username": username,
                "version": version,
            }
        )

        self._bot.loadPlugin(pathfinder.pathfinder)

    @property
    def position(self) -> Position:
        """The position of the player."""

        return Position(
            self._bot.entity.position.x,
            self._bot.entity.position.y,
            self._bot.entity.position.z,
        )

    def goto(self, position: Position) -> None:
        """Move the player to a position.

        Args:
            position: The position to move to.
        """

        self._bot.pathfinder.setMovements(pathfinder.Movements(self._bot))
        self._bot.pathfinder.setGoal(
            pathfinder.goals.GoalBlock(position.x, position.y, position.z)
        )
