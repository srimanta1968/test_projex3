@feature_id:9d1adb4a-0282-4455-b4fc-3e75167bc545
@epic_id:85f48a84-a4a1-4370-84ca-87a3c67befd2
Feature: Digital Marketing Campaigns
  Plan and execute digital marketing campaigns to raise awareness about the ride-sharing service.

  @scenario_id:70dc49ac-93c1-42cc-8d94-0ef6524326f1
  @scenario_type:UI
  @ui_test
  Scenario: Create a New Digital Marketing Campaign
    # Scenario ID: 70dc49ac-93c1-42cc-8d94-0ef6524326f1
    # Feature ID: 9d1adb4a-0282-4455-b4fc-3e75167bc545
    # Scenario Type: UI
    # Description: Verify that a user can create a new digital marketing campaign for the ride-sharing service.
    Given The user is logged into the marketing dashboard
    When The user clicks on 'Create Campaign' button
    Then The user is redirected to the campaign creation page
    And The user sees fields to enter campaign details
    And The user can select the target audience
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=9d1adb4a-0282-4455-b4fc-3e75167bc545, scenario_id=70dc49ac-93c1-42cc-8d94-0ef6524326f1, type=UI

  @scenario_id:dfdb21c8-15fc-49cb-9433-d6711d1ef221
  @scenario_type:UI
  @ui_test
  Scenario: Launch a Digital Marketing Campaign
    # Scenario ID: dfdb21c8-15fc-49cb-9433-d6711d1ef221
    # Feature ID: 9d1adb4a-0282-4455-b4fc-3e75167bc545
    # Scenario Type: UI
    # Description: Check if a user can successfully launch a digital marketing campaign.
    Given The user has created a digital marketing campaign
    When The user clicks on 'Launch Campaign' button
    Then The campaign status changes to 'Live'
    And The user receives a confirmation message
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=9d1adb4a-0282-4455-b4fc-3e75167bc545, scenario_id=dfdb21c8-15fc-49cb-9433-d6711d1ef221, type=UI

  @scenario_id:89e8197a-22bd-4786-9402-4f12f3c235bd
  @scenario_type:UI
  @ui_test
  Scenario: View Active Digital Marketing Campaigns
    # Scenario ID: 89e8197a-22bd-4786-9402-4f12f3c235bd
    # Feature ID: 9d1adb4a-0282-4455-b4fc-3e75167bc545
    # Scenario Type: UI
    # Description: Ensure that users can view all active digital marketing campaigns.
    Given The user is logged into the marketing dashboard
    When The user navigates to 'Active Campaigns' section
    Then The user sees a list of active campaigns
    And Each campaign displays relevant details such as start date and target audience
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=9d1adb4a-0282-4455-b4fc-3e75167bc545, scenario_id=89e8197a-22bd-4786-9402-4f12f3c235bd, type=UI

  @scenario_id:c62f830b-0e98-4cf5-874b-e07b96696e99
  @scenario_type:UI
  @ui_test
  Scenario: Analyze Campaign Performance
    # Scenario ID: c62f830b-0e98-4cf5-874b-e07b96696e99
    # Feature ID: 9d1adb4a-0282-4455-b4fc-3e75167bc545
    # Scenario Type: UI
    # Description: Validate that users can analyze the performance of a digital marketing campaign.
    Given The user has access to an active digital marketing campaign
    When The user clicks on 'Analyze' button for the campaign
    Then The user is taken to the performance analysis page
    And The user can see metrics such as clicks, impressions, and engagement rate
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=9d1adb4a-0282-4455-b4fc-3e75167bc545, scenario_id=c62f830b-0e98-4cf5-874b-e07b96696e99, type=UI
