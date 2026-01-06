@feature_id:ec9542f9-2877-4729-9828-403627ac486d
@epic_id:80dc4f3d-0dff-4dbf-941d-840dcaac05e4
Feature: Critical Parameter Extraction
  Extract key parameters from logs to facilitate quick debugging.

  @scenario_id:f9ac84d3-9880-4126-b06f-f16e91f26f86
  @scenario_type:UI
  @ui_test
  Scenario: Extract Parameters from Local Log File
    # Scenario ID: f9ac84d3-9880-4126-b06f-f16e91f26f86
    # Feature ID: ec9542f9-2877-4729-9828-403627ac486d
    # Scenario Type: UI
    # Description: Test the extraction of key parameters from a locally stored log file to ensure accurate debugging information is captured.
    Given User has a local log file with key parameters
    When User selects the log file for analysis
    Then Key parameters are successfully extracted from the log file
    And Extracted parameters are displayed on the UI for review
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=ec9542f9-2877-4729-9828-403627ac486d, scenario_id=f9ac84d3-9880-4126-b06f-f16e91f26f86, type=UI

  @scenario_id:e825e972-27d3-4273-83e4-a654a574ab20
  @scenario_type:UI
  @ui_test
  Scenario: Extract Parameters from Slack Logs
    # Scenario ID: e825e972-27d3-4273-83e4-a654a574ab20
    # Feature ID: ec9542f9-2877-4729-9828-403627ac486d
    # Scenario Type: UI
    # Description: Validate the extraction of key parameters from logs retrieved from Slack for debugging purposes.
    Given User has access to Slack logs containing key parameters
    When User initiates the log extraction process from Slack
    Then Key parameters are extracted from Slack logs
    And Extracted parameters are shown in the UI for further analysis
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=ec9542f9-2877-4729-9828-403627ac486d, scenario_id=e825e972-27d3-4273-83e4-a654a574ab20, type=UI

  @scenario_id:d790556e-86a8-4ff7-97da-3cd3eeb19bf0
  @scenario_type:UI
  @ui_test
  Scenario: Extract Parameters from AWS CloudWatch Logs
    # Scenario ID: d790556e-86a8-4ff7-97da-3cd3eeb19bf0
    # Feature ID: ec9542f9-2877-4729-9828-403627ac486d
    # Scenario Type: UI
    # Description: Ensure that key parameters can be extracted from AWS CloudWatch logs to assist in debugging.
    Given User has access to AWS CloudWatch logs containing relevant information
    When User selects AWS CloudWatch as the log source
    Then Key parameters are extracted from AWS CloudWatch logs
    And Extracted parameters are stored in the database for future reference
    # Priority: low
    # Status: draft
    # Test Runner Info: feature_id=ec9542f9-2877-4729-9828-403627ac486d, scenario_id=d790556e-86a8-4ff7-97da-3cd3eeb19bf0, type=UI

  @scenario_id:9ec52686-694d-41c0-bc1d-120a61c5be64
  @scenario_type:UI
  @ui_test
  Scenario: Display Extracted Parameters for Debugging
    # Scenario ID: 9ec52686-694d-41c0-bc1d-120a61c5be64
    # Feature ID: ec9542f9-2877-4729-9828-403627ac486d
    # Scenario Type: UI
    # Description: Check the display functionality of extracted parameters for quick debugging.
    Given Key parameters have been extracted from a log
    When User navigates to the parameters display section in the application
    Then Extracted parameters are displayed in a user-friendly format
    And User can easily access and review the parameters for debugging
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=ec9542f9-2877-4729-9828-403627ac486d, scenario_id=9ec52686-694d-41c0-bc1d-120a61c5be64, type=UI
