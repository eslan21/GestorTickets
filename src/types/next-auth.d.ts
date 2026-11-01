// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    groupIds: string[];
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      groupIds: string[];
      isActive: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    groupIds: string[];
    isActive: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    groupIds: string[];
    isActive: boolean;
  }
}

declare module "@auth/core/types" {
  interface User {
    id: string;
    role: Role;
    groupIds: string[];
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      groupIds: string[];
      isActive: boolean;
    } & DefaultSession["user"];
  }
}
