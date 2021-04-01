import { Database } from 'database';
import { getLogger } from 'log4js';
import { StatusManager } from './StatusManager';
import { Bot } from './bot';

export class DownDetector {
    private readonly logger = getLogger('DownDetector');
    protected database: Database;
    public statusManager: StatusManager;
    public bot: Bot;

    constructor() {
        getLogger().level = process.env.NODE_ENV ? 'trace' : 'info';

        this.database = new Database();
        this.statusManager = new StatusManager(this);
        this.bot = new Bot(this);
    }

    public async start(): Promise<void> {
        this.logger.info('Initializing...');
        await this.init();
        this.logger.info('Initialize Complete');
    }

    private async init() {
        await this.database.connect();
        await this.statusManager.init();
        await this.bot.start();
        this.statusManager.postInit();
    }
}

new DownDetector().start();