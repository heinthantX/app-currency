
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

export class SignInInput {
    email: string;
    password: string;
}

export class FindAllInput {
    page?: Nullable<number>;
    limit?: Nullable<number>;
    orderBy: OrderBy;
}

export class ApiCredentialOutput {
    access_token: string;
}

export abstract class IMutation {
    abstract signIn(input: SignInInput): ApiCredentialOutput | Promise<ApiCredentialOutput>;

    abstract signUp(input: SignInInput): ApiCredentialOutput | Promise<ApiCredentialOutput>;
}

export abstract class IQuery {
    abstract _empty(): Nullable<string> | Promise<Nullable<string>>;
}

export type DateTime = any;
export type Json = any;
export type PhoneNumber = any;
export type LocalTime = any;
type Nullable<T> = T | null;
