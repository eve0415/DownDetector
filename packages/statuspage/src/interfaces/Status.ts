import { Indicator } from '.';
import { Page, RPage } from './Base';

export interface IStatus {
    readonly indicator: Indicator
    readonly description: string
}

export interface RStatus extends RPage {
    readonly status: IStatus
}

export class Status extends Page {
    public readonly status: {
        readonly indicator: Indicator
        readonly description: string
    };

    public constructor(data: RStatus) {
        super(data);
        this.status = { indicator: data.status.indicator, description: data.status.indicator };
    }
}
