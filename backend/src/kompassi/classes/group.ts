import { ActivityType, AgeGroup, GroupType, OnlineChannel, Staff, UserInfo } from "./";

export class Group {
    groupId: number;
    organisationId: number;
    groupName: string;
    groupStatus: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    groupDescription: string | null;
    startTime: string | null;
    endTime: string | null;
    needs: string | null;
    goals: string | null;
    plannedOutcome: string | null;
    partners: string | null;
    groupType: GroupType;
    activityTypes: ActivityType[];
    onlineChannels: OnlineChannel[];
    ageGroups: AgeGroup[] | null;
    groupAdmins: UserInfo[] | null;
    groupEmployees: Staff[] | null;
}
