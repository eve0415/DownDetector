import { IComponent, IIncident, IMaintenance, IStatus, Page, RPage } from '.';

export interface RSummary extends RPage {
    readonly components: IComponent[];
    readonly incidents: IIncident[];
    readonly scheduled_maintenances: IMaintenance[];
    readonly status: IStatus;
}

export class Summary extends Page {
    public readonly components: IComponent[];
    public readonly incidents: IIncident[];
    public readonly scheduled_maintenances: IMaintenance[];
    public readonly status: IStatus;

    public constructor(data: RSummary) {
        super(data);
        this.components = data.components.map(c => new IComponent(c));
        this.incidents = data.incidents.map(i => new IIncident(i));
        this.scheduled_maintenances = data.scheduled_maintenances.map(s => new IMaintenance(s));
        this.status = data.status;
    }
}
