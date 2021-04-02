import { Database } from 'database';
import { getLogger, shutdown } from 'log4js';
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
        this.errorHandler();
        await this.database.connect();
        await this.statusManager.init();
        await this.bot.start();
        this.statusManager.postInit();
    }

    private shutdown() {
        this.logger.info('Shutting down system...');
        shutdown();
        process.exit();
    }

    private errorHandler() {
        ['SIGTERM', 'SIGINT', 'uncaughtException', 'unhandledRejection']
            .forEach(signal => process.on(signal, async e => {
                if (e === 'unhandledRejection') {
                    this.logger.error('Unexpected error occured');
                    this.logger.error(e);
                    await this.bot.sendError(e);
                    return;
                }
                if (!(e === 'SIGINT' || e === 'SIGTERM')) {
                    this.logger.fatal('Unexpected error occured');
                    this.logger.fatal(e);
                    await this.bot.sendError(e);
                }
                this.shutdown();
            }));
    }
}

new DownDetector().start();
