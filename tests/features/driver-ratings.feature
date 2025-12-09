@feature_id:c4f5449c-fc72-4eb2-9e63-ff41fd460a9f
@epic_id:569d4b94-1af7-410f-bd3e-3158c1745a79
Feature: Driver Ratings
  Collect and display ratings for drivers based on user feedback.

  @scenario_id:9b68bdbd-2815-4dfc-9541-1c835aece6db
  @scenario_type:UI
  @ui_test
  Scenario: Display Driver Ratings
    # Scenario ID: 9b68bdbd-2815-4dfc-9541-1c835aece6db
    # Feature ID: c4f5449c-fc72-4eb2-9e63-ff41fd460a9f
    # Scenario Type: UI
    # Description: Ensure that the driver ratings are displayed correctly based on user feedback.
    Given the user has submitted a feedback for the driver
    When the user views the driver profile
    Then the driver rating should be displayed prominently
    And the rating should reflect the average of all user feedback
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=c4f5449c-fc72-4eb2-9e63-ff41fd460a9f, scenario_id=9b68bdbd-2815-4dfc-9541-1c835aece6db, type=UI

  @scenario_id:475e47c3-042f-4d40-b0f7-b8d63b374f8c
  @scenario_type:UI
  @ui_test
  Scenario: Collect User Feedback for Driver
    # Scenario ID: 475e47c3-042f-4d40-b0f7-b8d63b374f8c
    # Feature ID: c4f5449c-fc72-4eb2-9e63-ff41fd460a9f
    # Scenario Type: UI
    # Description: Verify that users can submit feedback for a driver after a ride.
    Given the user has completed a ride
    When the user navigates to the feedback form
    Then the user should be able to enter a rating
    And the user should be able to submit the feedback
    And the system should confirm the feedback submission
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=c4f5449c-fc72-4eb2-9e63-ff41fd460a9f, scenario_id=475e47c3-042f-4d40-b0f7-b8d63b374f8c, type=UI

  @scenario_id:620f1c34-a4a5-456f-b6b0-e8bba4bc717d
  @scenario_type:UI
  @ui_test
  Scenario: Update Driver Ratings After New Feedback Submission
    # Scenario ID: 620f1c34-a4a5-456f-b6b0-e8bba4bc717d
    # Feature ID: c4f5449c-fc72-4eb2-9e63-ff41fd460a9f
    # Scenario Type: UI
    # Description: Check that driver ratings are updated immediately after new feedback is submitted.
    Given a driver has existing ratings
    Given the user has submitted new feedback for that driver
    When the feedback is submitted successfully
    Then the driver rating should be recalculated
    And the updated rating should be displayed on the driver profile
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=c4f5449c-fc72-4eb2-9e63-ff41fd460a9f, scenario_id=620f1c34-a4a5-456f-b6b0-e8bba4bc717d, type=UI

  @scenario_id:b3025633-2151-4648-8336-18cfa7ff6d5c
  @scenario_type:UI
  @ui_test
  Scenario: Display Ratings Breakdown by User Feedback
    # Scenario ID: b3025633-2151-4648-8336-18cfa7ff6d5c
    # Feature ID: c4f5449c-fc72-4eb2-9e63-ff41fd460a9f
    # Scenario Type: UI
    # Description: Ensure that detailed feedback from users is accessible on the driver profile.
    Given the user views the driver profile
    When the user clicks on the ratings section
    Then the detailed ratings breakdown should be displayed
    And the feedback comments should be visible along with the ratings
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=c4f5449c-fc72-4eb2-9e63-ff41fd460a9f, scenario_id=b3025633-2151-4648-8336-18cfa7ff6d5c, type=UI
