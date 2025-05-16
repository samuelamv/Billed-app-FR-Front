/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"//
import { ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
jest.mock("../app/store", () => mockStore)

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    
    test("Then bills should be ordered from latest to earliest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dateCells = screen.getAllByTestId("bill-date").map(td => td.innerHTML)
    
      // Si nécessaire : convertir le format en Date pour comparer
      const parseFrenchDate = (dateStr) => {
        const months = {
          'Jan.': '01',
          'Fév.': '02',
          'Mar.': '03',
          'Avr.': '04',
          'Mai': '05',
          'Juin': '06',
          'Juil.': '07',
          'Aoû.': '08',
          'Sep.': '09',
          'Oct.': '10',
          'Nov.': '11',
          'Déc.': '12'
        }
        const [day, monthFr, year] = dateStr.split(' ')
        return new Date(`20${year}-${months[monthFr]}-${day}`)
      }
    
      const datesSorted = [...dateCells].sort((a, b) => parseFrenchDate(b) - parseFrenchDate(a))
      expect(dateCells).toEqual(datesSorted)
    })
    
    test("Clicking on 'New Bill' button should navigate to NewBill page", () => {
      const onNavigate = jest.fn()
      document.body.innerHTML = BillsUI({ data: bills }) // <-- ajouter ceci
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })
      const buttonNewBill = screen.getByTestId("btn-new-bill")
      buttonNewBill.click()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
    
    
    test("Clicking on eye icon should open modal with bill image", () => {
      const billsContainer = new Bills({ document, onNavigate: jest.fn(), store: null, localStorage: window.localStorage })
      // simulate modal existing in DOM
      const modal = document.createElement("div")
      modal.setAttribute("id", "modaleFile")
      modal.classList.add("modal")
      modal.innerHTML = `<div class="modal-body"></div>`
      document.body.appendChild(modal)
    
      // simulate bill icon
      const icon = document.createElement("div")
      icon.setAttribute("data-testid", "icon-eye")
      icon.setAttribute("data-bill-url", "https://example.com/bill.jpg")
      document.body.appendChild(icon)
    
      // mock jQuery
      $.fn.modal = jest.fn()
    
      billsContainer.handleClickIconEye(icon)
    
      expect(document.querySelector(".modal-body").innerHTML).toContain("img")
      expect($.fn.modal).toHaveBeenCalledWith("show")

      // Nouvelle vérification : 
      const img = document.querySelector(".modal-body img")
      expect(img.src).toBe("https://example.com/bill.jpg")

    })

    test("getBills should return formatted bills", async () => {
      const store = {
        bills: () => ({
          list: () => Promise.resolve([
            { id: 1, date: "2023-04-10", status: "pending" },
            { id: 2, date: "2023-04-12", status: "accepted" }
          ])
        })
      }
      const billsContainer = new Bills({ document, onNavigate: jest.fn(), store, localStorage: window.localStorage })
      const result = await billsContainer.getBills()
    
      expect(result).toEqual([
        expect.objectContaining({
          date: expect.stringMatching(/\d{2} [A-Za-z]{3}\. \d{2}/),  // <-- adapte ici
          status: "En attente"
        }),
        expect.objectContaining({ status: "Accepté" })
      ])      
    })
    
    test("Then fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))

      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      })

      const bills = await billsContainer.getBills()

      expect(bills.length).toBeGreaterThan(0)
      expect(bills[0]).toHaveProperty("date")
      expect(bills[0]).toHaveProperty("status")
    })

    test("Then fetches bills from an API and fails with 404 message", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => Promise.reject(new Error("Erreur 404"))
        }
      })

      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      })

      await expect(billsContainer.getBills()).rejects.toThrow("Erreur 404")
    })

    test("Then fetches bills from an API and fails with 500 message", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => Promise.reject(new Error("Erreur 500"))
        }
      })

      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      })

      await expect(billsContainer.getBills()).rejects.toThrow("Erreur 500")
    })
  
  })
})
