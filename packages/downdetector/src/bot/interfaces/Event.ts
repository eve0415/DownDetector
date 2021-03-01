import { Base } from '.';
import { Bot } from '..';

export abstract class Event extends Base {
    public readonly bind: (...args: unknown[]) => void;
    public constructor(bot: Bot, name: string) {
        super(bot, name);

        this.bind = this.run.bind(this);
    }

    public abstract run (...args: unknown[]): void;
}
