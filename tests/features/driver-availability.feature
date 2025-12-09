@feature_id:7208f7af-1d69-4359-88ee-14dc82a94a0f
@epic_id:569d4b94-1af7-410f-bd3e-3158c1745a79
Feature: Driver Availability
  Enable drivers to set their availability for rides.

  @scenario_id:506fde7f-60f9-43b3-92cc-f055bdbd9aa9
  @scenario_type:UI
  @ui_test
  Scenario: Driver Sets Availability to Available
    # Scenario ID: 506fde7f-60f9-43b3-92cc-f055bdbd9aa9
    # Feature ID: 7208f7af-1d69-4359-88ee-14dc82a94a0f
    # Scenario Type: UI
    # Description: Test that a driver can successfully set their availability status to available for rides.
    Given the driver is logged into the application
    When the driver navigates to the availability settings
    And the driver selects 'Available' option
    Then the driver's availability status should be updated to 'Available'
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7208f7af-1d69-4359-88ee-14dc82a94a0f, scenario_id=506fde7f-60f9-43b3-92cc-f055bdbd9aa9, type=UI

  @scenario_id:40321a09-496d-4368-a851-887a912dc03a
  @scenario_type:UI
  @ui_test
  Scenario: Driver Sets Availability to Unavailable
    # Scenario ID: 40321a09-496d-4368-a851-887a912dc03a
    # Feature ID: 7208f7af-1d69-4359-88ee-14dc82a94a0f
    # Scenario Type: UI
    # Description: Test that a driver can successfully set their availability status to unavailable for rides.
    Given the driver is logged into the application
    When the driver navigates to the availability settings
    And the driver selects 'Unavailable' option
    Then the driver's availability status should be updated to 'Unavailable'
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7208f7af-1d69-4359-88ee-14dc82a94a0f, scenario_id=40321a09-496d-4368-a851-887a912dc03a, type=UI

  @scenario_id:7ca6c227-da6a-4556-ae91-ab8726b8bcf7
  @scenario_type:UI
  @ui_test
  Scenario: System Displays Current Availability Status
    # Scenario ID: 7ca6c227-da6a-4556-ae91-ab8726b8bcf7
    # Feature ID: 7208f7af-1d69-4359-88ee-14dc82a94a0f
    # Scenario Type: UI
    # Description: Test that the current availability status of the driver is displayed correctly in the app.
    Given the driver has set their availability status
    When the driver navigates to their profile
    Then the current availability status should be visible on the profile
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7208f7af-1d69-4359-88ee-14dc82a94a0f, scenario_id=7ca6c227-da6a-4556-ae91-ab8726b8bcf7, type=UI

  @scenario_id:023d652a-1c7d-43d1-95a9-f966ded8a821
  @scenario_type:UI
  @ui_test
  Scenario: Driver Changes Availability Status Multiple Times
    # Scenario ID: 023d652a-1c7d-43d1-95a9-f966ded8a821
    # Feature ID: 7208f7af-1d69-4359-88ee-14dc82a94a0f
    # Scenario Type: UI
    # Description: Test that a driver can change their availability status multiple times without issues.
    Given the driver is logged into the application
    When the driver navigates to the availability settings
    And the driver sets availability to 'Available'
    And the driver sets availability to 'Unavailable'
    And the driver sets availability to 'Available' again
    Then the driver's availability status should reflect the last change to 'Available'
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7208f7af-1d69-4359-88ee-14dc82a94a0f, scenario_id=023d652a-1c7d-43d1-95a9-f966ded8a821, type=UI
