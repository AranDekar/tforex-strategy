export interface Strategy {
    id?: string | number;
    name: string;
    description: string;
    createdTime: string;
    isActive: boolean;
    granularity: string;
    postedBy: string | number;
}
