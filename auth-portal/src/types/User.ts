export enum Role {
  USER = "user",
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
}

export interface User {
  username: string;
  role: Role;
}
