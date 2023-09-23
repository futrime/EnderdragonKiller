'use strict';

/**
 * Represents a 3D vector.
 */
export class Vec3 {
  /**
   * @param {number} x The x coordinate.
   * @param {number} y The y coordinate.
   * @param {number} z The z coordinate.
   */
  constructor(x, y, z) {
    /**
     * The x coordinate.
     * @type {number}
     */
    this.x = x;
    /**
     * The y coordinate.
     * @type {number}
     */
    this.y = y;
    /**
     * The z coordinate.
     * @type {number}
     */
    this.z = z;
  }

  /**
   * Returns the difference between this vector and another.
   * @param {Vec3} vec The other vector.
   * @returns {Vec3} The difference.
   */
  getDifference(vec) {
    return new Vec3(this.x - vec.x, this.y - vec.y, this.z - vec.z);
  }

  /**
   * Returns the distance between this vector and another.
   * @param {Vec3} vec The other vector.
   * @returns {number} The distance.
   */
  getDistanceTo(vec) {
    return Math.sqrt(this.distanceToSquared(vec));
  }
}
