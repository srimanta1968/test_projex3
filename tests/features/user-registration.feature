@feature_id:8919ae52-9022-4855-bd43-b1e49a80a2d6
@epic_id:32a98f90-f38a-4441-acd6-b39e38e260d8
Feature: User Registration
  Allow users to create and manage their accounts.

  @scenario_id:c1130f5d-7718-49a2-b316-a56725682375
  @scenario_type:UI
  @ui_test
  Scenario: Successful User Registration
    # Scenario ID: c1130f5d-7718-49a2-b316-a56725682375
    # Feature ID: 8919ae52-9022-4855-bd43-b1e49a80a2d6
    # Scenario Type: UI
    # Description: Test the successful registration of a user account.
    Given The user is on the registration page
    When The user enters valid information in all required fields
    Then The user should receive a confirmation message
    And The user is redirected to the login page
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=8919ae52-9022-4855-bd43-b1e49a80a2d6, scenario_id=c1130f5d-7718-49a2-b316-a56725682375, type=UI

  @scenario_id:fe7763b6-6b23-498c-9480-82186e9ab3de
  @scenario_type:UI
  @ui_test
  Scenario: User Registration with Missing Information
    # Scenario ID: fe7763b6-6b23-498c-9480-82186e9ab3de
    # Feature ID: 8919ae52-9022-4855-bd43-b1e49a80a2d6
    # Scenario Type: UI
    # Description: Test the behavior when required information is missing during registration.
    Given The user is on the registration page
    When The user submits the registration form without filling in all required fields
    Then The user should see an error message indicating the missing fields
    And The user remains on the registration page
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=8919ae52-9022-4855-bd43-b1e49a80a2d6, scenario_id=fe7763b6-6b23-498c-9480-82186e9ab3de, type=UI

  @scenario_id:65afed33-fba0-4471-b451-97dcc56bf7fa
  @scenario_type:UI
  @ui_test
  Scenario: User Registration with Invalid Email
    # Scenario ID: 65afed33-fba0-4471-b451-97dcc56bf7fa
    # Feature ID: 8919ae52-9022-4855-bd43-b1e49a80a2d6
    # Scenario Type: UI
    # Description: Test the registration process with an invalid email format.
    Given The user is on the registration page
    When The user enters an invalid email address
    And The user fills in other required fields with valid information
    Then The user should see an error message for the invalid email format
    And The user remains on the registration page
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=8919ae52-9022-4855-bd43-b1e49a80a2d6, scenario_id=65afed33-fba0-4471-b451-97dcc56bf7fa, type=UI

  @scenario_id:b53f9927-0682-4abd-a7f7-ae1b74ed2f6c
  @scenario_type:UI
  @ui_test
  Scenario: User Registration Password Requirements
    # Scenario ID: b53f9927-0682-4abd-a7f7-ae1b74ed2f6c
    # Feature ID: 8919ae52-9022-4855-bd43-b1e49a80a2d6
    # Scenario Type: UI
    # Description: Test the registration process ensuring the password meets the specified requirements.
    Given The user is on the registration page
    When The user enters a password that does not meet the requirements
    And The user fills in other required fields with valid information
    Then The user should see an error message indicating password requirements
    And The user remains on the registration page
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=8919ae52-9022-4855-bd43-b1e49a80a2d6, scenario_id=b53f9927-0682-4abd-a7f7-ae1b74ed2f6c, type=UI
