import type { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Incident } from '.';


@Entity()
export class Notify extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: string;

    @ManyToMany(() => Incident, incident => incident.notified)
    public incidents!: Incident[];

    @Column()
    public channel!: Snowflake;

    @Column()
    public message!: Snowflake;

    public constructor(data?: { channel: Snowflake, message: Snowflake }) {
        super();
        if (!data) return;
        this.channel = data.channel;
        this.message = data.message;
        this.incidents = [];
    }
}
