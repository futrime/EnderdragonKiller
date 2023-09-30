//@ts-check
'use strict';

/**
 * Represents a bot.
 */
export class Bot {
  /**
   * @param {string} ip The IP address of the bot.
   * @param {number} port The port of the bot.
   * @param {string} username The username of the bot.
   */
  constructor(ip, port, username) {
    this.ip_ = ip;
    this.port_ = port;
    this.username_ = username;
  }

  /**
   * @returns {string} The IP address of the bot.
   */
  getIp() {
    return this.ip_;
  }

  /**
   * @returns {number} The port of the bot.
   */
  getPort() {
    return this.port_;
  }

  /**
   * @returns {string} The username of the bot.
   */
  getUsername() {
    return this.username_;
  }
}
