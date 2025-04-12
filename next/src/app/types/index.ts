export interface Cause {
    id: number;
    title: string;
    description: string;
    goal: number;
    raised: number;
    donations: number;
    imageUrl: string;
    category: string;
}

export enum CauseCategory {
    NATURAL_DISASTER = 'Natural Disasters',
    CONFLICT_ZONE = 'Conflict Zone',
    HEALTH_EMERGENCY = 'Health Emergencies',
    FOOD_WATER_CRISIS = 'Food & Water Crisis'
}

export interface CategoryInfo {
    title: string;
    icon: string;
    description: string;
}