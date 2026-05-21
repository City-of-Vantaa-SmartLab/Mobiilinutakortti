export class CheckInStatsViewModel {
  clubName: string;
  statistics: CheckInStatistics[];

  constructor(clubName: string, byGenderAndAge: GroupedAggregate) {
    this.clubName = clubName;
    this.statistics = Object.entries(byGenderAndAge).map(([gender, ranges]) => {
      const count = Array.from(ranges.values()).reduce(
        (sum, value) => sum + value,
      );
      const ageRanges = Array.from(ranges.entries()).map(([ageRange, count]) => ({
        ageRange,
        count,
      }));

      return {
        gender,
        count,
        ageRanges,
      };
    });
  }
}

interface CheckInStatistics {
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
