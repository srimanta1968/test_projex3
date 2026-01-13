@feature_id:0547a2e6-c5df-4237-a032-c3082ae4f13e
@epic_id:c04f1b90-e100-48f2-b686-df1486cc5ed1
Feature: Trip History
  Manage and display the history of trips taken by users.

  @scenario_id:4b22b98b-1e88-413e-9395-dd28e77bb37e
  @scenario_type:UI
  @ui_test
  Scenario: View Trip History
    # Scenario ID: 4b22b98b-1e88-413e-9395-dd28e77bb37e
    # Feature ID: 0547a2e6-c5df-4237-a032-c3082ae4f13e
    # Scenario Type: UI
    # Description: Ensure that users can view their trip history in the app.
    Given the user is logged into their account
    When the user navigates to the Trip History section
    Then the user should see a list of all trips taken
    And each trip should display the date, destination, and cost
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=0547a2e6-c5df-4237-a032-c3082ae4f13e, scenario_id=4b22b98b-1e88-413e-9395-dd28e77bb37e, type=UI

  @scenario_id:ee28d37f-77b8-4815-800f-2ec8d287e4f9
  @scenario_type:UI
  @ui_test
  Scenario: No Trip History
    # Scenario ID: ee28d37f-77b8-4815-800f-2ec8d287e4f9
    # Feature ID: 0547a2e6-c5df-4237-a032-c3082ae4f13e
    # Scenario Type: UI
    # Description: Ensure that the system handles cases where the user has no trip history.
    Given the user is logged into their account with no trips
    When the user navigates to the Trip History section
    Then the user should see a message indicating no trips have been taken
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=0547a2e6-c5df-4237-a032-c3082ae4f13e, scenario_id=ee28d37f-77b8-4815-800f-2ec8d287e4f9, type=UI

  @scenario_id:29da77af-4892-4c96-980a-1d1bdef8add9
  @scenario_type:UI
  @ui_test
  Scenario: Filter Trip History by Date
    # Scenario ID: 29da77af-4892-4c96-980a-1d1bdef8add9
    # Feature ID: 0547a2e6-c5df-4237-a032-c3082ae4f13e
    # Scenario Type: UI
    # Description: Ensure that users can filter their trip history by date range.
    Given the user is logged into their account
    When the user navigates to the Trip History section
    And the user selects a date range for filtering
    Then the user should see only trips taken within the selected date range
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=0547a2e6-c5df-4237-a032-c3082ae4f13e, scenario_id=29da77af-4892-4c96-980a-1d1bdef8add9, type=UI

  @scenario_id:0d58b02d-edf0-49b0-9bb7-d676a2854f14
  @scenario_type:UI
  @ui_test
  Scenario: Trip Details View
    # Scenario ID: 0d58b02d-edf0-49b0-9bb7-d676a2854f14
    # Feature ID: 0547a2e6-c5df-4237-a032-c3082ae4f13e
    # Scenario Type: UI
    # Description: Ensure that users can view detailed information about a specific trip.
    Given the user is logged into their account and has trip history
    When the user navigates to the Trip History section
    And the user selects a specific trip from the list
    Then the user should see detailed information about the selected trip
    And the details should include the driver, vehicle information, and route taken
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=0547a2e6-c5df-4237-a032-c3082ae4f13e, scenario_id=0d58b02d-edf0-49b0-9bb7-d676a2854f14, type=UI
