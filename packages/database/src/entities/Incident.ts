import { BaseEntity, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { Notify, Status } from '.';

@Entity()
export class Incident extends BaseEntity {
    @PrimaryColumn({ unique: true })
    public id!: string;

    @ManyToOne(() => Status, status => status.incidents)
    public status!: Status;

    @ManyToMany(() => Notify, notify => notify.incidents, { eager: true })
    @JoinTable()
    public notified!: Notify[];

    public constructor(data?: { id: string }) {
        super();
        if (!data) return;
        this.id = data.id;
        this.notified = [];
    }
}
