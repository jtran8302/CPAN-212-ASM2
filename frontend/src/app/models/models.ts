// TypeScript interfaces — shared across all Angular components
// anyone can import these, no one "owns" them exclusively
// add new interfaces here as needed

export interface UserDto {
    _id: string;
    fullName: string;
    email: string;
    role: 'resident' | 'provider';
    createdAt: string;
}

export interface CategoryDto {
    _id: string;
    name: string;
    description?: string;
}

export interface ServiceRequestDto {
    _id: string;
    title: string;
    description: string;
    categoryId: CategoryDto | string;
    createdBy: UserDto | string;
    location: string;
    status: 'open' | 'quoted' | 'assigned' | 'completed' | 'cancelled';
    acceptedQuoteId?: string;
    createdAt: string;
}

export interface QuoteDto {
    _id: string;
    requestId: string;
    providerId: UserDto | string;
    price: number;
    message: string;
    daysToComplete: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}
