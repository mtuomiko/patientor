export interface Diagnosis {
  code: string;
  name: string;
  latin?: string;
}

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

export interface Patient {
  id: string;
  name: string;
  occupation: string;
  gender: Gender;
  ssn?: string;
  dateOfBirth?: string;
  entries: Entry[];
}

export interface BaseEntry {
  id: string;
  description: string;
  date: string;
  specialist: string;
  diagnosisCodes?: Array<Diagnosis['code']>;
}

export interface HospitalEntry extends BaseEntry {
  type: "Hospital";
  discharge: {
    date: string;
    criteria: string;
  };
}

export interface OccupationalHealthcareEntry extends BaseEntry {
  type: "OccupationalHealthcare";
  employerName: string;
  sickLeave?: {
    startDate: string;
    endDate: string;
  };
}

export enum HealthCheckRating {
  "Healthy" = 0,
  "LowRisk" = 1,
  "HighRisk" = 2,
  "CriticalRisk" = 3,
}

export interface HealthCheckEntry extends BaseEntry {
  type: "HealthCheck";
  healthCheckRating: HealthCheckRating;
}

export type Entry =
  HospitalEntry
  | OccupationalHealthcareEntry
  | HealthCheckEntry;

// Distributive Omit https://stackoverflow.com/a/57103940
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/*
  Trial code
*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export type DistributiveOverride<T, K extends PropertyKey> = T extends any
//   ? Omit<T, K> & {
//     K: "Hospital"
//     | "OccupationalHealthcare"
//     | "HealthCheck"
//     | undefined;
//   }
//   : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export type DistributiveTypeOverride<T> = { type: any } extends T
//   ? Omit<T, "type"> & {
//     type: FormEntryTypes;
//   }
//   : T;