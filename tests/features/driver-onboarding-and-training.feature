@feature_id:ae7166cc-bc6d-4319-9245-36debb068b29
@epic_id:342d166e-3a53-40fc-a690-4f2dd7ab856a
Feature: Driver Onboarding and Training
  Implement a comprehensive onboarding process for drivers to ensure they meet service standards.

  @scenario_id:90a7a057-4fa0-42d0-84ac-1bfdcfbaed39
  @scenario_type:UI
  @ui_test
  Scenario: Successful Driver Registration
    # Scenario ID: 90a7a057-4fa0-42d0-84ac-1bfdcfbaed39
    # Feature ID: ae7166cc-bc6d-4319-9245-36debb068b29
    # Scenario Type: UI
    # Description: Ensure that a driver can successfully complete the registration process and receive confirmation.
    Given the driver is on the registration page
    When the driver fills out all required fields
    And the driver submits the registration form
    Then the driver receives a confirmation message
    And the driver is redirected to the training schedule page
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=ae7166cc-bc6d-4319-9245-36debb068b29, scenario_id=90a7a057-4fa0-42d0-84ac-1bfdcfbaed39, type=UI

  @scenario_id:3e323604-415d-4eeb-98b5-53db69c45679
  @scenario_type:UI
  @ui_test
  Scenario: Mandatory Training Completion
    # Scenario ID: 3e323604-415d-4eeb-98b5-53db69c45679
    # Feature ID: ae7166cc-bc6d-4319-9245-36debb068b29
    # Scenario Type: UI
    # Description: Verify that drivers must complete mandatory training modules before they can start driving.
    Given the driver has completed registration
    When the driver attempts to access the driving dashboard
    Then the driver is prompted to complete training modules
    And the driving dashboard remains inaccessible until training is completed
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=ae7166cc-bc6d-4319-9245-36debb068b29, scenario_id=3e323604-415d-4eeb-98b5-53db69c45679, type=UI

  @scenario_id:c7fa7bbf-582d-43b4-bff2-1a0658364d20
  @scenario_type:UI
  @ui_test
  Scenario: Training Module Progress Tracking
    # Scenario ID: c7fa7bbf-582d-43b4-bff2-1a0658364d20
    # Feature ID: ae7166cc-bc6d-4319-9245-36debb068b29
    # Scenario Type: UI
    # Description: Ensure that drivers can track their progress in the training modules.
    Given the driver is logged into their account
    When the driver accesses the training module page
    Then the driver sees a progress bar indicating completion status
    And the driver can view details of completed and remaining modules
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=ae7166cc-bc6d-4319-9245-36debb068b29, scenario_id=c7fa7bbf-582d-43b4-bff2-1a0658364d20, type=UI

  @scenario_id:aeef6f4c-94e6-491b-b3c7-1248b2e3ab71
  @scenario_type:UI
  @ui_test
  Scenario: Feedback Submission After Training
    # Scenario ID: aeef6f4c-94e6-491b-b3c7-1248b2e3ab71
    # Feature ID: ae7166cc-bc6d-4319-9245-36debb068b29
    # Scenario Type: UI
    # Description: Verify that drivers can submit feedback after completing the training modules.
    Given the driver has completed all training modules
    When the driver navigates to the feedback section
    And the driver submits their feedback
    Then the driver receives a thank you message for their feedback
    And the feedback is recorded in the system
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=ae7166cc-bc6d-4319-9245-36debb068b29, scenario_id=aeef6f4c-94e6-491b-b3c7-1248b2e3ab71, type=UI
