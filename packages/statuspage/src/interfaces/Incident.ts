import { ComponentStatus, IComponent, MaintenanceStatus, Page, RPage } from '.';

export type Indicator = 'none' | 'minor' | 'major' | 'critical' | 'maintenance';

export type IncidentStatus =
  | 'investigating'
  | 'identified'
  | 'monitoring'
  | 'resolved'
  | 'postmortem';

export class IIncident {
    public readonly id: string;
    public readonly name: string;
    public readonly status: IncidentStatus | MaintenanceStatus;
    public readonly created_at: Date;
    public readonly updated_at: Date;
    public readonly monitoring_at: Date | null;
    public readonly resolved_at: Date | null;
    public readonly impact: Indicator;
    public readonly shortlink: string;
    public readonly started_at: Date;
    public readonly page_id: string;
    public readonly incident_updates: IncidentUpdates[];
    public readonly components: IComponent[];

    constructor(data: IIncident) {
        this.id = data.id;
        this.name = data.name;
        this.status = data.status;
        this.impact = data.impact;
        this.shortlink = data.shortlink;
        this.page_id = data.page_id;

        this.created_at = new Date(data.created_at);
        this.updated_at = new Date(data.updated_at);
        this.started_at = new Date(data.started_at);

        this.monitoring_at = data.monitoring_at ? this.monitoring_at = new Date(data.monitoring_at) : null;
        this.resolved_at = data.resolved_at ? new Date(data.resolved_at) : null;

        this.incident_updates = data.incident_updates.map(i => new IncidentUpdates(i));
        this.components = data.components.map(c => new IComponent(c));
    }
}

class IncidentUpdates {
    public readonly id: string;
    public readonly status: IncidentStatus;
    public readonly body: string;
    public readonly incident_id: string;
    public readonly created_at: Date;
    public readonly updated_at: Date;
    public readonly display_at: Date;
    public readonly affected_components: AffectedComponent[];
    public readonly deliver_notifications: boolean;
    public readonly custom_tweet: null;
    public readonly tweet_id: number;

    public constructor(data: IncidentUpdates) {
        this.id = data.id;
        this.status = data.status;
        this.body = data.body;
        this.incident_id = data.incident_id;
        this.affected_components = data.affected_components;
        this.custom_tweet = null;
        this.tweet_id = data.tweet_id;

        this.created_at = new Date(data.created_at);
        this.updated_at = new Date(data.updated_at);
        this.display_at = new Date(data.display_at);
        this.deliver_notifications = Boolean(data.deliver_notifications);
    }
}

interface AffectedComponent {
    readonly code: string,
    readonly name: string,
    readonly old_status: ComponentStatus,
    readonly new_status: ComponentStatus
}

export interface RIncident extends RPage {
    readonly incidents: IIncident[]
}

export class Incident extends Page {
    public readonly incidents: IIncident[];

    public constructor(data: RIncident) {
        super(data);
        this.incidents = data.incidents.map(c => new IIncident(c));
    }
}
