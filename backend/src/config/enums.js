// app-wide configuration
// keeps all enums and constants in one place
// import ENUMS anywhere you need to validate role or status values

export const ENUMS = {
    ROLES:           ['resident', 'provider'],
    REQUEST_STATUSES: ['open', 'quoted', 'assigned', 'completed', 'cancelled'],
    QUOTE_STATUSES:   ['pending', 'accepted', 'rejected'],
};
