import { EventEmitter as Emitter } from 'events';
import { Collection } from 'discord.js';
import {
    IComponent,
    IIncident,
    IMaintenance,
    Incident,
    IncidentStatus,
    Maintenance,
    MaintenanceStatus,
    StatusPageApi,
    Summary,
} from 'statuspageapi';

interface StatusEvents {
    'statusUpdate': [IncidentStatus | MaintenanceStatus, IIncident]
}

declare module 'events' {
    interface EventEmitter {
        emit<K extends keyof StatusEvents>(event: K, ...args: StatusEvents[K]): boolean
    }
}

export class StatusPage extends Emitter {
    public readonly id: string;
    public lastUpdate!: Date;
    public ongoingIncidents = false;
    public ongoingMaintenance = false;
    public hasScheduledMaintenance = false;
    public components: IComponent[] = [];

    private checkUpdate!: NodeJS.Timeout;
    private readonly api: StatusPageApi;
    private readonly inicidents: Collection<string, IIncident> = new Collection();
    private readonly maintenance: Collection<string, IMaintenance> = new Collection();

    public constructor(id: string) {
        super();
        this.id = id;
        this.api = new StatusPageApi(id);
    }

    public init(): void {
        this.fetchUpdate();
    }

    private fetchUpdate(): void {
        this.checkUpdate = setInterval(() => this.update(), 60000);
    }

    private async update() {
        if (this.ongoingIncidents) {
            const res = await this.getUnresolvedIncindents();
            if (!res.incidents) {
                const allIncindents = await this.getAllIncindents();
                this.inicidents.forEach(incident => {
                    const resolved = allIncindents.incidents.find(i => i.id === incident.id);
                    if (resolved) super.emit('statusUpdate', incident.status, resolved);
                });
                this.ongoingIncidents = false;
                this.inicidents.clear();
            } else {
                for (const incident of res.incidents) {
                    const cached = this.inicidents.get(incident.id);
                    if (!cached) {
                        super.emit('statusUpdate', incident.status, incident);
                    }
                    if (incident !== cached) {
                        super.emit('statusUpdate', incident.status, incident);
                        this.inicidents.delete(incident.id);
                    }
                    this.inicidents.set(incident.id, incident);
                }
            }
        } else if (this.ongoingMaintenance) {
            const res = await this.getActiveMaintenances();
            if (!res.scheduled_maintenances) {
                const allMaintenances = await this.getAllMaintenances();
                this.inicidents.forEach(maintenance => {
                    const resolved = allMaintenances.scheduled_maintenances.find(m => m.id === maintenance.id);
                    if (resolved) super.emit('statusUpdate', maintenance.status, resolved);
                });
                this.ongoingIncidents = false;
                this.inicidents.clear();
            } else {
                for (const maintenance of res.scheduled_maintenances) {
                    const cached = this.maintenance.get(maintenance.id);
                    if (!cached) {
                        super.emit('statusUpdate', maintenance.status, maintenance);
                    }
                    if (maintenance !== cached) {
                        super.emit('statusUpdate', maintenance.status, maintenance);
                        this.inicidents.delete(maintenance.id);
                    }
                    this.inicidents.set(maintenance.id, maintenance);
                }
            }
        } else {
            const res = await this.getSummary();
            this.components = res.components;
            res.incidents.map(i => this.inicidents.set(i.id, i));
            res.scheduled_maintenances.map(m => {
                if (!this.maintenance.has(m.id)) {
                    super.emit('statusUpdate', m.status, m);
                } else if (this.maintenance.get(m.id) !== m) {
                    this.maintenance.delete(m.id);
                }
                return this.maintenance.set(m.id, m);
            });
            this.ongoingIncidents = !!res.incidents.length;
            this.hasScheduledMaintenance = !!res.scheduled_maintenances.length;
        }

        if (this.hasScheduledMaintenance) {
            this.maintenance.forEach(m => {
                if (m.status !== 'scheduled') this.ongoingMaintenance = true;
                super.emit('statusUpdate', m.status, m);
            });
        }
    }

    public clear(): void {
        clearInterval(this.checkUpdate);
    }

    public getSummary(): Promise<Summary> {
        return this.api.getSummary();
    }

    /*
    public getStatus(): Promise<Status> {
        return this.api.getStatus();
    }

    public getComponent(): Promise<Component> {
        return this.api.getComponent();
    }
    */

    public getAllIncindents(): Promise<Incident> {
        return this.api.getAllIncindents();
    }

    public getUnresolvedIncindents(): Promise<Incident> {
        return this.api.getUnresolvedIncindents();
    }

    public getAllMaintenances(): Promise<Maintenance> {
        return this.api.getAllMaintenances();
    }

    /*
    public getUpcomingMaintenances(): Promise<Maintenance> {
        return this.api.getUpcomingMaintenances();
    }
    */

    public getActiveMaintenances(): Promise<Maintenance> {
        return this.api.getActiveMaintenances();
    }
}
