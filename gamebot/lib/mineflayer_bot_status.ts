import {Bot, GameState, Player, Time} from 'mineflayer';
import {Biome} from 'prismarine-biome';
import {Block} from 'prismarine-block';
import {Effect, Entity} from 'prismarine-entity';
import {Item} from 'prismarine-item';
import {Vec3} from 'vec3';

export interface MineflayerBotStatus {
  username: string;
  version: string;
  entity: SerializedEntity;
  entities: {[id: string]: SerializedEntity};
  game: SerializedGameState;
  player: SerializedPlayer;
  players: {[username: string]: SerializedPlayer};
  isRaining: boolean;
  experience: {level: number; points: number; progress: number;};
  health: number;
  food: number;
  foodSaturation: number;
  oxygenLevel: number;
  time: SerializedTime;
  quickBarSlot: number;
  isSleeping: boolean;
  biome?: SerializedBiome;
  blocksNearby: SerializedBlock[];
}

export interface SerializedBiome {
  name: string;
  displayName?: string;
  rainfall: number;
  temperature: number;
}

export interface SerializedBlock {
  biome: SerializedBiome;
  position: Vec3;
  name: string;
  displayName: string;
  hardness: number;
  diggable: boolean;
}

export interface SerializedEffect {
  id: number;
  amplifier: number;
  duration: number;
}

export interface SerializedEntity {
  id: number;
  displayName?: string;
  name?: string;
  position: Vec3;
  velocity: Vec3;
  yaw: number;
  pitch: number;
  height: number;
  width: number;
  onGround: boolean;
  equipment: SerializedItem[];
  health?: number;
  food?: number;
  foodSaturation?: number;
  effects: SerializedEffect[];
}

export interface SerializedGameState {
  dimension: string;
}

export interface SerializedItem {
  count: number;
  name: string;
  maxDurability: number;
  durabilityUsed: number;
  enchants: {name: string, lvl: number}[];
}

export interface SerializedPlayer {
  username: string;
}

export interface SerializedTime {
  time: number;
  timeOfDay: number;
  day: number;
  isDay: boolean;
  moonPhase: number;
  age: number;
}

export function createMineflayerBotStatus(bot: Bot): MineflayerBotStatus {
  return botToJson(bot);
}

function biomeToJson(biome: Biome): SerializedBiome {
  return {
    name: biome.name,
    displayName: biome.displayName,
    rainfall: biome.rainfall,
    temperature: biome.temperature,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function blockToJson(block: Block): SerializedBlock {
  return {
    biome: biomeToJson(block.biome),
    position: block.position,
    name: block.name,
    displayName: block.displayName,
    hardness: block.hardness,
    diggable: block.diggable,
  };
}

function botToJson(bot: Bot): MineflayerBotStatus {
  return {
    username: bot.username,
    version: bot.version,
    entity: entityToJson(bot.entity),
    entities: Object.fromEntries(
        Object.entries(bot.entities)
            .map(([key, value]) => [key, entityToJson(value)])),
    game: gameStateToJson(bot.game),
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

      return biome !== undefined ? biomeToJson(biome) : undefined;
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

function effectToJson(effect: Effect): SerializedEffect {
  return {
    id: effect.id,
    amplifier: effect.amplifier,
    duration: effect.duration,
  };
}

function entityToJson(entity: Entity): SerializedEntity {
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

function gameStateToJson(gameState: GameState): SerializedGameState {
  return {
    dimension: gameState.dimension,
  };
}

function itemToJson(item: Item): SerializedItem {
  return {
    count: item.count,
    name: item.name,
    maxDurability: item.maxDurability,
    durabilityUsed: item.durabilityUsed,
    enchants: item.enchants,
  };
}

function playerToJson(player: Player): SerializedPlayer {
  // TODO: Implement
  return {
    username: player.username,
  };
}

function timeToJson(time: Time): SerializedTime {
  return {
    time: time.time,
    timeOfDay: time.timeOfDay,
    day: time.day,
    isDay: time.isDay,
    moonPhase: time.moonPhase,
    age: time.age,
  };
}
