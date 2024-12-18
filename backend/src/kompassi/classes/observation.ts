import { UserInfo } from './';

export class Observation {
    observationId: number;
    body: string;
    resolved: boolean | null;
    activityId: number | null;
    notifyees: UserInfo[] | null;
    resolvedBy: UserInfo | null;
    createdBy: UserInfo | null;
    resolvedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
