export type Channel = {
    id: number;
    ownerId: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
}