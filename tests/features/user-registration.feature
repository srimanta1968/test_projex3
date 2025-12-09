@feature_id:9d2fa831-e0e7-4d9d-8e09-729fd0c41f3e
@epic_id:993b9ad1-4ab8-40d5-8073-3c955922605c
Feature: User Registration
  Allow users to create an account and manage their profiles.

  @scenario_id:1ba2e2b8-a13a-4b30-a158-951013de836f
  @scenario_type:UI
  @ui_test
  Scenario: Successful User Registration
    # Scenario ID: 1ba2e2b8-a13a-4b30-a158-951013de836f
    # Feature ID: 9d2fa831-e0e7-4d9d-8e09-729fd0c41f3e
    # Scenario Type: UI
    # Description: Test the user registration process with valid inputs.
    Given the user is on the registration page
    When the user enters valid details
    Then the user should be redirected to the profile creation page
    And the user should see a success message
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=9d2fa831-e0e7-4d9d-8e09-729fd0c41f3e, scenario_id=1ba2e2b8-a13a-4b30-a158-951013de836f, type=UI

  @scenario_id:4d6eadad-d5ee-4447-87a0-cffdd029ab3e
  @scenario_type:UI
  @ui_test
  Scenario: Validation Errors on User Registration
    # Scenario ID: 4d6eadad-d5ee-4447-87a0-cffdd029ab3e
    # Feature ID: 9d2fa831-e0e7-4d9d-8e09-729fd0c41f3e
    # Scenario Type: UI
    # Description: Test the user registration process with invalid inputs.
    Given the user is on the registration page
    When the user enters invalid details
    Then the user should see error messages for invalid fields
    And the user should remain on the registration page
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=9d2fa831-e0e7-4d9d-8e09-729fd0c41f3e, scenario_id=4d6eadad-d5ee-4447-87a0-cffdd029ab3e, type=UI

  @scenario_id:c921ea6c-2202-43a5-b75f-d25e7d06bd0c
  @scenario_type:UI
  @ui_test
  Scenario: Profile Management Post Registration
    # Scenario ID: c921ea6c-2202-43a5-b75f-d25e7d06bd0c
    # Feature ID: 9d2fa831-e0e7-4d9d-8e09-729fd0c41f3e
    # Scenario Type: UI
    # Description: Test the profile management functionality after successful registration.
    Given the user has successfully registered
    And the user is logged in
    When the user navigates to the profile management section
    Then the user should see the profile management options
    And the user should be able to edit their profile information
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=9d2fa831-e0e7-4d9d-8e09-729fd0c41f3e, scenario_id=c921ea6c-2202-43a5-b75f-d25e7d06bd0c, type=UI

  @scenario_id:3ad7e6f5-14a6-4c07-9908-40129a8eb3bc
  @scenario_type:UI
  @ui_test
  Scenario: Duplicate Registration Handling
    # Scenario ID: 3ad7e6f5-14a6-4c07-9908-40129a8eb3bc
    # Feature ID: 9d2fa831-e0e7-4d9d-8e09-729fd0c41f3e
    # Scenario Type: UI
    # Description: Test the user registration process when the email is already in use.
    Given the user is on the registration page
    When the user enters an already registered email
    Then the user should see a message indicating the email is already in use
    And the user should remain on the registration page
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=9d2fa831-e0e7-4d9d-8e09-729fd0c41f3e, scenario_id=3ad7e6f5-14a6-4c07-9908-40129a8eb3bc, type=UI
