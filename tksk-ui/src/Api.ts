
export type UserAccount = {
  id: number;
  firstName: string;
  firstNamePhonetic: string;
  lastName: string;
  lastNamePhonetic: string;
  email: string;
  phoneNumber: string;
  registeredAt: string;
}; 

export async function fetchUserAccounts() {
  const res = await fetch('http://localhost:3001/account');
  if (!res.ok) {
    throw new Error('Failed to fetch user accounts');
  } 
  return res;
}