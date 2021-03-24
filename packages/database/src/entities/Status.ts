import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { Incident, Subscribe } from '.';

@Entity()
export class Status extends BaseEntity {
    @PrimaryColumn({ unique: true })
    public id!: string;

    @Column()
    public name!: string;

    @ManyToMany(() => Subscribe, subscribe => subscribe.status, { eager: true })
    @JoinTable()
    public subscribed!: Subscribe[];

    @OneToMany(() => Incident, incident => incident.status, { eager: true })
    @JoinTable()
    public incidents!: Incident[];

    @CreateDateColumn()
    public createdDate!: Date;

    public constructor(data?: { id: string, name: string }) {
        super();
        if (!data) return;
        this.id = data.id;
        this.name = data.name;
        this.subscribed = [];
        this.incidents = [];
    }
}
