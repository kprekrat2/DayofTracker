
import type { DayOffRequest, Holiday, User, YearStats } from "@/types";
import {
  eachDayOfInterval,
  endOfYear,
  format,
  isWeekend,
  max as dateMax,
  min as dateMin,
  startOfYear,
} from 'date-fns';

export function countBusinessDays(startDate: Date, endDate: Date, holidays: Holiday[]): number {
  if (startDate > endDate) return 0;
  let count = 0;
  const holidayDates = holidays.map(h => format(h.date, 'yyyy-MM-dd'));
  const interval = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of interval) {
    if (!isWeekend(day) && !holidayDates.includes(format(day, 'yyyy-MM-dd'))) {
      count++;
    }
  }
  return count;
}

export function calculateUserYearStats(
  year: number,
  user: User,
  allUserRequests: DayOffRequest[],
  holidays: Holiday[]
): YearStats {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));

  let spentVacationBusinessDays = 0;
  let spentAdditionalBusinessDays = 0;
  let requestedVacationBusinessDays = 0;
  let requestedAdditionalBusinessDays = 0;

  allUserRequests.forEach((req) => {
    // Ensure req.startDate and req.endDate are Date objects
    const reqStartDate = new Date(req.startDate);
    const reqEndDate = new Date(req.endDate);

    const overlapStart = dateMax([reqStartDate, yearStart]);
    const overlapEnd = dateMin([reqEndDate, yearEnd]);

    if (overlapStart <= overlapEnd) {
      const businessDaysInOverlap = countBusinessDays(overlapStart, overlapEnd, holidays);
      const type = req.requestType || "vacation";

      if (req.status === "approved") {
        if (type === "vacation") {
          spentVacationBusinessDays += businessDaysInOverlap;
        } else if (type === "additional") {
          spentAdditionalBusinessDays += businessDaysInOverlap;
        }
      }

      if (req.status === "approved" || req.status === "pending") {
        if (type === "vacation") {
          requestedVacationBusinessDays += businessDaysInOverlap;
        } else if (type === "additional") {
          requestedAdditionalBusinessDays += businessDaysInOverlap;
        }
      }
    }
  });

  const allocatedVacation = user.vacationDays ?? 0;
  const allocatedAdditional = user.additionalDays ?? 0;

  const totalApprovedDays = spentVacationBusinessDays + spentAdditionalBusinessDays;

  return {
    year,
    allocatedVacation,
    allocatedAdditional,
    spentVacation: spentVacationBusinessDays,
    spentAdditional: spentAdditionalBusinessDays,
    requestedVacation: requestedVacationBusinessDays,
    requestedAdditional: requestedAdditionalBusinessDays,
    remainingVacation: Math.max(0, allocatedVacation - spentVacationBusinessDays),
    remainingAdditional: Math.max(0, allocatedAdditional - spentAdditionalBusinessDays),
    totalApprovedDays,
  };
}
