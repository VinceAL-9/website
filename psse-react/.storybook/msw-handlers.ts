// .storybook/msw-handlers.ts
import { http, HttpResponse } from 'msw';

export const mswHandlers = [
  // Products
  http.get('*/products', () => {
    return HttpResponse.json([
      { id: '1', name: 'PSSE Lanyard', description: 'desc', price: 150, stock: 50, category: 'lanyard', featured: true, addedDate: new Date().toISOString(), specifications: [] },
      { id: '2', name: 'PSSE T-Shirt', description: 'desc2', price: 350, stock: 20, category: 'tshirt', featured: false, addedDate: new Date().toISOString(), specifications: [] },
    ]);
  }),
  
  // Events
  http.get('*/events', () => {
    return HttpResponse.json([
      { id: '1', title: 'PSSE Tech Talk', description: 'A great tech talk', date: new Date().toISOString(), location: 'Zoom', image: 'https://placehold.co/400', isUpcoming: true, topics: ['Tech'] },
    ]);
  }),
  
  // Officers
  http.get('*/officers', () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe', position: 'President', program: 'BS SE', currentYear: 4, bio: 'Hello', isFormer: false },
    ]);
  }),
  
  // Orders
  http.get('*/orders', () => HttpResponse.json([])),
  http.get('*/orders/mine', () => HttpResponse.json([])),
  
  // Auth
  http.get('*/auth/profile', () => HttpResponse.json({ id: '1', name: 'Jane Doe', email: 'jane@example.com', role: 'USER', isVerified: true })),
  http.post('*/auth/login', () => HttpResponse.json({ access_token: 'token', user: { id: '1', name: 'Jane Doe', email: 'jane@example.com', role: 'USER', isVerified: true } })),
  http.post('*/auth/register', () => HttpResponse.json({})),
];
