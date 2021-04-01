import { Bot } from '..';
import { Event } from '../interfaces';

export default class extends Event {
    public constructor(bot: Bot) {
        super(bot, 'ready');
    }

    public run(): void {
        this.logger.info('Bot has succesfully logged in and is Ready.');
    }
}
