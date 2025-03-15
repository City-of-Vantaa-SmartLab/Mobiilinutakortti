import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

// NB: as this "database" is now kept only in memory, in case of multiple instances for backend, it might not work as intended.
// The point of a spam guard is to prevent people from flooding check-ins, sending SMSs etc. All the limits set here are arbitrary and should be loose enough not to bother normal usage.

export enum SpamGuardContext {
  LoginLinkMinInterval,
  LoginLinkMaxCount,
  CheckInMinInterval,
  CheckInMaxCount
}

type SpamGuardContextLimit = {
  [key in SpamGuardContext]: number
}

type SpamGuardItem = {
  uuid: string,
  context: SpamGuardContext,
  contextId: number | null,
  counter: number
}

@Injectable()
export class SpamGuardService {
  private readonly items: SpamGuardItem[];
  private readonly logger = new Logger('SpamGuard Service');
  private readonly maxContextCounters: SpamGuardContextLimit = {
    [SpamGuardContext.LoginLinkMinInterval]: 10*60000, // 10 minutes minimum time between login link SMSs
    [SpamGuardContext.LoginLinkMaxCount]: 3, // Max login link SMSs a day
    [SpamGuardContext.CheckInMinInterval]: 120*60000, // 120 minutes minimum time between check-ins
    [SpamGuardContext.CheckInMaxCount]: 3 // Max check-ins a day
  };

  constructor() {
    this.items = [];
  }

  // Reset spam guard tables at 4 AM
  @Cron('0 4 * * *')
  reset(userId: string | null): number {
    const count = this.items.length;
    this.items.splice(0, this.items.length);
    this.logger.log(`Cleared ${count} spam guard items by ${userId ? ('user ' + userId) : 'automation'}.`);
    return count;
  }

  // Returns true if everything OK, false if not.
  checkIn(juniorId: string, clubId: number): boolean {
    const uuidRegEx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!juniorId.match(uuidRegEx)) {
      this.logger.log('Check-in failed with invalid junior UUID; clubId: ' + clubId + ', juniorId: ' + juniorId);
      return false;
    }

    if (!this.addItemWithInterval(juniorId, SpamGuardContext.CheckInMinInterval, clubId)) {
      this.logger.debug({ juniorId }, 'Duplicate check-in.');
      return false;
    }
    if (!this.addItemWithCount(juniorId, SpamGuardContext.CheckInMaxCount)) {
      this.logger.debug({ juniorId }, 'Max check-in count reached.');
      return false;
    }
    return true;
  }

  loginLink(juniorId: string): boolean {
    let success = true;
    success &&= this.addItemWithInterval(juniorId, SpamGuardContext.LoginLinkMinInterval);
    success &&= this.addItemWithCount(juniorId, SpamGuardContext.LoginLinkMaxCount);
    if (!success) {
      this.logger.verbose({ juniorId }, 'SMS login link throttled.');
      return false;
    }
    return true;
  }

  private addItemWithInterval(uuid: string, context: SpamGuardContext, contextId: number | null = null): boolean {
    const item = this.items.find(i =>
      i.uuid === uuid && i.context === context && i.contextId === contextId
    );

    const now = Date.now();
    if (item && now - item.counter < this.maxContextCounters[context]) return false;

    if (item) this.items.splice(this.items.indexOf(item), 1);
    this.items.push({uuid, context, contextId, counter: now});

    return true;
  }

  private addItemWithCount(uuid: string, context: SpamGuardContext, contextId: number | null = null): boolean {
    const item = this.items.find(i =>
      i.uuid === uuid && i.context === context && i.contextId === contextId
    );

    if (item) {
      if (item.counter >= this.maxContextCounters[context]) return false;
      item.counter++;
    } else {
      this.items.push({uuid, context, contextId, counter: 1});
    }

    return true;
  }

}
