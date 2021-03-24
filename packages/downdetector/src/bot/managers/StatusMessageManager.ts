import { Incident as DBIncident, Notify, Status } from 'database';
import { MessageEmbed, TextChannel } from 'discord.js';
import { IncidentStatus, MaintenanceStatus, IIncident, Incident, Maintenance, Indicator } from 'statuspageapi';
import { Bot } from '..';

export class StatusMessageManager {
    private readonly bot: Bot;

    public constructor(bot: Bot) {
        this.bot = bot;
    }

    public async updateStatus(_status: IncidentStatus | MaintenanceStatus, base: Incident | Maintenance, incident: IIncident): Promise<void> {
        const DBStatus = await Status.findOne({ id: base.id });
        const incidentCache = DBStatus?.incidents.find(i => i.id === incident.id) ?? await new DBIncident({ id: incident.id }).save();
        await incidentCache.reload();
        const compatChannel = DBStatus?.subscribed.map(s => this.bot.channels.resolve(s.channel));
        const todo = compatChannel?.map(async c => {
            const cached = incidentCache.notified.find(n => n.channel === c?.id);
            try {
                if (cached) {
                    const message = await (this.bot.channels.resolve(cached.channel) as TextChannel).messages.fetch(cached.message);
                    return message.edit(this.createStatusMessage(base, incident));
                }
                const message = await (c as TextChannel).send(this.createStatusMessage(base, incident));
                return incidentCache.notified.push(await new Notify({ channel: message.channel.id, message: message.id }).save());
            } catch (e) {
                return console.error(e);
            }
        });
        if (todo) await Promise.all(todo);

        if (!DBStatus?.incidents.find(i => i.id === incidentCache.id)) DBStatus?.incidents.push(incidentCache);

        await DBStatus?.save();
        await incidentCache.save();
    }

    private createStatusMessage(base: Incident | Maintenance, incident: IIncident) {
        const updates = [...incident.incident_updates];
        const embed = new MessageEmbed()
            .setAuthor(base.name, '', base.url)
            .setTitle(incident.name)
            .setURL(incident.shortlink)
            .setColor(colorIndicator(incident.impact))
            .setFooter(`${updates[0].status === 'resolved'
                ? 'Resolved'
                : updates.length === 1
                    ? 'Started'
                    : 'Updated'} at`)
            .setTimestamp(updates[updates.length - 1].created_at);

        if (updates[0].status === 'resolved') {
            embed.setColor('GREEN');
        } else {
            embed.setDescription(
                `**__Affected Components__**\n${updates[0].affected_components.length
                    ? updates[0].affected_components.map(c => `**${c.name}** - ${c.new_status.toString().split('_').map(a => `${a[0].toUpperCase()}${a.slice(1)}`)
                        .join(' ')}`).join('\n')
                    : 'None'}`);
        }

        updates.reverse().length = 25;
        embed.addFields(updates.map(i => ({
            name: i.status
                .toString()
                .split('_')
                .map(a => `${a[0].toUpperCase()}${a.slice(1)}`)
                .join(' '),
            value: i.body,
        })));

        return embed;
    }
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
