import { CheckIn } from '../entities';

export class LogBookCheckInsViewModel {

    juniors: JuniorInformation[];

    constructor(checkIns: CheckIn[]) {
        this.juniors = checkIns.map(checkIn => {
            const dateTime = new Date(checkIn.timestamp);
            console.log(dateTime.toLocaleTimeString());
            let minutes = dateTime.getMinutes().toString();
            if (minutes.length < 2) { minutes = `0${minutes}`; }
            return {
                name: `${checkIn.junior.firstName} ${checkIn.junior.lastName}`,
                id: checkIn.junior.id,
                time: `${dateTime.getHours().toString()}:${minutes}`,
            } as JuniorInformation;
        });
    }
}

interface JuniorInformation {
    id: string;
    name: string;
    time: string;
}
