@feature_id:7adecfd0-22b6-4e64-9206-e54187dc32b2
@epic_id:c04f1b90-e100-48f2-b686-df1486cc5ed1
Feature: Trip Creation
  Allow users to create and schedule trips.

  @scenario_id:f2db701f-f93f-46ab-b385-f7127b5c3639
  @scenario_type:UI
  @ui_test
  Scenario: User successfully creates a trip
    # Scenario ID: f2db701f-f93f-46ab-b385-f7127b5c3639
    # Feature ID: 7adecfd0-22b6-4e64-9206-e54187dc32b2
    # Scenario Type: UI
    # Description: This scenario tests the successful creation of a trip by the user.
    Given The user is logged in to the Ride Share app
    When The user navigates to the trip creation page
    And The user fills in the trip details (destination, date, time)
    And The user clicks on the 'Create Trip' button
    Then A new trip is created and displayed in the user's trip list
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7adecfd0-22b6-4e64-9206-e54187dc32b2, scenario_id=f2db701f-f93f-46ab-b385-f7127b5c3639, type=UI

  @scenario_id:956f0de1-63fb-4d52-ab55-bd115016a01e
  @scenario_type:UI
  @ui_test
  Scenario: User fails to create a trip with missing details
    # Scenario ID: 956f0de1-63fb-4d52-ab55-bd115016a01e
    # Feature ID: 7adecfd0-22b6-4e64-9206-e54187dc32b2
    # Scenario Type: UI
    # Description: This scenario tests the application's response when the user tries to create a trip without filling in required details.
    Given The user is logged in to the Ride Share app
    When The user navigates to the trip creation page
    And The user leaves the trip details empty
    And The user clicks on the 'Create Trip' button
    Then An error message is displayed indicating missing details
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=7adecfd0-22b6-4e64-9206-e54187dc32b2, scenario_id=956f0de1-63fb-4d52-ab55-bd115016a01e, type=UI

  @scenario_id:fdfa9cc3-dffa-4a3d-ac2f-cc19fee5c4e2
  @scenario_type:UI
  @ui_test
  Scenario: User edits an existing trip
    # Scenario ID: fdfa9cc3-dffa-4a3d-ac2f-cc19fee5c4e2
    # Feature ID: 7adecfd0-22b6-4e64-9206-e54187dc32b2
    # Scenario Type: UI
    # Description: This scenario tests the ability for users to edit the details of an existing trip.
    Given The user is logged in to the Ride Share app
    And The user has an existing trip scheduled
    When The user navigates to the trip details page
    And The user updates the trip details (date and time)
    And The user clicks on the 'Save Changes' button
    Then The trip details are updated successfully and reflected in the trip list
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7adecfd0-22b6-4e64-9206-e54187dc32b2, scenario_id=fdfa9cc3-dffa-4a3d-ac2f-cc19fee5c4e2, type=UI

  @scenario_id:86552027-b05d-4ef0-b194-7b8f226914ba
  @scenario_type:UI
  @ui_test
  Scenario: User cancels a scheduled trip
    # Scenario ID: 86552027-b05d-4ef0-b194-7b8f226914ba
    # Feature ID: 7adecfd0-22b6-4e64-9206-e54187dc32b2
    # Scenario Type: UI
    # Description: This scenario tests the functionality for users to cancel a trip they have scheduled.
    Given The user is logged in to the Ride Share app
    And The user has a scheduled trip
    When The user navigates to the trip details page
    And The user clicks on the 'Cancel Trip' button
    Then The trip is removed from the user's trip list and a confirmation message is displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7adecfd0-22b6-4e64-9206-e54187dc32b2, scenario_id=86552027-b05d-4ef0-b194-7b8f226914ba, type=UI
