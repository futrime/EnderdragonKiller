//@ts-check
'use strict';

import {Block} from 'prismarine-block';

/**
 * Mines a block.
 * @param {import('./bot.js').Bot} bot The bot.
 * @param {string} name The block name.
 * @param {number} count The block count.
 */
export async function mineBlock(bot, name, count = 1) {
  const mcdata = bot.getMcdata();
  const mineflayerBot = bot.getMineflayerBot();

  // Validate name.
  if (!mcdata.blocksByName[name]) {
    throw new Error(`invalid block name: ${name}`);
  }

  // Find blocks.
  const blocks = mineflayerBot.findBlocks({
    matching: mcdata.blocksByName[name].id,
    maxDistance: 32,
    count: count,
  });
  if (blocks.length === 0) {
    throw new Error(`no blocks found: ${name}`);
  }

  // Mine blocks.
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
}
