import os

import dotenv

from enderdragonkiller.gamebot import GameBot


def main() -> None:
    """Main function of the demo."""

    dotenv.load_dotenv()

    for i in range(30):
        bot = GameBot(os.getenv("HOST", default="localhost"), f"bot{i}")


if __name__ == "__main__":
    main()
