import { IComponent, IIncident, IMaintenance, IStatus, Page, RPage } from '.';

export interface RSummary extends RPage {
    components: IComponent[];
    incidents: IIncident[];
    scheduled_maintenances: IMaintenance[];
    status: IStatus;
}

export class Summary extends Page {
    components: IComponent[];
    incidents: IIncident[];
    scheduled_maintenances: IMaintenance[];
    status: IStatus;

    public constructor(data: RSummary) {
        super(data);
        this.components = data.components.map(c => new IComponent(c));
        this.incidents = data.incidents.map(i => new IIncident(i));
        this.scheduled_maintenances = data.scheduled_maintenances.map(s => new IMaintenance(s));
        this.status = data.status;
    }
}
