class Position:
    """A 3D coordinate in Minecraft."""

    def __init__(self, x: float, y: float, z: float):
        """
        Args:
            x: The x coordinate.
            y: The y coordinate.
            z: The z coordinate.
        """

        self._x = x
        self._y = y
        self._z = z

    def __repr__(self) -> str:
        return f"Position(x={self.x}, y={self.y}, z={self.z})"

    @property
    def x(self) -> float:
        """The x coordinate."""

        return self._x

    @property
    def y(self) -> float:
        """The y coordinate."""

        return self._y

    @property
    def z(self) -> float:
        """The z coordinate."""

        return self._z
