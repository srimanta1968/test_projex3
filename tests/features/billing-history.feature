@feature_id:ad9e0ff0-7fa3-4013-9eb0-783901a26750
@epic_id:0acf558b-ccb4-4e42-8d55-e558c38292d5
Feature: Billing History
  Track and display the billing history for users.

  @scenario_id:9bfd223e-3afb-4365-b646-0cf0cfdf5af6
  @scenario_type:UI
  @ui_test
  Scenario: View Billing History
    # Scenario ID: 9bfd223e-3afb-4365-b646-0cf0cfdf5af6
    # Feature ID: ad9e0ff0-7fa3-4013-9eb0-783901a26750
    # Scenario Type: UI
    # Description: As a user, I want to view my complete billing history so that I can keep track of my expenses.
    Given I am logged into my Ride Share account
    When I navigate to the Billing History section
    Then I should see a list of all my past transactions
    And Each transaction should display the date, amount, and ride details
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=ad9e0ff0-7fa3-4013-9eb0-783901a26750, scenario_id=9bfd223e-3afb-4365-b646-0cf0cfdf5af6, type=UI

  @scenario_id:32812cfb-f2f2-4e71-9568-a20327763f08
  @scenario_type:UI
  @ui_test
  Scenario: Empty Billing History
    # Scenario ID: 32812cfb-f2f2-4e71-9568-a20327763f08
    # Feature ID: ad9e0ff0-7fa3-4013-9eb0-783901a26750
    # Scenario Type: UI
    # Description: As a user, I want to see a message when I have no billing history so that I know my records are clear.
    Given I am logged into my Ride Share account
    When I navigate to the Billing History section
    Then I should see a message indicating that there are no billing records
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=ad9e0ff0-7fa3-4013-9eb0-783901a26750, scenario_id=32812cfb-f2f2-4e71-9568-a20327763f08, type=UI

  @scenario_id:1d6deb7e-2a7e-493b-b10b-59283b41bfd9
  @scenario_type:UI
  @ui_test
  Scenario: Filter Billing History by Date
    # Scenario ID: 1d6deb7e-2a7e-493b-b10b-59283b41bfd9
    # Feature ID: ad9e0ff0-7fa3-4013-9eb0-783901a26750
    # Scenario Type: UI
    # Description: As a user, I want to filter my billing history by date range so that I can find specific transactions easily.
    Given I am logged into my Ride Share account
    When I navigate to the Billing History section
    And I select a date range for filtering
    Then I should see only the transactions that fall within the selected date range
    # Priority: high
    # Status: draft
    # Test Runner Info: feature_id=ad9e0ff0-7fa3-4013-9eb0-783901a26750, scenario_id=1d6deb7e-2a7e-493b-b10b-59283b41bfd9, type=UI

  @scenario_id:b4ab9e5a-382f-4419-b17f-b93a3f491e98
  @scenario_type:UI
  @ui_test
  Scenario: Download Billing History
    # Scenario ID: b4ab9e5a-382f-4419-b17f-b93a3f491e98
    # Feature ID: ad9e0ff0-7fa3-4013-9eb0-783901a26750
    # Scenario Type: UI
    # Description: As a user, I want to download my billing history as a CSV file for my records.
    Given I am logged into my Ride Share account
    When I navigate to the Billing History section
    And I click on the download button
    Then I should receive a CSV file containing my billing history
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=ad9e0ff0-7fa3-4013-9eb0-783901a26750, scenario_id=b4ab9e5a-382f-4419-b17f-b93a3f491e98, type=UI
