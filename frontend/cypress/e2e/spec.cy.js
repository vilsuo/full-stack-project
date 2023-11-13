describe('template spec', function() {
  it('can view homepage', function() {
    cy.visit('http://localhost:5173/')
    cy.contains('Public Content')
  })
})