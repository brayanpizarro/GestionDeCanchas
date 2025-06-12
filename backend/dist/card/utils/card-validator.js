"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCard = validateCard;
function validateCard(card) {
    const errors = [];
    const luhnCheck = (num) => {
        let sum = 0;
        let shouldDouble = false;
        for (let i = num.length - 1; i >= 0; i--) {
            let digit = parseInt(num[i]);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9)
                    digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    };
    if (!/^\d{13,19}$/.test(card.cardNumber) || !luhnCheck(card.cardNumber)) {
        errors.push('Número de tarjeta inválido');
    }
    const now = new Date();
    const expiry = new Date(card.expiryYear, card.expiryMonth - 1);
    if (expiry < now) {
        errors.push('La tarjeta está vencida');
    }
    if (!/^\d{3,4}$/.test(card.cvv)) {
        errors.push('CVV inválido');
    }
    return errors;
}
//# sourceMappingURL=card-validator.js.map