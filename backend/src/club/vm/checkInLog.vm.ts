import { CheckIn } from '../entities';
import { formatName } from '../../common/helpers';

export class CheckInLogViewModel {
    clubName: string;
    juniors: JuniorInformation[];

    constructor(clubName: string, checkIns: CheckIn[]) {
        this.clubName = clubName;
        this.juniors = checkIns.map(checkIn => {
            const dateTime = new Date(checkIn.checkInTime);
            let hours = dateTime.getHours().toString();
            let minutes = dateTime.getMinutes().toString();
            if (hours.length < 2) { hours = `0${hours}`; }
            if (minutes.length < 2) { minutes = `0${minutes}`; }
            return {
                name: formatName(checkIn.junior.firstName, checkIn.junior.lastName, checkIn.junior.nickName),
                id: checkIn.junior.id,
                time: `${hours}:${minutes}`,
            } as JuniorInformation;
        });
    }
}

interface JuniorInformation {
    id: string;
    name: string;
    time: string;
}
