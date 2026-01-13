@feature_id:7373be08-bae5-453f-a9f0-ba253879e4e2
@epic_id:32a98f90-f38a-4441-acd6-b39e38e260d8
Feature: User Feedback
  Collect and manage user feedback and ratings.

  @scenario_id:8d1b766b-e3d0-432b-a64e-8c5cc2f221ea
  @scenario_type:UI
  @ui_test
  Scenario: Submit User Feedback
    # Scenario ID: 8d1b766b-e3d0-432b-a64e-8c5cc2f221ea
    # Feature ID: 7373be08-bae5-453f-a9f0-ba253879e4e2
    # Scenario Type: UI
    # Description: Test scenario to verify that users can submit feedback and ratings successfully.
    Given the user is on the feedback page
    When the user enters feedback in the text box
    And the user selects a rating of 1 to 5 stars
    And the user clicks the submit button
    Then the feedback is successfully submitted and a confirmation message is displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7373be08-bae5-453f-a9f0-ba253879e4e2, scenario_id=8d1b766b-e3d0-432b-a64e-8c5cc2f221ea, type=UI

  @scenario_id:a4125905-736b-467b-a7b9-fbcb1a9a530f
  @scenario_type:UI
  @ui_test
  Scenario: View Submitted Feedback
    # Scenario ID: a4125905-736b-467b-a7b9-fbcb1a9a530f
    # Feature ID: 7373be08-bae5-453f-a9f0-ba253879e4e2
    # Scenario Type: UI
    # Description: Test scenario to ensure that users can view their previously submitted feedback.
    Given the user has previously submitted feedback
    When the user navigates to the feedback history section
    Then the user can see a list of their submitted feedback
    And the user can view the details of each feedback entry
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7373be08-bae5-453f-a9f0-ba253879e4e2, scenario_id=a4125905-736b-467b-a7b9-fbcb1a9a530f, type=UI

  @scenario_id:6eea9ba5-3edb-4996-a0ac-122e4dd36492
  @scenario_type:UI
  @ui_test
  Scenario: Edit User Feedback
    # Scenario ID: 6eea9ba5-3edb-4996-a0ac-122e4dd36492
    # Feature ID: 7373be08-bae5-453f-a9f0-ba253879e4e2
    # Scenario Type: UI
    # Description: Test scenario to verify that users can edit their feedback after submission.
    Given the user has submitted feedback
    When the user navigates to the feedback history
    And the user selects a feedback entry to edit
    And the user modifies the feedback text and rating
    And the user clicks the update button
    Then the feedback is updated successfully and a confirmation message is displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7373be08-bae5-453f-a9f0-ba253879e4e2, scenario_id=6eea9ba5-3edb-4996-a0ac-122e4dd36492, type=UI

  @scenario_id:950d6af1-2321-49f4-9840-376e28a641a0
  @scenario_type:UI
  @ui_test
  Scenario: Delete User Feedback
    # Scenario ID: 950d6af1-2321-49f4-9840-376e28a641a0
    # Feature ID: 7373be08-bae5-453f-a9f0-ba253879e4e2
    # Scenario Type: UI
    # Description: Test scenario to ensure users can delete their feedback.
    Given the user has submitted feedback
    When the user navigates to the feedback history
    And the user selects a feedback entry to delete
    And the user confirms the deletion
    Then the feedback is deleted successfully and is no longer visible in the feedback history
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=7373be08-bae5-453f-a9f0-ba253879e4e2, scenario_id=950d6af1-2321-49f4-9840-376e28a641a0, type=UI
