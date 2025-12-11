@feature_id:8a747880-3d94-4c79-aa3c-9a1c83dd16e4
@epic_id:342d166e-3a53-40fc-a690-4f2dd7ab856a
Feature: Payment and Billing System
  Create a secure payment processing system for users and drivers.

  @scenario_id:99c9c592-6132-4fa0-9a21-098effcbd53a
  @scenario_type:UI
  @ui_test
  Scenario: Successful Payment Processing for Users
    # Scenario ID: 99c9c592-6132-4fa0-9a21-098effcbd53a
    # Feature ID: 8a747880-3d94-4c79-aa3c-9a1c83dd16e4
    # Scenario Type: UI
    # Description: Test the secure payment processing system for users to ensure payments are processed successfully.
    Given User is logged into their account
    When User selects a ride and proceeds to payment
    Then Payment is processed successfully and a confirmation is shown
    And User receives a notification of the successful payment
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=8a747880-3d94-4c79-aa3c-9a1c83dd16e4, scenario_id=99c9c592-6132-4fa0-9a21-098effcbd53a, type=UI

  @scenario_id:e636b7bb-d83b-46f2-9a11-a069892f5a82
  @scenario_type:UI
  @ui_test
  Scenario: Failed Payment Handling for Users
    # Scenario ID: e636b7bb-d83b-46f2-9a11-a069892f5a82
    # Feature ID: 8a747880-3d94-4c79-aa3c-9a1c83dd16e4
    # Scenario Type: UI
    # Description: Test the system's response to a failed payment attempt by users.
    Given User is logged into their account
    When User selects a ride and enters invalid payment details
    Then Payment processing fails and an error message is displayed
    And User is prompted to enter valid payment details
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=8a747880-3d94-4c79-aa3c-9a1c83dd16e4, scenario_id=e636b7bb-d83b-46f2-9a11-a069892f5a82, type=UI

  @scenario_id:0280b7c0-9121-44c8-8f8c-e1342a7ab570
  @scenario_type:API
  @api_test
  Scenario: Secure Payment Processing for Drivers
    # Scenario ID: 0280b7c0-9121-44c8-8f8c-e1342a7ab570
    # Feature ID: 8a747880-3d94-4c79-aa3c-9a1c83dd16e4
    # Scenario Type: API
    # Description: Test the secure payment processing system for drivers receiving payments.
    Given Driver is logged into their account
    When Driver completes a ride and the payment is initiated
    Then Payment is processed securely and driver receives a confirmation
    And Driver's account balance is updated accordingly
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=8a747880-3d94-4c79-aa3c-9a1c83dd16e4, scenario_id=0280b7c0-9121-44c8-8f8c-e1342a7ab570, type=API

  @scenario_id:7e28bcde-4164-4c1e-af60-7bd5497a24a1
  @scenario_type:UI
  @ui_test
  Scenario: Payment History Access for Users
    # Scenario ID: 7e28bcde-4164-4c1e-af60-7bd5497a24a1
    # Feature ID: 8a747880-3d94-4c79-aa3c-9a1c83dd16e4
    # Scenario Type: UI
    # Description: Test the functionality for users to view their payment history.
    Given User is logged into their account
    When User navigates to the payment history section
    Then User can view a list of all previous transactions
    And Each transaction shows details such as date, amount, and status
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=8a747880-3d94-4c79-aa3c-9a1c83dd16e4, scenario_id=7e28bcde-4164-4c1e-af60-7bd5497a24a1, type=UI
