import { Bot } from '..';

export class Base {
    public readonly bot: Bot;
    public readonly name: string;

    public constructor(bot: Bot, name: string) {
        this.bot = bot;
        this.name = name;
    }
}
