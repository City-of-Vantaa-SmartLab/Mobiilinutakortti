import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

// NB: as this "database" is now kept only in memory, in case of multiple instances for backend, it might not work as intended.
// The point of this services is that sometimes the frontend sends multiple requests at the same time, or there might be race conditions. One of the requests might refresh the auth token, in which case the others would fail and result in a re-login. Therefore we must store multiple tokens at a time. The number, maxSessions, is arbitrary in a way: the less the more secure, as long as frontend works correctly.

type Session = {
  ownerId: string,
  authTokens: string[]
}

@Injectable()
export class SessionDBService {
  private readonly maxSessions = 5;
  private readonly sessions: Session[];
  private readonly logger = new Logger('SessionDB Service');

  constructor() {
    this.sessions = [];
  }

  // Reset sessions every night at 4 AM
  @Cron('0 4 * * *')
  reset(): void {
    this.sessions.splice(0, this.sessions.length);
    this.logger.log('Cleared session DB.');
  }

  checkValidity(ownerId: string, authToken: string): boolean {
    const valid = this.sessions.findIndex(s => s.ownerId === ownerId && s.authTokens.includes(authToken)) > -1;
    if (!valid) this.logger.warn(`Session not valid for ${ownerId}`);
    return valid;
  }

  addSession(ownerId: string, authToken: string): void {
    if (this.sessions.findIndex(s => s.ownerId === ownerId) < 0) {
      this.sessions.push({ownerId, authTokens: []});
    }
    const sessionData = this.sessions.find(s => s.ownerId === ownerId);
    if (!sessionData.authTokens.includes(authToken)) {
      sessionData.authTokens.push(authToken);
      sessionData.authTokens = sessionData.authTokens.splice(-this.maxSessions, this.maxSessions);
    }
  }

  logoutUser(userId: string, automatic: boolean = false): boolean {
    const userIndex = this.sessions.findIndex(s => s.ownerId === userId);
    if (userIndex > -1) {
      this.sessions.splice(userIndex, 1);
      this.logger.log(`User ${automatic ? 'auto-' : ''}logout: ${userId}`);
      return true;
    } else {
      this.logger.warn(`Tried to ${automatic ? 'auto-' : ''}logout nonexistent session for user ${userId}`);
      return false;
    }
  }
}
