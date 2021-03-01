import type { Snowflake, TextChannel } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from './Status';

@Entity()
export class Subscribe extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    public channel!: Snowflake;

    @Column()
    public guild!: Snowflake;

    @ManyToMany(() => Status, status => status.subscribed)
    public status!: Status[];

    public constructor(channel?: TextChannel) {
        super();
        if (!channel?.guild) return;
        this.channel = channel.id;
        this.guild = channel.guild.id;
        this.status = [];
    }
}
