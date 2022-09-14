beforeEach(() => {
  cy.visit("/")
})

it("should display the title", () => {
  cy.get(".v-toolbar__content").contains("Trivy")
})

it("should contain a file input", () => {
  cy.get(".file-input").should("have.attr", "type", "file")
})

it("should display an alert that no report was loaded", () => {
  cy.get(".v-alert")
})
