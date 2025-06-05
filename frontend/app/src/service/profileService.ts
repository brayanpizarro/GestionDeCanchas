const API_URL = 'http://localhost:3001/api/v1/auth';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getUserCards = async () => {
    const res = await fetch(`${API_URL}/user/cards`, {
        headers: getAuthHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener tarjetas');
    return data;
};

export const addUserCard = async (cardData: any) => {
    const res = await fetch(`${API_URL}/user/cards`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cardData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al agregar tarjeta');
    return data;
};

export const topUpBalance = async (amount: number, cardId: string) => {
    const res = await fetch(`${API_URL}/user/topup`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, cardId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al recargar saldo');
    return data;
};

export const getUserReservations = async () => {
    const res = await fetch(`${API_URL}/reservations`, {
        headers: getAuthHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener reservaciones');
    return data;
};