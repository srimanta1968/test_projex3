@feature_id:69bc1c90-8366-43f9-8f60-9fcddd1f6d73
@epic_id:993b9ad1-4ab8-40d5-8073-3c955922605c
Feature: Ride Booking
  Allow users to book rides and track their status.

  @scenario_id:8fe432d0-d63b-4154-bf6b-ea82ed9c5014
  @scenario_type:UI
  @ui_test
  Scenario: User successfully books a ride
    # Scenario ID: 8fe432d0-d63b-4154-bf6b-ea82ed9c5014
    # Feature ID: 69bc1c90-8366-43f9-8f60-9fcddd1f6d73
    # Scenario Type: UI
    # Description: Verify that a user can successfully book a ride through the application.
    Given the user is on the ride booking page
    When the user enters the pickup location and destination
    And the user selects the ride type
    And the user confirms the booking
    Then the ride is booked successfully and a confirmation message is displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=69bc1c90-8366-43f9-8f60-9fcddd1f6d73, scenario_id=8fe432d0-d63b-4154-bf6b-ea82ed9c5014, type=UI

  @scenario_id:536b6e17-e8e7-4e67-877c-b4b181b94a9e
  @scenario_type:UI
  @ui_test
  Scenario: User tracks the status of a booked ride
    # Scenario ID: 536b6e17-e8e7-4e67-877c-b4b181b94a9e
    # Feature ID: 69bc1c90-8366-43f9-8f60-9fcddd1f6d73
    # Scenario Type: UI
    # Description: Verify that a user can track the status of their booked ride.
    Given the user has an active ride booking
    When the user navigates to the ride status page
    And the user refreshes the page
    Then the current status of the ride is displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=69bc1c90-8366-43f9-8f60-9fcddd1f6d73, scenario_id=536b6e17-e8e7-4e67-877c-b4b181b94a9e, type=UI

  @scenario_id:9d0dabfa-2af4-4869-b8bb-5b4c28496682
  @scenario_type:UI
  @ui_test
  Scenario: User cancels a booked ride
    # Scenario ID: 9d0dabfa-2af4-4869-b8bb-5b4c28496682
    # Feature ID: 69bc1c90-8366-43f9-8f60-9fcddd1f6d73
    # Scenario Type: UI
    # Description: Verify that a user can cancel a booked ride before the driver arrives.
    Given the user has a booked ride that is not yet started
    When the user chooses to cancel the ride
    Then the ride is canceled successfully and a cancellation confirmation message is displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=69bc1c90-8366-43f9-8f60-9fcddd1f6d73, scenario_id=9d0dabfa-2af4-4869-b8bb-5b4c28496682, type=UI

  @scenario_id:5235aa61-085f-4532-a625-4a5d09817af5
  @scenario_type:API
  @api_test
  Scenario: User is notified of ride status changes
    # Scenario ID: 5235aa61-085f-4532-a625-4a5d09817af5
    # Feature ID: 69bc1c90-8366-43f9-8f60-9fcddd1f6d73
    # Scenario Type: API
    # Description: Verify that a user receives notifications for any changes in ride status.
    Given the user has a booked ride
    When the ride status changes (e.g., driver assigned, driver arrived)
    Then the user receives a notification about the status change
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=69bc1c90-8366-43f9-8f60-9fcddd1f6d73, scenario_id=5235aa61-085f-4532-a625-4a5d09817af5, type=API
