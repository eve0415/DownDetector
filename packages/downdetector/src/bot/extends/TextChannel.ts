import { Subscribe } from 'database';
import { Structures, TextChannel as CTextChannel } from 'discord.js';

declare module 'discord.js' {
    interface TextChannel {
        getSubscribed(): Promise<Subscribe>,
    }
}

export class ExtendedTextChannel extends CTextChannel {
    public async getSubscribed(): Promise<Subscribe> {
        const cache = await Subscribe.findOne({ relations: ['status'], where: { channel: this.id } });
        if (cache) return cache;
        return new Subscribe(this);
    }
}

export default Structures.extend('TextChannel', () => ExtendedTextChannel);
