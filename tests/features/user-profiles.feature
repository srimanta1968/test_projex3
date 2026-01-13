@feature_id:e931286f-df88-4530-9238-43c563a46a0d
@epic_id:32a98f90-f38a-4441-acd6-b39e38e260d8
Feature: User Profiles
  Manage user profile data including preferences and trip history.

  @scenario_id:75c28867-36a1-4771-9456-5fc85d77852e
  @scenario_type:UI
  @ui_test
  Scenario: View User Profile
    # Scenario ID: 75c28867-36a1-4771-9456-5fc85d77852e
    # Feature ID: e931286f-df88-4530-9238-43c563a46a0d
    # Scenario Type: UI
    # Description: The user should be able to view their profile details including preferences and trip history in the application.
    Given the user is logged into their account
    When the user navigates to the profile section
    Then the user sees their profile details including preferences
    And the user sees their trip history
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=e931286f-df88-4530-9238-43c563a46a0d, scenario_id=75c28867-36a1-4771-9456-5fc85d77852e, type=UI

  @scenario_id:76343c6e-5c86-4ec5-b842-2c193d3d3441
  @scenario_type:UI
  @ui_test
  Scenario: Edit User Profile Preferences
    # Scenario ID: 76343c6e-5c86-4ec5-b842-2c193d3d3441
    # Feature ID: e931286f-df88-4530-9238-43c563a46a0d
    # Scenario Type: UI
    # Description: The user should be able to edit their profile preferences such as communication settings and favorite destinations.
    Given the user is logged into their account
    When the user navigates to the profile preferences section
    And the user changes a preference setting
    And the user saves the changes
    Then the preference setting is updated successfully
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=e931286f-df88-4530-9238-43c563a46a0d, scenario_id=76343c6e-5c86-4ec5-b842-2c193d3d3441, type=UI

  @scenario_id:5f32a31c-a413-4298-9b10-825014d221f9
  @scenario_type:UI
  @ui_test
  Scenario: Delete Trip History
    # Scenario ID: 5f32a31c-a413-4298-9b10-825014d221f9
    # Feature ID: e931286f-df88-4530-9238-43c563a46a0d
    # Scenario Type: UI
    # Description: The user should be able to delete specific trips from their trip history.
    Given the user is logged into their account
    When the user navigates to the trip history section
    And the user selects a trip to delete
    And the user confirms the deletion
    Then the selected trip is removed from the trip history
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=e931286f-df88-4530-9238-43c563a46a0d, scenario_id=5f32a31c-a413-4298-9b10-825014d221f9, type=UI

  @scenario_id:33df256f-5d6c-4885-895d-d771522b934f
  @scenario_type:UI
  @ui_test
  Scenario: Add New Trip to History
    # Scenario ID: 33df256f-5d6c-4885-895d-d771522b934f
    # Feature ID: e931286f-df88-4530-9238-43c563a46a0d
    # Scenario Type: UI
    # Description: The user should be able to add a new trip entry to their trip history.
    Given the user is logged into their account
    When the user navigates to the add trip section
    And the user fills out the trip details
    And the user submits the trip information
    Then the new trip is added to the trip history
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=e931286f-df88-4530-9238-43c563a46a0d, scenario_id=33df256f-5d6c-4885-895d-d771522b934f, type=UI
