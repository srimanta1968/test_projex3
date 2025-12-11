@feature_id:faeeb960-eb93-40e4-83e8-68446c7f7346
@epic_id:5d8163d1-7f8c-4f9f-be7c-6093e1914880
Feature: User Registration and Profile Creation
  Implement a user-friendly registration process that allows users to create and manage their profiles.

  @scenario_id:df524f32-eb6f-4c36-96a4-197992b08e62
  @scenario_type:UI
  @ui_test
  Scenario: Successful User Registration
    # Scenario ID: df524f32-eb6f-4c36-96a4-197992b08e62
    # Feature ID: faeeb960-eb93-40e4-83e8-68446c7f7346
    # Scenario Type: UI
    # Description: Test the successful registration process with valid details.
    Given the user is on the registration page
    When the user enters valid details
    Then the user should see a confirmation message
    And the user should be redirected to the profile creation page
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=faeeb960-eb93-40e4-83e8-68446c7f7346, scenario_id=df524f32-eb6f-4c36-96a4-197992b08e62, type=UI

  @scenario_id:34f77b16-af67-47a2-a456-af0603e8b017
  @scenario_type:UI
  @ui_test
  Scenario: Registration with Invalid Email
    # Scenario ID: 34f77b16-af67-47a2-a456-af0603e8b017
    # Feature ID: faeeb960-eb93-40e4-83e8-68446c7f7346
    # Scenario Type: UI
    # Description: Test the registration process with an invalid email address.
    Given the user is on the registration page
    When the user enters an invalid email address
    Then an error message should be displayed
    And the user should remain on the registration page
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=faeeb960-eb93-40e4-83e8-68446c7f7346, scenario_id=34f77b16-af67-47a2-a456-af0603e8b017, type=UI

  @scenario_id:8d941bdc-843e-43ab-b6dd-acc3f3eb35ec
  @scenario_type:UI
  @ui_test
  Scenario: Profile Creation After Registration
    # Scenario ID: 8d941bdc-843e-43ab-b6dd-acc3f3eb35ec
    # Feature ID: faeeb960-eb93-40e4-83e8-68446c7f7346
    # Scenario Type: UI
    # Description: Test profile creation after successful registration.
    Given the user has successfully registered
    When the user fills in the profile details
    Then the profile should be saved successfully
    And the user should see a success message
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=faeeb960-eb93-40e4-83e8-68446c7f7346, scenario_id=8d941bdc-843e-43ab-b6dd-acc3f3eb35ec, type=UI

  @scenario_id:5c6c44ed-2c4f-4cde-8a7a-d3263ae1d04a
  @scenario_type:UI
  @ui_test
  Scenario: Password Validation During Registration
    # Scenario ID: 5c6c44ed-2c4f-4cde-8a7a-d3263ae1d04a
    # Feature ID: faeeb960-eb93-40e4-83e8-68446c7f7346
    # Scenario Type: UI
    # Description: Test the password requirements during the registration process.
    Given the user is on the registration page
    When the user enters a password that does not meet the requirements
    Then an error message should indicate the password requirements
    And the user should remain on the registration page
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=faeeb960-eb93-40e4-83e8-68446c7f7346, scenario_id=5c6c44ed-2c4f-4cde-8a7a-d3263ae1d04a, type=UI
