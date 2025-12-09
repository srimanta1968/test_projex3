@feature_id:f6b3d3ca-b664-4413-b943-b1d041c6ceb5
@epic_id:6542f06c-e4a2-43cb-9bfa-f178138bb284
Feature: Driver Management Tools
  Tools for administrators to manage driver profiles and performance.

  @scenario_id:3b767437-1167-466d-80c2-6d3872cb7e13
  @scenario_type:UI
  @ui_test
  Scenario: View Driver Profiles
    # Scenario ID: 3b767437-1167-466d-80c2-6d3872cb7e13
    # Feature ID: f6b3d3ca-b664-4413-b943-b1d041c6ceb5
    # Scenario Type: UI
    # Description: Admin should be able to view the detailed profiles of drivers.
    Given the admin is logged into the system
    When the admin navigates to the driver management section
    Then the profiles of all drivers are displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=f6b3d3ca-b664-4413-b943-b1d041c6ceb5, scenario_id=3b767437-1167-466d-80c2-6d3872cb7e13, type=UI

  @scenario_id:10f33af8-2f26-4fcb-9065-9e51f0a7dc4b
  @scenario_type:UI
  @ui_test
  Scenario: Edit Driver Information
    # Scenario ID: 10f33af8-2f26-4fcb-9065-9e51f0a7dc4b
    # Feature ID: f6b3d3ca-b664-4413-b943-b1d041c6ceb5
    # Scenario Type: UI
    # Description: Admin should be able to edit existing driver profiles.
    Given the admin is logged into the system
    And the admin is on the driver management page
    When the admin selects a driver to edit
    Then the admin can update the driver's name, contact, and vehicle information
    And the changes are saved successfully
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=f6b3d3ca-b664-4413-b943-b1d041c6ceb5, scenario_id=10f33af8-2f26-4fcb-9065-9e51f0a7dc4b, type=UI

  @scenario_id:88371e7c-346f-4ad7-a2ce-0ea1f0580f05
  @scenario_type:UI
  @ui_test
  Scenario: Monitor Driver Performance
    # Scenario ID: 88371e7c-346f-4ad7-a2ce-0ea1f0580f05
    # Feature ID: f6b3d3ca-b664-4413-b943-b1d041c6ceb5
    # Scenario Type: UI
    # Description: Admin should be able to monitor and evaluate driver performance metrics.
    Given the admin is logged into the system
    And the admin is on the driver management page
    When the admin selects a driver to view performance metrics
    Then the performance metrics are displayed for the selected driver
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=f6b3d3ca-b664-4413-b943-b1d041c6ceb5, scenario_id=88371e7c-346f-4ad7-a2ce-0ea1f0580f05, type=UI

  @scenario_id:42a2dd55-ad31-4fc9-8436-5ddbb3dd1eea
  @scenario_type:UI
  @ui_test
  Scenario: Delete Driver Profile
    # Scenario ID: 42a2dd55-ad31-4fc9-8436-5ddbb3dd1eea
    # Feature ID: f6b3d3ca-b664-4413-b943-b1d041c6ceb5
    # Scenario Type: UI
    # Description: Admin should be able to delete a driver profile.
    Given the admin is logged into the system
    And the admin is on the driver management page
    When the admin selects a driver to delete
    Then the driver profile is removed from the system
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=f6b3d3ca-b664-4413-b943-b1d041c6ceb5, scenario_id=42a2dd55-ad31-4fc9-8436-5ddbb3dd1eea, type=UI
