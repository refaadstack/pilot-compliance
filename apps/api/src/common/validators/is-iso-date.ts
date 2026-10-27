import { registerDecorator, ValidationOptions } from 'class-validator';
import { isValidIsoDate } from '../date.util';

/** Accepts only real calendar dates written as YYYY-MM-DD (rejects 2026-02-31). */
export function IsIsoDate(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isIsoDate',
      target: target.constructor,
      propertyName: String(propertyName),
      options: {
        message: ({ property }) => `${property} must be a valid calendar date in YYYY-MM-DD format`,
        ...options,
      },
      validator: {
        validate: (value: unknown) => typeof value === 'string' && isValidIsoDate(value),
      },
    });
  };
}
