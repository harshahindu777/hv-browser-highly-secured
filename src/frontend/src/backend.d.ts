import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SearchEngine {
    id: bigint;
    url: string;
    name: string;
    description: string;
}
export interface AIAssistantActivity {
    id: bigint;
    status: string;
    task: string;
    timestamp: bigint;
}
export interface AIAssistantMessage {
    id: bigint;
    content: string;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
}
export interface CRMessage {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: bigint;
    parentId: bigint;
}
export enum SecurityLevel {
    safest = "safest",
    safer = "safer",
    standard = "standard"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCRMessage(threadId: bigint, parentId: bigint, content: string): Promise<bigint>;
    addSearchEngine(name: string, url: string, description: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAssistantActivity(task: string): Promise<bigint>;
    createAssistantMessage(content: string): Promise<bigint>;
    createThread(title: string, initialMessage: string): Promise<bigint>;
    getAllAuditItems(): Promise<Array<[string, boolean]>>;
    getAllIdentityItems(): Promise<Array<[string, boolean]>>;
    getAllSearchEngines(): Promise<Array<SearchEngine>>;
    getAssistantActivities(): Promise<Array<AIAssistantActivity>>;
    getAssistantMessages(): Promise<Array<AIAssistantMessage>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSecurityLevel(): Promise<SecurityLevel>;
    getThreadMessages(threadId: bigint): Promise<Array<CRMessage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeSearchEngine(id: bigint): Promise<void>;
    resetAuditChecklist(): Promise<void>;
    resetIdentityChecklist(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAuditItem(key: string, state: boolean): Promise<void>;
    setIdentityItem(key: string, state: boolean): Promise<void>;
    setSecurityLevel(text: string): Promise<void>;
    toggleAuditItem(key: string): Promise<void>;
    toggleIdentityItem(key: string): Promise<void>;
    updateAssistantActivityStatus(activityId: bigint, status: string): Promise<void>;
}
