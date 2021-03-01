import { Page, RPage } from '.';

export type ComponentStatus =
    | 'operational'
    | 'degraded_performance'
    | 'partial_outage'
    | 'major_outage'
    | 'under_maintenance';

export class IComponent {
    public readonly id: string;
    public readonly name: string;
    public readonly status: ComponentStatus;
    public readonly created_at: Date;
    public readonly updated_at: Date;
    public readonly position: number;
    public readonly description: string | null;
    public readonly showcase: boolean;
    public readonly start_date: Date | null;
    public readonly group_id: string | null;
    public readonly page_id: string;
    public readonly group: boolean;
    public readonly only_show_if_degraded: boolean;

    public constructor(data: IComponent) {
        this.id = data.id;
        this.name = data.name;
        this.status = data.status;
        this.position = data.position;
        this.page_id = data.page_id;

        this.showcase = Boolean(data.showcase);
        this.group = Boolean(data.group);
        this.only_show_if_degraded = Boolean(data.only_show_if_degraded);

        this.created_at = new Date(data.created_at);
        this.updated_at = new Date(data.updated_at);

        this.start_date = data.start_date ? new Date(data.start_date) : null;
        this.group_id = data.group_id ?? null;
        this.description = data.description ?? null;
    }
}

export interface RComponent extends RPage {
    readonly components: IComponent[]
}

export class Component extends Page {
    public readonly components: IComponent[];

    public constructor(data: RComponent) {
        super(data);
        this.components = data.components.map(c => new IComponent(c));
    }
}
