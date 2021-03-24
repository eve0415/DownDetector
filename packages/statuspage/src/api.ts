import axios from 'axios';
import {
    Summary,
    RSummary,
    Status,
    RStatus,
    Component,
    RComponent,
    Incident,
    RIncident,
    Maintenance,
    RMaintenance,
} from '.';

export class StatusPageApi {
    private readonly baseUrl: string;

    public readonly id: string;

    constructor(id: string) {
        this.id = id;
        this.baseUrl = `https://${id}.statuspage.io/api/v2`;
    }

    public async getSummary(): Promise<Summary> {
        const response = await axios.get<RSummary>(`${this.baseUrl}/summary.json`);
        return new Summary(response.data);
    }

    public async getStatus(): Promise<Status> {
        const response = await axios.get<RStatus>(`${this.baseUrl}/status.json`);
        return new Status(response.data);
    }

    public async getComponent(): Promise<Component> {
        const response = await axios.get<RComponent>(`${this.baseUrl}/components.json`);
        return new Component(response.data);
    }

    public async getAllIncidents(): Promise<Incident> {
        const response = await axios.get<RIncident>(`${this.baseUrl}/incidents.json`);
        return new Incident(response.data);
    }

    public async getUnresolvedIncidents(): Promise<Incident> {
        const response = await axios.get<RIncident>(`${this.baseUrl}/incidents/unresolved.json`);
        return new Incident(response.data);
    }

    public async getAllMaintenances(): Promise<Maintenance> {
        const response = await axios.get<RMaintenance>(`${this.baseUrl}/scheduled-maintenances.json`);
        return new Maintenance(response.data);
    }

    public async getUpcomingMaintenances(): Promise<Maintenance> {
        const response = await axios.get<RMaintenance>(`${this.baseUrl}/scheduled-maintenances/upcoming.json`);
        return new Maintenance(response.data);
    }

    public async getActiveMaintenances(): Promise<Maintenance> {
        const response = await axios.get<RMaintenance>(`${this.baseUrl}/scheduled-maintenances/active.json`);
        return new Maintenance(response.data);
    }
}
