@feature_id:436cd52d-5d1a-4855-8e9a-ba9ffda1962e
@epic_id:993b9ad1-4ab8-40d5-8073-3c955922605c
Feature: Ride History
  Allow users to view their past rides and receipts.

  @scenario_id:4733e895-d8e9-4b11-957c-94d6cf1aa5fd
  @scenario_type:UI
  @ui_test
  Scenario: View Past Rides
    # Scenario ID: 4733e895-d8e9-4b11-957c-94d6cf1aa5fd
    # Feature ID: 436cd52d-5d1a-4855-8e9a-ba9ffda1962e
    # Scenario Type: UI
    # Description: Ensure that users can access their past ride history from the app.
    Given the user is logged into their account
    When the user navigates to the Ride History section of the app
    Then the user should see a list of past rides
    And each ride should display the date, time, and destination
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=436cd52d-5d1a-4855-8e9a-ba9ffda1962e, scenario_id=4733e895-d8e9-4b11-957c-94d6cf1aa5fd, type=UI

  @scenario_id:83a8d637-fa1a-47f3-895c-c1536c0db124
  @scenario_type:UI
  @ui_test
  Scenario: View Ride Receipts
    # Scenario ID: 83a8d637-fa1a-47f3-895c-c1536c0db124
    # Feature ID: 436cd52d-5d1a-4855-8e9a-ba9ffda1962e
    # Scenario Type: UI
    # Description: Ensure that users can view receipts for their past rides.
    Given the user is logged into their account
    When the user selects a past ride from the Ride History
    Then the user should be able to view the receipt for that ride
    And the receipt should include fare details and payment method
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=436cd52d-5d1a-4855-8e9a-ba9ffda1962e, scenario_id=83a8d637-fa1a-47f3-895c-c1536c0db124, type=UI

  @scenario_id:3041bfd5-ebfa-4883-8ad4-11a1e739e4c6
  @scenario_type:UI
  @ui_test
  Scenario: No Rides Available
    # Scenario ID: 3041bfd5-ebfa-4883-8ad4-11a1e739e4c6
    # Feature ID: 436cd52d-5d1a-4855-8e9a-ba9ffda1962e
    # Scenario Type: UI
    # Description: Check the behavior when a user has no past rides.
    Given the user is logged into their account with no past rides
    When the user navigates to the Ride History section of the app
    Then the user should see a message indicating no rides have been taken
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=436cd52d-5d1a-4855-8e9a-ba9ffda1962e, scenario_id=3041bfd5-ebfa-4883-8ad4-11a1e739e4c6, type=UI

  @scenario_id:ecaea7ad-bfef-4ce0-8e4e-cef99c0365b2
  @scenario_type:UI
  @ui_test
  Scenario: Filter Past Rides by Date
    # Scenario ID: ecaea7ad-bfef-4ce0-8e4e-cef99c0365b2
    # Feature ID: 436cd52d-5d1a-4855-8e9a-ba9ffda1962e
    # Scenario Type: UI
    # Description: Ensure users can filter their ride history by date range.
    Given the user is logged into their account
    When the user navigates to the Ride History section of the app
    And the user selects a date range filter
    Then the user should see only the rides that fall within the selected date range
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=436cd52d-5d1a-4855-8e9a-ba9ffda1962e, scenario_id=ecaea7ad-bfef-4ce0-8e4e-cef99c0365b2, type=UI
