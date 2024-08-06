describe('e2e for admin', () => {
    it('login and approve a request, then delete a booking', () => {
        // Visit the login page
        cy.visit('/login')

        // Fill in the email and password fields
        cy.get('input[name=email]').focus().type('gftyu@unsw.edu.au') // replace with a valid email
        // Log in
        cy.get('[data-testid="loginBtn"]').should('be.visible').click()
        // Go forward one date
        cy.get('[data-testid="dateForward"]').should('be.visible').click()
        // Click on one date in the calendar
        cy.get('button[admin_id]').eq(1).click({ force: true });
        // Input the title
        cy.get('input[name=title]').focus().type('Dummy title');
        // Submit button should be visible, click on it
        cy.get('.css-10vjzfb-MuiButtonBase-root-MuiButton-root').should('be.visible').first().click()
        // Success notification should be visible
        cy.get('div[id="notistack-snackbar"]').should('be.visible')
        // Click on one date in the calendar
        cy.get('button[admin_id]').eq(2).click({ force: true });
        // Input the title
        cy.get('input[name=title]').focus().type('Dummy title 2');
        // Submit button should be visible, click on it
        cy.get('.css-10vjzfb-MuiButtonBase-root-MuiButton-root').should('be.visible').first().click()
        // Success notification should be visible
        cy.get('div[id="notistack-snackbar"]').should('be.visible')
        // Click on profile
        cy.get('[data-testid="AccountCircleIcon"]').should('be.visible').first().click()
        // Click on logout
        cy.get('[data-testid="logoutBtn"]').first().should('be.visible').click();

        // Login as admin
        cy.visit('/login')

        // Fill in the email and password fields as admin
        cy.get('input[name=email]').focus().type('tjfxr@unsw.edu.au') // replace with a valid email
        // Log in
        cy.get('[data-testid="loginBtn"]').should('be.visible').click()
        // Requests tab should be visible
        cy.get('[data-testid="requestBtn"]').should('be.visible').click();
        // Open the request modal
        cy.get('.css-eqpfi5-MuiAccordionSummary-content').first().click();
        // Approve modal
        cy.get('.css-ke5b6m-MuiButtonBase-root-MuiButton-root').should('be.visible').first().click()
        // Open the request modal
        cy.get('.css-eqpfi5-MuiAccordionSummary-content').first().click({ force: true });
        // Delete modal
        cy.get('.css-180lf2n-MuiButtonBase-root-MuiButton-root').should('be.visible').first().click()
        // Delete are you sure yes
        cy.get('.css-1e6y48t-MuiButtonBase-root-MuiButton-root').should('be.visible').eq(1).click()
        // View Dashboard
        cy.get('.css-m5x0z-MuiTypography-root').should('be.visible').first().click();
        // open filter
        cy.get('button[class="filter-button"]').first().click();
        // open types accordion
        cy.get('[data-testid="types"]').click();
        // select meeting rooms
        cy.contains('span', 'meeting room').click();
        // confirm filter
        cy.get('.css-lll1vm-MuiButtonBase-root-MuiButton-root').first().click();
        // Go forward one date
        cy.get('[data-testid="dateForward"]').should('be.visible').click()
        // Click on the event
        cy.get('.css-llvhl4-MuiTypography-root').should('be.visible').click();
        // Click on the delete
        cy.get('.css-1pe4mpk-MuiButtonBase-root-MuiIconButton-root').eq(1).should('be.visible').click();
        // Click on confirm
        cy.get('.css-1knaqv7-MuiButtonBase-root-MuiButton-root').should('be.visible').first().click();
    })
})