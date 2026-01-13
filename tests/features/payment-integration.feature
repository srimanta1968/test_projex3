@feature_id:a33a5409-13fb-499c-9368-b2e63c4de556
@epic_id:0acf558b-ccb4-4e42-8d55-e558c38292d5
Feature: Payment Integration
  Integrate payment gateways for processing transactions.

  @scenario_id:5666d1ad-3a25-4d47-9dc7-636724320180
  @scenario_type:UI
  @ui_test
  Scenario: Successful Payment Processing
    # Scenario ID: 5666d1ad-3a25-4d47-9dc7-636724320180
    # Feature ID: a33a5409-13fb-499c-9368-b2e63c4de556
    # Scenario Type: UI
    # Description: Verify that users can successfully complete a payment transaction using the payment gateway.
    Given the user has selected a ride
    When the user enters valid payment information
    Then the payment is processed successfully
    And the user receives a confirmation message
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=a33a5409-13fb-499c-9368-b2e63c4de556, scenario_id=5666d1ad-3a25-4d47-9dc7-636724320180, type=UI

  @scenario_id:7edba17d-ee1c-4cec-b8c0-975ee616ec18
  @scenario_type:UI
  @ui_test
  Scenario: Failed Payment Transaction
    # Scenario ID: 7edba17d-ee1c-4cec-b8c0-975ee616ec18
    # Feature ID: a33a5409-13fb-499c-9368-b2e63c4de556
    # Scenario Type: UI
    # Description: Verify that the system handles failed payment transactions gracefully.
    Given the user has selected a ride
    When the user enters invalid payment information
    Then the payment fails
    And the user sees an error message
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=a33a5409-13fb-499c-9368-b2e63c4de556, scenario_id=7edba17d-ee1c-4cec-b8c0-975ee616ec18, type=UI

  @scenario_id:3dfa2208-44bd-4d95-83b5-24e6269de624
  @scenario_type:UI
  @ui_test
  Scenario: Payment Gateway Selection
    # Scenario ID: 3dfa2208-44bd-4d95-83b5-24e6269de624
    # Feature ID: a33a5409-13fb-499c-9368-b2e63c4de556
    # Scenario Type: UI
    # Description: Ensure the user can select different payment gateways for transactions.
    Given the user is on the payment page
    When the user selects a payment gateway
    Then the selected payment gateway is displayed
    And the payment options are updated accordingly
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=a33a5409-13fb-499c-9368-b2e63c4de556, scenario_id=3dfa2208-44bd-4d95-83b5-24e6269de624, type=UI

  @scenario_id:d037fff6-969e-43a3-b1e7-c2fcb0f6bffd
  @scenario_type:UI
  @ui_test
  Scenario: Payment History Retrieval
    # Scenario ID: d037fff6-969e-43a3-b1e7-c2fcb0f6bffd
    # Feature ID: a33a5409-13fb-499c-9368-b2e63c4de556
    # Scenario Type: UI
    # Description: Verify that users can view their payment history after transactions are made.
    Given the user has completed one or more transactions
    When the user navigates to the payment history section
    Then the payment history is displayed correctly
    And the user can see details of each transaction
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=a33a5409-13fb-499c-9368-b2e63c4de556, scenario_id=d037fff6-969e-43a3-b1e7-c2fcb0f6bffd, type=UI
