import { Incident as DBIncident, Notify, Status } from 'database';
import { MessageEmbed, TextChannel } from 'discord.js';
import { getLogger } from 'log4js';
import { IIncident, IMaintenance, Incident, Indicator, Maintenance } from 'statuspageapi';
import turndown from 'turndown';
import { Bot } from '..';

export class StatusMessageManager {
    private readonly logger = getLogger('StatusMessageManager');
    private readonly bot: Bot;

    public constructor(bot: Bot) {
        this.bot = bot;
    }

    public async updateStatus(base: Incident | Maintenance, incident: IIncident | IMaintenance): Promise<void> {
        const DBStatus = await Status.findOne({ id: base.id });
        const incidentCache = DBStatus?.incidents.find(i => i.id === incident.id) ?? await new DBIncident({ id: incident.id }).save();
        const compatChannel = DBStatus?.subscribed.map(s => this.bot.channels.resolve(s.channel));
        const todo = compatChannel?.map(async c => {
            const cached = incidentCache.notified.find(n => n.channel === c?.id);
            try {
                const message = cached
                    ? await (this.bot.channels.resolve(cached.channel) as TextChannel).messages.fetch(cached.message)
                    : await (c as TextChannel).send(this.createStatusMessage(base, incident));
                if (cached) message.edit(this.createStatusMessage(base, incident));

                if (['resolved', 'completed'].includes(incident.status.toString())) {
                    const notify = await Notify.findOne({ message: message.id });
                    await notify?.remove();
                    incidentCache.notified = incidentCache.notified.filter(n => n.message !== message.id);
                    return;
                } else if (!cached) {
                    return incidentCache.notified.push(await new Notify({ channel: message.channel.id, message: message.id }).save());
                }
            } catch (e) {
                return this.logger.error(e);
            }
        });
        if (todo) await Promise.all(todo);

        if (!incidentCache.notified.length) {
            if (DBStatus) DBStatus.incidents = DBStatus.incidents.filter(i => i.id !== incidentCache.id);
            await incidentCache.remove();
        } else {
            if (!DBStatus?.incidents.find(i => i.id === incidentCache.id)) DBStatus?.incidents.push(incidentCache);
            await incidentCache.save();
        }
        await DBStatus?.save();
    }

    private createStatusMessage(base: Incident | Maintenance, incident: IIncident | IMaintenance) {
        const updates = [...incident.incident_updates];
        const embed = new MessageEmbed()
            .setAuthor(base.name, '', base.url)
            .setTitle(incident.name)
            .setURL(incident.shortlink)
            .setColor(colorIndicator(incident.impact))
            .setFooter(`${['resolved', 'scheduled', 'completed'].includes(incident.status.toString())
                ? humanReadableString(incident.status.toString())
                : updates.length === 1
                    ? 'Started'
                    : 'Updated'} ${incident.status.toString() === 'scheduled' ? 'for' : 'at'}`)
            .setDescription(
                `**__Affected Components__**\n${incident.components.length
                    ? incident.components.map(c => `**${c.name}** - ${['resolved', 'scheduled', 'completed'].includes(incident.status.toString())
                        ? incident.components.map(com => com.description ? com.description : 'No description.').join('\n')
                        : humanReadableString(c.status.toString())}`).join('\n')
                    : 'None'}`);

        if (incident.status === 'scheduled' && incident instanceof IMaintenance) {
            embed.setTimestamp(incident.scheduled_for);
        } else {
            embed.setTimestamp(incident.resolved_at ?? updates[updates.length - 1].created_at);
        }

        if (['resolved', 'completed'].includes(incident.status.toString())) {
            embed.setColor('GREEN');
        }

        updates.reverse().length = 25;
        embed.addFields(updates.map(i => ({
            name: humanReadableString(i.status.toString()),
            value: new turndown().turndown(i.body),
        })));

        return embed;
    }
}

function humanReadableString(str: string): string {
    return str.split('_').map(s => `${s[0].toUpperCase()}${s.slice(1)}`).join(' ');
}

function colorIndicator(color: Indicator): string {
    switch (color) {
        case 'maintenance':
            return 'BLUE';
        case 'critical':
            return 'RED';
        case 'major':
            return 'ORANGE';
        case 'minor':
            return 'YELLOW';
        default:
            return 'GREEN';
    }
}
