//@ts-check
'use strict';

// TODO: interrupt actions on demand.

import pathfinderModule from 'mineflayer-pathfinder';
import {Block} from 'prismarine-block';

const GoalLookAtBlock = pathfinderModule.goals.GoalLookAtBlock;
const GoalNear = pathfinderModule.goals.GoalNear;
const GoalNearXZ = pathfinderModule.goals.GoalNearXZ;

/**
 * Collects blocks.
 * @param {import('./bot.js').Bot} bot The bot.
 * @param {string} name The block name.
 * @param {number} count The block count.
 * @returns {Promise<{type: string, message?: string,}>} The result.
 */
export async function collectBlock(bot, name, count = 1) {
  const mcdata = bot.getMcdata();
  const mineflayerBot = bot.getMineflayerBot();

  // Validate name.
  if (!mcdata.blocksByName[name]) {
    return {
      type: 'error',
      message: `invalid block name: ${name}`,
    };
  }

  // Find blocks.
  const blocks = mineflayerBot.findBlocks({
    matching: mcdata.blocksByName[name].id,
    maxDistance: 32,
    count: count,
  });
  if (blocks.length === 0) {
    return {
      type: 'error',
      message: `cannot find ${name} nearby`,
    };
  }

  // Collect blocks.
  /**
   * @type {import('prismarine-block').Block[]}
   */
  const targets = [];
  blocks.forEach((block) => {
    if (block instanceof Block) {
      targets.push(block);
    }
  });

  await bot.getCollectBlock().collect(targets, {
    ignoreNoPath: true,
  });

  return {
    type: 'success',
    message: `collected ${targets.length} ${name}`,
  };
}

/**
 * Crafts items.
 * @param {import('./bot.js').Bot} bot The bot.
 * @param {string} name The item name.
 * @param {number} count The item count.
 * @param {boolean} useCraftingTable Whether to use a crafting table.
 * @returns {Promise<{type: string, message?: string,}>} The result.
 */
export async function craftItem(
    bot, name, count = 1, useCraftingTable = false) {
  const mcdata = bot.getMcdata();
  const mineflayerBot = bot.getMineflayerBot();
  const pathfinder = bot.getPathfinder();

  // Validate name.
  if (!mcdata.itemsByName[name]) {
    return {
      type: 'error',
      message: `invalid item name: ${name}`,
    };
  }

  /**
   * @type {import('prismarine-block').Block | null}
   */
  let craftingTableBlock = null;

  // Goto crafting table if needed.
  if (useCraftingTable) {
    craftingTableBlock = mineflayerBot.findBlock({
      matching: mcdata.blocksByName.crafting_table.id,
      maxDistance: 32,
    });
    if (craftingTableBlock === null) {
      return {
        type: 'error',
        message: 'cannot find crafting table nearby',
      };
    }

    await pathfinder.goto(new GoalLookAtBlock(
        craftingTableBlock.position,
        mineflayerBot.world,
        ));
  }

  let successCount = 0;

  for (let i = 0; i < count; i++) {
    const recipe = mineflayerBot.recipesFor(
        mcdata.itemsByName[name].id, null, 1, craftingTableBlock)[0];
    if (recipe) {
      try {
        await mineflayerBot.craft(recipe, 1, craftingTableBlock ?? undefined);
        successCount++;
      } catch (err) {
        // Ignore.
      }
    }
  }

  if (successCount === 0) {
    return {
      type: 'error',
      message: `cannot craft ${name}`,
    };
  } else {
    return {
      type: 'success',
      message: `crafted ${successCount} ${name}`,
    };
  }
}

/**
 * Explores the world.
 * @param {import('./bot.js').Bot} bot The bot.
 * @param {import('vec3').Vec3} maxReplacement The max replacement.
 * @param {boolean} ignoreY Whether to ignore Y axis.
 * @param {number} timeout The timeout in seconds.
 * @returns {Promise<{type: string, message?: string,}>} The result.
 */
export async function explore(
    bot, maxReplacement, ignoreY = false, timeout = 60) {
  const mineflayerBot = bot.getMineflayerBot();
  const pathfinder = bot.getPathfinder();

  const startTime = Date.now();
  while (Date.now() - startTime < timeout * 1000) {
    const currentPosition = mineflayerBot.entity.position;
    const dx = Math.round(maxReplacement.x * Math.random());
    const dy = Math.round(maxReplacement.y * Math.random());
    const dz = Math.round(maxReplacement.z * Math.random());

    if (ignoreY === true) {
      await pathfinder.goto(
          new GoalNearXZ(
              currentPosition.x + dx,
              currentPosition.z + dz,
              3 /* range */,
              ),
      );
    } else {
      await pathfinder.goto(
          new GoalNear(
              currentPosition.x + dx,
              currentPosition.y + dy,
              currentPosition.z + dz,
              3 /* range */,
              ),
      );
    }
  }

  return {
    type: 'success',
    message: 'successfully explored the world',
  };
}

/**
 * Kills a specific entity.
 * @param {import('./bot.js').Bot} bot The bot.
 * @param {number} id The ID of the entity.
 * @returns {Promise<{type: string, message?: string,}>} The result.
 */
export async function killEntity(bot, id) {
  const mineflayerBot = bot.getMineflayerBot();
  const pvp = bot.getPvp();

  const entity = (() => {
    for (const entityKey in mineflayerBot.entities) {
      const entity = mineflayerBot.entities[entityKey];

      if (entity.id === id) {
        return entity;
      }
    }

    return null;
  })();

  if (entity === null) {
    return {
      type: 'error',
      message: `cannot find entity with ID ${id}`,
    };
  }

  await pvp.attack(entity);

  if (!pvp.target) {
    return {
      type: 'success',
      message: `killed entity with ID ${id}`,
    };
  } else {
    return {
      type: 'error',
      message: `failed to kill entity with ID ${id}`,
    };
  }
}
