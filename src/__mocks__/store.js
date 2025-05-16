// __mocks__/store.js

export const mockUpdate = jest.fn((bill) => 
  Promise.resolve({
    ...bill,
    id: "47qAXb6fIm2zOKkLzMro",
    fileUrl: "https://localhost:3456/images/test.jpg",
  })
);

const mockedBills = {
  list: jest.fn().mockResolvedValue([{
    "id": "47qAXb6fIm2zOKkLzMro",
    "vat": "80",
    "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
    "status": "pending",
    "type": "Hôtel et logement",
    "commentary": "séminaire billed",
    "name": "encore",
    "fileName": "preview-facture-free-201801-pdf-1.jpg",
    "date": "2004-04-04",
    "amount": 400,
    "commentAdmin": "ok",
    "email": "a@a",
    "pct": 20
  }]),

  create: jest.fn().mockResolvedValue({ fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234' }),

  update: mockUpdate, // Simule la méthode update avec la fonction mockée

};

const mockStore = {
  bills: jest.fn().mockReturnValue(mockedBills), // Bills renvoie les méthodes mockées
};

export default mockStore;
