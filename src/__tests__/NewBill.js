/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import mockedBills from "../__mocks__/store.js"

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Simuler un user connecté
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee",
      email: "employee@test.com"
    }));
    // Setup du DOM
    document.body.innerHTML = NewBillUI();
  });

  describe("When I am on NewBill Page", () => {
    test("Then it should update the file name in the input", async () => {
      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const file = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });
      const fileInput = screen.getByTestId("file"); // Assurer que cela est bien défini

      fireEvent.change(fileInput, {
        target: { files: [file] }
      });

      await waitFor(() => {
        expect(fileInput.files[0].name).toBe("test.jpg");
        expect(newBill.fileName).toBe("test.jpg");
      });
    });

    test("Then it should not update fileUrl and fileName with an invalid file type", async () => {
      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const badFile = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
      const fileInput = screen.getByTestId("file");

      // Mock de l'alert
      window.alert = jest.fn();

      fireEvent.change(fileInput, {
        target: { files: [badFile] }
      });

      expect(window.alert).toHaveBeenCalled();
      expect(newBill.fileName).toBeNull();
      expect(newBill.fileUrl).toBeNull();
    });

    test("Then it should call store.bills().update and navigate to Bills page on form submit", async () => {
    const onNavigate = jest.fn()
    const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

    // Espionner la méthode update
    const updateSpy = jest.spyOn(mockStore.bills(), 'update')

    // Simuler un fichier uploadé
    newBill.fileName = "test.jpg"
    newBill.fileUrl = "https://localhost/test.jpg"

    // Récupérer les données du mock
    const billData = (await mockStore.bills().list())[0]

    // Remplir le formulaire avec les valeurs mockées
    fireEvent.change(screen.getByTestId("expense-type"), { target: { value: billData.type } })
    fireEvent.change(screen.getByTestId("expense-name"), { target: { value: billData.name } })
    fireEvent.change(screen.getByTestId("datepicker"), { target: { value: billData.date } })
    fireEvent.change(screen.getByTestId("amount"), { target: { value: billData.amount } })
    fireEvent.change(screen.getByTestId("vat"), { target: { value: billData.vat } })
    fireEvent.change(screen.getByTestId("pct"), { target: { value: billData.pct } })
    fireEvent.change(screen.getByTestId("commentary"), { target: { value: billData.commentary } })

    const form = screen.getByTestId("form-new-bill");

    fireEvent.submit(form)

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledWith('#employee/bills')
    })
  })
    
    
  });
});
