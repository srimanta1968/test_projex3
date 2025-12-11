@feature_id:c3990b24-0018-45bc-9661-9d7cc0b36469
@epic_id:342d166e-3a53-40fc-a690-4f2dd7ab856a
Feature: Ride Scheduling and Dispatch
  Develop an efficient system for scheduling rides and dispatching drivers to customers.

  @scenario_id:b55f4ff3-6456-48d9-a231-25d431c2db75
  @scenario_type:UI
  @ui_test
  Scenario: Schedule a Ride Successfully
    # Scenario ID: b55f4ff3-6456-48d9-a231-25d431c2db75
    # Feature ID: c3990b24-0018-45bc-9661-9d7cc0b36469
    # Scenario Type: UI
    # Description: Ensure that users can schedule a ride efficiently through the application.
    Given the user is logged into the application
    When the user selects the pick-up and drop-off locations
    And the user confirms the ride details
    Then the system schedules the ride and displays the estimated arrival time
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=c3990b24-0018-45bc-9661-9d7cc0b36469, scenario_id=b55f4ff3-6456-48d9-a231-25d431c2db75, type=UI

  @scenario_id:3089a2ba-eb37-4b34-b4b2-6df3213e0935
  @scenario_type:API
  @api_test
  Scenario: Dispatch Driver for Scheduled Ride
    # Scenario ID: 3089a2ba-eb37-4b34-b4b2-6df3213e0935
    # Feature ID: c3990b24-0018-45bc-9661-9d7cc0b36469
    # Scenario Type: API
    # Description: Verify that the system dispatches a driver to the user’s location upon ride scheduling.
    Given a ride has been successfully scheduled
    When the scheduled time arrives
    Then the system dispatches a driver to the user's location
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=c3990b24-0018-45bc-9661-9d7cc0b36469, scenario_id=3089a2ba-eb37-4b34-b4b2-6df3213e0935, type=API

  @scenario_id:52da95e6-9d62-4c96-b9b0-6fd0bc5312a0
  @scenario_type:API
  @api_test
  Scenario: Cancel a Scheduled Ride
    # Scenario ID: 52da95e6-9d62-4c96-b9b0-6fd0bc5312a0
    # Feature ID: c3990b24-0018-45bc-9661-9d7cc0b36469
    # Scenario Type: API
    # Description: Check if users can cancel a scheduled ride successfully.
    Given the user has a scheduled ride
    When the user chooses to cancel the ride
    Then the system confirms the cancellation and updates the ride status
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=c3990b24-0018-45bc-9661-9d7cc0b36469, scenario_id=52da95e6-9d62-4c96-b9b0-6fd0bc5312a0, type=API

  @scenario_id:46a6d671-55c8-4037-86ba-6fa163814457
  @scenario_type:API
  @api_test
  Scenario: Receive Notification of Driver Arrival
    # Scenario ID: 46a6d671-55c8-4037-86ba-6fa163814457
    # Feature ID: c3990b24-0018-45bc-9661-9d7cc0b36469
    # Scenario Type: API
    # Description: Ensure that users receive a notification when their assigned driver arrives.
    Given a driver is dispatched to the user's location
    When the driver arrives at the pick-up location
    Then the user receives a notification of the driver's arrival
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=c3990b24-0018-45bc-9661-9d7cc0b36469, scenario_id=46a6d671-55c8-4037-86ba-6fa163814457, type=API
