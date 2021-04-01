import { getLogger, Logger } from 'log4js';
import { Base } from '.';
import { Bot } from '..';

export abstract class Event extends Base {
    protected readonly logger: Logger;
    public readonly bind: (...args: unknown[]) => void;

    public constructor(bot: Bot, name: string) {
        super(bot, name);

        this.logger = getLogger(name);
        this.bind = this.run.bind(this);
    }

    public abstract run (...args: unknown[]): void;
}
