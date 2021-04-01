import './extends';
import { Client } from 'discord.js';
import { getLogger } from 'log4js';
import { CommandManager, EventManager, StatusMessageManager } from './managers';
import { DownDetector } from '../DownDetector';

export class Bot extends Client {
    private readonly logger = getLogger('BOT');

    public readonly instance: DownDetector;
    private readonly event: EventManager;
    public readonly command: CommandManager;
    public readonly status: StatusMessageManager;

    public constructor(instance: DownDetector) {
        super({
            restTimeOffset: 0,
            intents: ['GUILDS', 'GUILD_MESSAGES'],
        });
        this.instance = instance;
        this.event = new EventManager(this, 'EventManager');
        this.command = new CommandManager(this, 'CommandManager');
        this.status = new StatusMessageManager(this);
    }

    public async start(): Promise<void> {
        this.logger.info('Initializing...');
        await this.init().catch(e => this.logger.error(e));
        await this.login().catch(e => this.logger.error(e));
    }

    private async init() {
        await Promise.all([
            this.event.registerAll(),
            this.command.registerAll(),
        ]);
        this.logger.info('Initialize complete');
    }
}
