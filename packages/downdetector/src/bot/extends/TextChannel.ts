import { Subscribe } from 'database';
import { Structures } from 'discord.js';

declare module 'discord.js' {
    interface TextChannel {
        getSubscribed(): Promise<Subscribe>,
    }
}

export default Structures.extend('TextChannel', TextChannel => class extends TextChannel {
    public async getSubscribed(): Promise<Subscribe> {
        const cache = await Subscribe.findOne({ relations: ['status'], where: { channel: this.id } });
        if (cache) return cache;
        return new Subscribe(this);
    }
});
