export interface RPage {
    readonly page: {
        readonly id: string;
        readonly name: string;
        readonly url: string;
        readonly time_zone: string;
        readonly updated_at: string;
    };
}

export class Page {
    readonly id: string;
    readonly name: string;
    readonly url: string;
    readonly time_zone: string;
    readonly updated_at: Date;

    constructor(data: RPage) {
        this.id = data.page.id;
        this.name = data.page.name;
        this.url = data.page.url;
        this.time_zone = data.page.time_zone;
        this.updated_at = new Date(data.page.updated_at);
    }
}
