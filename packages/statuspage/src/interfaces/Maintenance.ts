import { IIncident, Page, RPage } from '.';

export type MaintenanceStatus =
    | 'scheduled'
    | 'in_progress'
    | 'verifying'
    | 'completed';

export class IMaintenance extends IIncident {
    public readonly scheduled_for: Date;
    public readonly scheduled_until: Date;

    public constructor(data: IMaintenance) {
        super(data);
        this.scheduled_for = new Date(data.scheduled_for);
        this.scheduled_until = new Date(data.scheduled_until);
    }
}

export interface RMaintenance extends RPage {
    readonly scheduled_maintenances: IMaintenance[];
}

export class Maintenance extends Page {
    public readonly scheduled_maintenances: IMaintenance[];

    public constructor(data: RMaintenance) {
        super(data);
        this.scheduled_maintenances = data.scheduled_maintenances.map(s => new IMaintenance(s));
    }
}
