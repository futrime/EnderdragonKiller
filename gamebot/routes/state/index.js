//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';
import registry from 'prismarine-registry';
import biome from 'prismarine-biome';

export const router = express.Router();

router.route('/').get(async (req, res) => {
  try {
    /**
     * @type {import('../../lib/bot.js').Bot}
     */
    const bot = req.app.locals.bot;
    const mineflayerBot = bot.getMineflayerBot();

    return res.status(200).send({
      apiVersion: '0.0.0',
      data: {
        bot: await botToJson(mineflayerBot),
      },
    });

  } catch (error) {
    consola.error(`Error: ${error.message}`);
    return res.status(500).send({
      apiVersion: '0.0.0',
      error: {
        code: 500,
        message: `Internal server error occured: ${error.message}`,
      },
    });
  }
});

/**
 * @param {import('prismarine-biome').Biome} biome The biome to convert to JSON
 * @returns {object} The JSON representation of the biome
 */
function biomeToJson(biome) {
  return {
    name: biome.name,
    displayName: biome.displayName,
    rainfall: biome.rainfall,
    temperature: biome.temperature,
  };
}

/**
 * @param {import('prismarine-block').Block} block The block to convert to JSON
 * @returns {object} The JSON representation of the block
 */
function blockToJson(block) {
  return {
    biome: biomeToJson(block.biome),
    position: block.position,
    name: block.name,
    displayName: block.displayName,
    hardness: block.hardness,
    diggable: block.diggable,
  };
}

/**
 * @param {import('mineflayer').Bot} bot The bot to convert to JSON
 * @returns {Promise<object>} The JSON representation of the bot
 */
async function botToJson(bot) {
  return {
    username: bot.username,
    version: bot.version,
    entity: entityToJson(bot.entity),
    entities: Object.fromEntries(
        Object.entries(bot.entities)
            .map(([key, value]) => [key, entityToJson(value)])),
    game: bot.game,
    player: playerToJson(bot.player),
    players: Object.fromEntries(
        Object.entries(bot.players)
            .map(([key, value]) => [key, playerToJson(value)])),
    isRaining: bot.isRaining,
    experience: bot.experience,
    health: bot.health,
    food: bot.food,
    foodSaturation: bot.foodSaturation,
    oxygenLevel: bot.oxygenLevel,
    time: timeToJson(bot.time),
    quickBarSlot: bot.quickBarSlot,
    targetDigBlock:
        (bot.targetDigBlock !== null) ? blockToJson(bot.targetDigBlock) : null,
    isSleeping: bot.isSleeping,
    world: await worldToJson(bot.world, bot.entity.position, bot.version),
  };
}

/**
 * @param {import('prismarine-entity').Effect} effect The effect to convert to
 *    JSON
 * @returns {object} The JSON representation of the effect
 */
function effectToJson(effect) {
  return {
    id: effect.id,
    amplifier: effect.amplifier,
    duration: effect.duration,
  };
}

/**
 * @param {import('prismarine-entity').Entity} entity The entity to convert to
 *     JSON
 * @returns {object} The JSON representation of the entity
 */
function entityToJson(entity) {
  return {
    displayName: entity.displayName,
    name: entity.name,
    position: entity.position,
    velocity: entity.velocity,
    yaw: entity.yaw,
    pitch: entity.pitch,
    height: entity.height,
    width: entity.width,
    onGround: entity.onGround,
    equipment: entity.equipment.map(itemToJson),
    health: entity.health,
    food: entity.food,
    foodSaturation: entity.foodSaturation,
    effects: Array.isArray(entity.effects) ? entity.effects.map(effectToJson) :
                                             [],
  };
}

/**
 * @param {import('prismarine-item').Item} item The item to convert to JSON
 * @returns {object} The JSON representation of the item
 */
function itemToJson(item) {
  return {
    count: item.count,
    name: item.name,
    maxDurability: item.maxDurability,
    durabilityUsed: item.durabilityUsed,
    enchants: item.enchants,
  };
}

/**
 * @param {import('mineflayer').Player} player The player to convert to JSON
 * @returns {object} The JSON representation of the player
 */
function playerToJson(player) {
  // TODO: Implement
  return {
    username: player.username,
  };
}

/**
 * @param {import('mineflayer').Time} time The time to convert to JSON
 * @returns {object} The JSON representation of the time
 */
function timeToJson(time) {
  return {
    time: time.time,
    timeOfDay: time.timeOfDay,
    day: time.day,
    isDay: time.isDay,
    moonPhase: time.moonPhase,
    age: time.age,
  };
}

/**
 * @param {import('prismarine-world').world.World} world The world to convert to
 *     JSON
 * @param {import('vec3').Vec3} playerPosition The position of the player
 * @param {string} version The version of Minecraft
 * @returns {Promise<object>} The JSON representation of the world
 */
async function worldToJson(world, playerPosition, version) {
  const Biome = biome(registry(version));

  const biomeId = await world.getBiome(playerPosition);

  return {
    biome: biomeToJson(new Biome(biomeId)),
  };
}
