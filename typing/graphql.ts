
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum OrderBy {
    asc = "asc",
    desc = "desc"
}

export class FindAllInput {
    page?: Nullable<number>;
    limit?: Nullable<number>;
    orderBy: OrderBy;
}

export abstract class IQuery {
    abstract _empty(): Nullable<string> | Promise<Nullable<string>>;
}

export type DateTime = any;
export type Json = any;
export type PhoneNumber = any;
export type LocalTime = any;
type Nullable<T> = T | null;
