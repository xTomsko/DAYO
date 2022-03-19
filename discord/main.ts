import {
  ApplicationCommandInteraction,
  command,
  CommandClient,
  CommandContext,
  config,
  customValidation,
  event,
  FindCursor,
  Intents,
  slash,
} from "../deps/discord/deps.ts";
import { commands } from "./commands/commands.ts";
import { db } from "../web/backend/db/mongo.ts";
import { placeBet } from "./commands/placeBet.ts";
import { showBet } from "./commands/showBet.ts";
import { showMatches } from "./commands/matches.ts";
import { addMatchNight } from "./commands/addMatchNight.ts";
import { addMatchBox } from "./commands/addMatchBox.ts";
import {getAdminIds} from "./commands/util.ts";

const env = config();
const token = Deno.env.get("BOT_TOKEN") || env.BOT_TOKEN;

const adminIds: Array<string> = await getAdminIds();

class DAYO extends CommandClient {
  constructor() {
    super({
      prefix: "!",
      caseSensitive: false,
    });
  }

  @event()
  async ready(): Promise<void> {
    await db;
    const currentCommands = await this.interactions.commands.all();
    if (currentCommands.size != commands.length) {
      await this.interactions.commands.bulkEdit(commands);
    }
  }

  @slash("bet")
  async betCommand(i: ApplicationCommandInteraction): Promise<void> {
    await placeBet(i);
  }

  @slash("showbet")
  async mybetCommand(i: ApplicationCommandInteraction): Promise<void> {
    await showBet(i);
  }

  @slash("add-match-night")
  @customValidation(
    (i) => adminIds.includes(i.user.id),
    "No permissions",
  )
  async addMatchNightCommand(i: ApplicationCommandInteraction): Promise<void> {
    await addMatchNight(i);
  }

  @slash("add-match-box")
  @customValidation(
    (i) => adminIds.includes(i.user.id),
    "No permissions",
  )
  async addMatchBoxCommand(i: ApplicationCommandInteraction): Promise<void> {
    await addMatchBox(i);
  }

  @command({ aliases: "matches" })
  async matches(ctx: CommandContext): Promise<void> {
    const msg = await showMatches();
    await ctx.message.reply(msg);
  }
}

const bot = new DAYO();
bot.connect(token, Intents.None);
