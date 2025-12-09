@feature_id:080c1da3-1feb-4862-9d47-5904a5e77e09
@epic_id:569d4b94-1af7-410f-bd3e-3158c1745a79
Feature: Driver Registration
  Allow drivers to create profiles and manage their vehicles.

  @scenario_id:22347131-3759-49fa-97b4-ab73ef96bb22
  @scenario_type:UI
  @ui_test
  Scenario: Driver Profile Creation
    # Scenario ID: 22347131-3759-49fa-97b4-ab73ef96bb22
    # Feature ID: 080c1da3-1feb-4862-9d47-5904a5e77e09
    # Scenario Type: UI
    # Description: Test the ability for drivers to create a new profile successfully.
    Given the driver is on the registration page
    When the driver enters valid personal details
    Then the driver profile is created successfully
    And the driver receives a confirmation message
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=080c1da3-1feb-4862-9d47-5904a5e77e09, scenario_id=22347131-3759-49fa-97b4-ab73ef96bb22, type=UI

  @scenario_id:78c8a0c1-dbf6-459a-8c79-7177e69e8a00
  @scenario_type:UI
  @ui_test
  Scenario: Vehicle Management
    # Scenario ID: 78c8a0c1-dbf6-459a-8c79-7177e69e8a00
    # Feature ID: 080c1da3-1feb-4862-9d47-5904a5e77e09
    # Scenario Type: UI
    # Description: Test the ability for drivers to add a vehicle to their profile.
    Given the driver is logged into their profile
    When the driver navigates to the vehicle management section
    And the driver enters valid vehicle details
    Then the vehicle is added to the driver's profile successfully
    And the driver can view the vehicle in their profile
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=080c1da3-1feb-4862-9d47-5904a5e77e09, scenario_id=78c8a0c1-dbf6-459a-8c79-7177e69e8a00, type=UI

  @scenario_id:ab044f99-7d85-44e0-902b-0501fa081e62
  @scenario_type:UI
  @ui_test
  Scenario: Profile Update
    # Scenario ID: ab044f99-7d85-44e0-902b-0501fa081e62
    # Feature ID: 080c1da3-1feb-4862-9d47-5904a5e77e09
    # Scenario Type: UI
    # Description: Test the functionality of updating driver profile information.
    Given the driver is logged into their profile
    When the driver navigates to the profile update section
    And the driver modifies their personal details
    Then the driver's profile is updated successfully
    And the driver receives a notification of the update
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=080c1da3-1feb-4862-9d47-5904a5e77e09, scenario_id=ab044f99-7d85-44e0-902b-0501fa081e62, type=UI

  @scenario_id:b0c54603-084a-4532-8d7f-e26fa7611b42
  @scenario_type:UI
  @ui_test
  Scenario: Vehicle Deletion
    # Scenario ID: b0c54603-084a-4532-8d7f-e26fa7611b42
    # Feature ID: 080c1da3-1feb-4862-9d47-5904a5e77e09
    # Scenario Type: UI
    # Description: Test the ability for drivers to remove a vehicle from their profile.
    Given the driver is logged into their profile
    When the driver navigates to the vehicle management section
    And the driver selects a vehicle to delete
    Then the vehicle is removed from the driver's profile successfully
    And the driver receives a confirmation message regarding the deletion
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=080c1da3-1feb-4862-9d47-5904a5e77e09, scenario_id=b0c54603-084a-4532-8d7f-e26fa7611b42, type=UI
