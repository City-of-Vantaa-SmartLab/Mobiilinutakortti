
export const validatePhone = (number: string) => {
    if (number.match(/(^(\+358|0)\d{9})/)) {
        return true;
    }
    return false;
}
