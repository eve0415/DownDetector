import axios from 'axios';
import { Page } from './interfaces';

export class Util {
    public static async isValidId(id: string): Promise<boolean> {
        try {
            const result = await axios.get(`https://${id}.statuspage.io/api/v2/summary.json`);
            if (result.status === 200) return Promise.resolve(true);
            if (result.status.toString().startsWith('5')) return Promise.reject(new Error('Server Error'));
            return Promise.resolve(false);
        } catch (e) {
            return false;
        }
    }

    public static async getServiceName(id: string): Promise<string> {
        const result = await axios.get<Page>(`https://${id}.statuspage.io/api/v2/summary.json`);
        return result.data.name;
    }
}
