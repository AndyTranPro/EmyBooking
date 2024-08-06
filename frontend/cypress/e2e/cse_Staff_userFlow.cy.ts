describe('e2e for cse_Staff', () => {
  it('login and make a booking', () => {
    // Visit the login page
    cy.visit('/login')

    // Fill in the email and password fields
    cy.get('input[name=email]').focus().type('aooif@unsw.edu.au')
    // login as cse staff
    cy.get('[data-testid="loginBtn"]').should('be.visible').click()
    // go to next day
    cy.get('[data-testid="dateForward"]').should('be.visible').click()
    // click on the first cell of first colomn on time table
    cy.get('button[admin_id]').first().click({ force: true });
    // put in a title
    cy.get('input[name=title]').focus().type('meeting')
    // comfirm to make the booking
    cy.contains('button', 'Confirm').click();
    // open filter
    cy.get('button[class="filter-button"]').first().click();
    // open types accordion
    cy.get('[data-testid="types"]').click();
    // select meeting rooms
    cy.contains('span', 'meeting room').click();
    // open timespan accordion
    cy.get('[data-testid="timespan"]').click();
    // put start time 8:00 AM
    cy.get('input[type="time"]').first().focus().type('08:00');
    // set endtime 11:30 AM
    cy.get('input[type="time"]').eq(1).focus().type('11:30');
    // apply filter
    cy.get('.css-lll1vm-MuiButtonBase-root-MuiButton-root').first().click();
    // change to lv4
    cy.get('#demo-simple-select').click();
    cy.get('li[data-value="4"]').click();
    // go to next day
    cy.get('[data-testid="dateForward"]').should('be.visible').click()
    // reset filter
    cy.get('button[class="filter-button"]').eq(1).click();
    // goto lv2
    cy.get('#demo-simple-select').click();
    cy.get('li[data-value="2"]').click();
    // go to prev day
    cy.get('[data-testid="dateBack"]').should('be.visible').click()
    //click booking
    cy.contains('button', 'aooif').click();
    // click delete
    cy.get('.css-1pe4mpk-MuiButtonBase-root-MuiIconButton-root').eq(1).should('be.visible').click();
    // Click on confirm
    cy.get('.css-1knaqv7-MuiButtonBase-root-MuiButton-root').should('be.visible').first().click();
  })
})