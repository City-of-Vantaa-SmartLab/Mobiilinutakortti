import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

// NB: as this "database" is now kept only in memory, in case of multiple instances for backend, it might not work as intended.
// The point of a spam guard is to prevent people from flooding check-ins, sending SMSs etc. All the limits set here are arbitrary and should be loose enough not to bother normal usage.

enum SpamGuardContext {
  LoginLinkMinInterval,
  LoginLinkMaxCount,
  CheckInMinInterval,
  CheckInMaxCount,
  EventCheckIn
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

type SecurityCode = {
  id: number,
  code: string
}

const maxContextCounters: SpamGuardContextLimit = {
  [SpamGuardContext.LoginLinkMinInterval]: 10*60000, // 10 minutes minimum time between login link SMSs
  [SpamGuardContext.LoginLinkMaxCount]: 3, // Max login link SMSs a day
  [SpamGuardContext.CheckInMinInterval]: 120*60000, // 120 minutes minimum time between check-ins
  [SpamGuardContext.CheckInMaxCount]: 3, // Max check-ins a day
  [SpamGuardContext.EventCheckIn]: 1 // Allowed event check-ins a day
};

// How many security check-in codes *per club* can there be at the same time before old ones are removed.
// Every time a youth worker opens up the check-in QR code reader, a new code is generated.
// The point of security codes is to prevent people from generating random check-ins from their home couch.
const maxSecurityCodes = 3;

@Injectable()
export class SpamGuardService {
  private readonly logger = new Logger('SpamGuard Service');
  private readonly items: SpamGuardItem[];
  private readonly securityCodes: SecurityCode[];

  constructor() {
    this.items = [];
    this.securityCodes = [];
  }

  // Reset spam guard items, i.e. what affects juniors.
  reset(userId: string | null): number {
    const count = this.items.length;
    this.items.splice(0, this.items.length);
    this.logger.log(`User ${userId} cleared ${count} items.`);
    return count;
  }

  // Reset all spam guard stuff at 4 AM.
  // This also includes club check-in security codes.
  @Cron('0 4 * * *')
  resetAll(): void {
    this.logger.log(`Clearing ${this.items.length} items, ${this.securityCodes.length} codes.`);
    this.items.splice(0, this.items.length);
    this.securityCodes.splice(0, this.securityCodes.length);
  }

  // Check if junior can check in to a club.
  // Returns true if everything OK, false if not.
  checkIn(juniorId: string, targetId: number, targetIsEvent: boolean = false): boolean {
    const uuidRegEx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!juniorId.match(uuidRegEx)) {
      this.logger.log(`Check-in failed with invalid junior UUID; ${targetIsEvent ? 'eventId' : 'clubId'}: ${targetId}, juniorId: ${juniorId}`);
      return false;
    }

    // In case of an event check in, only duplicate check-in makes sense.
    if (targetIsEvent) {
      if (!this.addItemWithCount(juniorId, SpamGuardContext.EventCheckIn, targetId)) {
        this.logger.debug({ juniorId }, 'Duplicate check-in.');
        return false;
      }
      return true;
    }

    if (!this.addItemWithInterval(juniorId, SpamGuardContext.CheckInMinInterval, targetId)) {
      this.logger.debug({ juniorId }, 'Duplicate check-in.');
      return false;
    }
    if (!this.addItemWithCount(juniorId, SpamGuardContext.CheckInMaxCount)) {
      this.logger.debug({ juniorId }, 'Max check-in count reached.');
      return false;
    }
    return true;
  }

  // Check if junior can ask for SMS login links.
  // Returns true if everything OK, false if not.
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

  // Generate and return a new security code for club check-in (the QR reader view).
  getSecurityCode(clubId: number): string {
    if (this.securityCodes.filter(sc => sc.id == clubId).length == maxSecurityCodes) {
      this.logger.verbose('Expiring a security code for club: ' + clubId);
      this.securityCodes.splice(this.securityCodes.findIndex(sc => sc.id == clubId), 1);
    }
    const code = Math.random().toString(36).substring(2, 12);
    this.securityCodes.push({id: clubId, code});
    this.logger.verbose(`Added new security code for club ${clubId}: ${code}`);
    return code;
  }

  // Checks if club check-in code is valid (exists in spam guard code list). Returns true if valid, false if not.
  checkSecurityCode(clubId: number, code: string): boolean {
    const found = this.securityCodes.some(sc => sc.id == clubId && sc.code == code);
    if (!found) this.logger.debug('Check security code failed for club: ' + clubId);
    return found;
  }

  private addItemWithInterval(uuid: string, context: SpamGuardContext, contextId: number | null = null): boolean {
    const item = this.items.find(i =>
      i.uuid === uuid && i.context === context && i.contextId === contextId
    );

    const now = Date.now();
    if (item && now - item.counter < maxContextCounters[context]) return false;

    if (item) this.items.splice(this.items.indexOf(item), 1);
    this.items.push({uuid, context, contextId, counter: now});

    return true;
  }

  private addItemWithCount(uuid: string, context: SpamGuardContext, contextId: number | null = null): boolean {
    const item = this.items.find(i =>
      i.uuid === uuid && i.context === context && i.contextId === contextId
    );

    if (item) {
      if (item.counter >= maxContextCounters[context]) return false;
      item.counter++;
    } else {
      this.items.push({uuid, context, contextId, counter: 1});
    }

    return true;
  }

}
