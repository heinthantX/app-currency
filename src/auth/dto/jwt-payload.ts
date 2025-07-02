export interface JWTPayload {
  data: string;
}

export interface JWTPayloadData {
  id?: string;
  applicationId?: string;
  type: JWTPayloadType;
}

export enum JWTPayloadType {
  USER = 'USER',
  APPLICATION = 'APPLICATION',
}
