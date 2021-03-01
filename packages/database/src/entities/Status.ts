import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { Subscribe } from './Subscribe';

@Entity()
export class Status extends BaseEntity {
    @PrimaryColumn({ unique: true })
    public id!: string;

    @Column()
    public name!: string;

    @ManyToMany(() => Subscribe, subscribe => subscribe.status)
    @JoinTable()
    public subscribed!: Subscribe[];

    @CreateDateColumn()
    public createdDate!: Date;

    public constructor(data?: Required<{ id: string, name: string }>) {
        super();
        if (!data) return;
        this.id = data.id;
        this.name = data.name;
        this.subscribed = [];
    }
}
