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
    'statusUpdate': [IncidentStatus | MaintenanceStatus, Incident | Maintenance, IIncident]
}

declare module 'events' {
    interface EventEmitter {
        emit<K extends keyof StatusEvents>(event: K, ...args: StatusEvents[K]): boolean
        on<K extends keyof StatusEvents>(event: K, listener: (...args: StatusEvents[K]) => void): this
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
    private readonly incidents: Collection<string, IIncident> = new Collection();
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
        // this.checkUpdate = setInterval(() => this.update(), 60000);
        this.checkUpdate = setInterval(() => this.update(), 20000);
    }

    private async update() {
        this.lastUpdate = new Date;
        if (this.ongoingIncidents) {
            const res = await this.getUnresolvedIncidents();
            if (!res.incidents.length) {
                const allIncidents = await this.getAllIncidents();
                this.incidents.forEach(incident => {
                    const resolved = allIncidents.incidents.find(i => i.id === incident.id);
                    if (resolved) super.emit('statusUpdate', incident.incident_updates[0].status, allIncidents, resolved);
                });
                this.ongoingIncidents = false;
                this.incidents.clear();
            } else {
                const oldIncidents = this.incidents.filter(i => res.incidents.findIndex(r => r.id === i.id) === -1);
                if (oldIncidents.size) {
                    const allIncidents = await this.getAllIncidents();
                    oldIncidents.forEach(incident => {
                        const resolved = allIncidents.incidents.find(i => i.id === incident.id);
                        if (resolved) super.emit('statusUpdate', incident.incident_updates[0].status, allIncidents, resolved);
                    });
                }
                res.incidents.forEach(incident => {
                    const cached = this.incidents.get(incident.id);
                    if (!cached || incident.incident_updates.length !== cached?.incident_updates.length) {
                        super.emit('statusUpdate', incident.status, res, incident);
                        this.incidents.delete(incident.id);
                    }
                    this.incidents.set(incident.id, incident);
                });
            }
        }

        if (this.ongoingMaintenance) {
            const res = await this.getActiveMaintenances();
            if (!res.scheduled_maintenances.length) {
                const allMaintenances = await this.getAllMaintenances();
                this.incidents.forEach(maintenance => {
                    const resolved = allMaintenances.scheduled_maintenances.find(m => m.id === maintenance.id);
                    if (resolved) super.emit('statusUpdate', maintenance.incident_updates[0].status, res, resolved);
                });
                this.ongoingIncidents = false;
                this.incidents.clear();
            } else {
                res.scheduled_maintenances.forEach(maintenance => {
                    const cached = this.maintenance.get(maintenance.id);
                    if (!cached || maintenance.incident_updates.length !== cached?.incident_updates.length) {
                        super.emit('statusUpdate', maintenance.status, res, maintenance);
                        this.incidents.delete(maintenance.id);
                    }
                    this.incidents.set(maintenance.id, maintenance);
                });
            }
        }

        if (!this.ongoingIncidents && !this.ongoingMaintenance) {
            const res = await this.getSummary();
            this.components = res.components;
            res.incidents.map(i => this.incidents.set(i.id, i));
            res.scheduled_maintenances.map(m => {
                if (!this.maintenance.has(m.id)) {
                    super.emit('statusUpdate', m.status, res, m);
                } else if (this.maintenance.get(m.id) !== m) {
                    this.maintenance.delete(m.id);
                }
                return this.maintenance.set(m.id, m);
            });
            this.ongoingIncidents = !!res.incidents.length;
            this.hasScheduledMaintenance = !!res.scheduled_maintenances.length;

            if (this.ongoingIncidents) {
                this.incidents.forEach(i => {
                    this.ongoingIncidents = true;
                    super.emit('statusUpdate', i.status, res, i);
                });
            }
            if (this.hasScheduledMaintenance) {
                this.maintenance.forEach(m => {
                    if (m.status !== 'scheduled') this.ongoingMaintenance = true;
                    super.emit('statusUpdate', m.status, res, m);
                });
            }
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

    public getAllIncidents(): Promise<Incident> {
        return this.api.getAllIncidents();
    }

    public getUnresolvedIncidents(): Promise<Incident> {
        return this.api.getUnresolvedIncidents();
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
