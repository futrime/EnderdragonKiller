//@ts-check
'use strict';

/**
 * @param {import('prismarine-biome').Biome} biome The biome to convert to JSON
 * @returns {object} The JSON representation of the biome
 */
export function biomeToJson(biome) {
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
export function blockToJson(block) {
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
 * @returns {object} The JSON representation of the bot
 */
export function botToJson(bot) {
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
    isSleeping: bot.isSleeping,

    biome: (() => {
      const position = bot.entity.position;
      const biome = bot.blockAt(position)?.biome;

      return biome !== undefined ? biomeToJson(biome) : null;
    })(),
    blocksNearby: (() => {
      const position = bot.entity.position;
      const blockMap = new Map();

      for (let x = -8; x <= 8; x++) {
        for (let y = -8; y <= 8; y++) {
          for (let z = -8; z <= 8; z++) {
            const block = bot.blockAt(position.offset(x, y, z));

            if (block !== null) {
              blockMap.set(block.name, {
                name: block.name,
                displayName: block.displayName,
              });
            }
          }
        }
      }

      return Array.from(blockMap.values());
    })(),
  };
}

/**
 * @param {import('prismarine-entity').Effect} effect The effect to convert to
 *    JSON
 * @returns {object} The JSON representation of the effect
 */
export function effectToJson(effect) {
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
export function entityToJson(entity) {
  return {
    id: entity.id,
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
export function itemToJson(item) {
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
export function playerToJson(player) {
  // TODO: Implement
  return {
    username: player.username,
  };
}

/**
 * @param {import('mineflayer').Time} time The time to convert to JSON
 * @returns {object} The JSON representation of the time
 */
export function timeToJson(time) {
  return {
    time: time.time,
    timeOfDay: time.timeOfDay,
    day: time.day,
    isDay: time.isDay,
    moonPhase: time.moonPhase,
    age: time.age,
  };
}
