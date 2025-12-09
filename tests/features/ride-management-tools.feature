@feature_id:225e3508-c834-433f-abe5-3d15b9bd60e2
@epic_id:6542f06c-e4a2-43cb-9bfa-f178138bb284
Feature: Ride Management Tools
  Tools for monitoring and managing ongoing rides.

  @scenario_id:0a4fe87b-ab58-434b-8d68-0f93621e463b
  @scenario_type:UI
  @ui_test
  Scenario: View Ongoing Rides
    # Scenario ID: 0a4fe87b-ab58-434b-8d68-0f93621e463b
    # Feature ID: 225e3508-c834-433f-abe5-3d15b9bd60e2
    # Scenario Type: UI
    # Description: Ensure that users can view all ongoing rides in real-time.
    Given The user is logged into the Quick Taxi application
    When The user navigates to the 'Ongoing Rides' section
    Then The system displays a list of all ongoing rides
    # Priority: low
    # Status: draft
    # Test Runner Info: feature_id=225e3508-c834-433f-abe5-3d15b9bd60e2, scenario_id=0a4fe87b-ab58-434b-8d68-0f93621e463b, type=UI

  @scenario_id:f55746f7-3815-4310-966f-ba213dd98625
  @scenario_type:UI
  @ui_test
  Scenario: Manage Ride Details
    # Scenario ID: f55746f7-3815-4310-966f-ba213dd98625
    # Feature ID: 225e3508-c834-433f-abe5-3d15b9bd60e2
    # Scenario Type: UI
    # Description: Ensure that users can manage details of an ongoing ride.
    Given The user is on the 'Ongoing Rides' page
    When The user selects an ongoing ride
    And The user updates the ride details
    Then The updated ride details are saved and reflected in the ongoing rides list
    # Priority: low
    # Status: draft
    # Test Runner Info: feature_id=225e3508-c834-433f-abe5-3d15b9bd60e2, scenario_id=f55746f7-3815-4310-966f-ba213dd98625, type=UI

  @scenario_id:e67a9d3d-ac6d-4272-87a9-6a01c73d1d22
  @scenario_type:UI
  @ui_test
  Scenario: End a Ride
    # Scenario ID: e67a9d3d-ac6d-4272-87a9-6a01c73d1d22
    # Feature ID: 225e3508-c834-433f-abe5-3d15b9bd60e2
    # Scenario Type: UI
    # Description: Ensure that users can end an ongoing ride successfully.
    Given The user is viewing the details of an ongoing ride
    When The user clicks on the 'End Ride' button
    Then The ride status is updated to 'Completed'
    And The user receives a confirmation message
    # Priority: low
    # Status: draft
    # Test Runner Info: feature_id=225e3508-c834-433f-abe5-3d15b9bd60e2, scenario_id=e67a9d3d-ac6d-4272-87a9-6a01c73d1d22, type=UI

  @scenario_id:56966a67-e8d6-4fc5-adfd-148ac2454da9
  @scenario_type:UI
  @ui_test
  Scenario: View Ride History
    # Scenario ID: 56966a67-e8d6-4fc5-adfd-148ac2454da9
    # Feature ID: 225e3508-c834-433f-abe5-3d15b9bd60e2
    # Scenario Type: UI
    # Description: Ensure that users can view the history of completed rides.
    Given The user is logged into the Quick Taxi application
    When The user navigates to the 'Ride History' section
    Then The system displays a list of all completed rides
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=225e3508-c834-433f-abe5-3d15b9bd60e2, scenario_id=56966a67-e8d6-4fc5-adfd-148ac2454da9, type=UI
