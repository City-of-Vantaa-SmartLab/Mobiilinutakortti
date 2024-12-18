import { ParticipantCount, OnlineParticipantCount, ActivityType, Staff, Observation } from './';

export class Activity {
    activityId: number;
    organisationId: number;
    groupId: number;
    activityTitle: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    activityStatus: string | null;
    startAt: string | null;
    endAt: string | null;
    notes: string | null;
    activityTypes: ActivityType[] | null;
    totalParticipants: number | null;
    participantCounts: ParticipantCount[] | null;
    totalOnlineParticipants: OnlineParticipantCount[] | null;
    onlineParticipantCounts: number | null;
    staff: Staff[] | null;
    averageFeedbackRating: string | null;
    youthOrganisedTime: number | null;
    activityNotes: string | null;
    notesCleaned: string | null;
    observations: Observation[] | null;
}
