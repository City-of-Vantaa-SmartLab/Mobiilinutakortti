export class LogBookViewModel {
  clubName: string;
  statistics: LogBookStatistics[];

  constructor(clubName: string, byGenderAndAge: GroupedAggregate) {
    this.clubName = clubName;
    this.statistics = Object.entries(byGenderAndAge).map(([gender, ranges]) => {
      const count = Array.from(ranges.values()).reduce(
        (sum, value) => sum + value,
      );
      const keys = Array.from(ranges.keys());
      const ageRanges = keys.map(ageRange => ({
        ageRange,
        count: ranges.get(ageRange),
      }));

      return {
        gender,
        count,
        ageRanges,
      };
    });
  }
}

interface LogBookStatistics {
  gender: string;
  count: number;
  ageRanges: {
    ageRange: string;
    count: number;
  }[];
}

interface GroupedAggregate {
  [key: string]: Map<string, number>;
}
