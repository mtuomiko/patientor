import { HealthCheckRating } from "./types";

const isString = (text: unknown): text is string => {
  return typeof text === "string";
};

const isDate = (date: string): boolean => {
  return Boolean(Date.parse(date));
};

const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

export const dateValidator = (date: unknown): boolean => {
  if (!date || !isString(date) || !isDate(date)) {
    return false;
  }
  return true;
};

export const healthCheckRatingValidator = (rating: unknown): boolean => {
  return isNumber(rating) && Object.values(HealthCheckRating).includes(rating);
};

