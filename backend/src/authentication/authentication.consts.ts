export const saltRounds = 10;
export const jwt = {
    secret: process.env.NODE_ENV === 'production' ? process.env.JWT : 'Remember to make me more secure before prod!',
    expiry: `7d`,
};
