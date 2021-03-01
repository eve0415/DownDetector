import { Bot } from '..';
import { Event } from '../interfaces';

export default class extends Event {
    public constructor(bot: Bot) {
        super(bot, 'ready');
    }

    public run(): void {
        console.info('[BOT] Bot has succesfully logged in and is Ready.');
    }
}
