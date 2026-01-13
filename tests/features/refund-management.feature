@feature_id:21f3599e-4101-4f23-9f47-a507f0eedb2a
@epic_id:0acf558b-ccb4-4e42-8d55-e558c38292d5
Feature: Refund Management
  Handle user requests for refunds and disputes.

  @scenario_id:03e032b7-14f4-4335-8d54-16cf29d41d6e
  @scenario_type:UI
  @ui_test
  Scenario: Request a Refund for a Completed Ride
    # Scenario ID: 03e032b7-14f4-4335-8d54-16cf29d41d6e
    # Feature ID: 21f3599e-4101-4f23-9f47-a507f0eedb2a
    # Scenario Type: UI
    # Description: User initiates a refund request for a completed ride due to a service issue.
    Given the user is logged into their account
    When the user navigates to the 'My Rides' section
    And the user selects a ride that they want to request a refund for
    And the user clicks on the 'Request Refund' button
    And the user provides a reason for the refund
    And the user submits the refund request
    Then the user receives a confirmation message that the refund request has been submitted
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=21f3599e-4101-4f23-9f47-a507f0eedb2a, scenario_id=03e032b7-14f4-4335-8d54-16cf29d41d6e, type=UI

  @scenario_id:e90ce75b-9871-4bf8-b2d4-454960614a00
  @scenario_type:UI
  @ui_test
  Scenario: Dispute a Charge for an Uncompleted Ride
    # Scenario ID: e90ce75b-9871-4bf8-b2d4-454960614a00
    # Feature ID: 21f3599e-4101-4f23-9f47-a507f0eedb2a
    # Scenario Type: UI
    # Description: User initiates a dispute for a charge related to a ride that was not completed.
    Given the user is logged into their account
    When the user navigates to the 'My Rides' section
    And the user selects a ride that was not completed
    And the user clicks on the 'Dispute Charge' button
    And the user provides details about the dispute
    And the user submits the dispute
    Then the user receives a notification that the dispute has been filed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=21f3599e-4101-4f23-9f47-a507f0eedb2a, scenario_id=e90ce75b-9871-4bf8-b2d4-454960614a00, type=UI

  @scenario_id:34f3b17a-7d3a-4473-8a3e-4fb6503d0932
  @scenario_type:UI
  @ui_test
  Scenario: Check Status of a Refund Request
    # Scenario ID: 34f3b17a-7d3a-4473-8a3e-4fb6503d0932
    # Feature ID: 21f3599e-4101-4f23-9f47-a507f0eedb2a
    # Scenario Type: UI
    # Description: User checks the status of a previously submitted refund request.
    Given the user is logged into their account
    When the user navigates to the 'Refund Status' section
    And the user selects the refund request they want to check
    Then the user sees the current status of the refund request
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=21f3599e-4101-4f23-9f47-a507f0eedb2a, scenario_id=34f3b17a-7d3a-4473-8a3e-4fb6503d0932, type=UI

  @scenario_id:94168cf6-3092-4ded-86bd-9d19438db04a
  @scenario_type:UI
  @ui_test
  Scenario: Cancel a Pending Refund Request
    # Scenario ID: 94168cf6-3092-4ded-86bd-9d19438db04a
    # Feature ID: 21f3599e-4101-4f23-9f47-a507f0eedb2a
    # Scenario Type: UI
    # Description: User cancels a refund request that is still pending approval.
    Given the user is logged into their account
    When the user navigates to the 'My Refunds' section
    And the user selects the pending refund request they want to cancel
    And the user clicks on the 'Cancel Request' button
    And the user confirms the cancellation
    Then the user receives a confirmation that the refund request has been canceled
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=21f3599e-4101-4f23-9f47-a507f0eedb2a, scenario_id=94168cf6-3092-4ded-86bd-9d19438db04a, type=UI
