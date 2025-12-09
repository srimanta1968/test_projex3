@feature_id:6fb90497-7fd1-404d-9bcc-a72af02af513
@epic_id:6542f06c-e4a2-43cb-9bfa-f178138bb284
Feature: User Management Tools
  Tools for administrators to view and manage user accounts.

  @scenario_id:c57c89f1-dcdd-4d81-9cc9-b4e5faa0d500
  @scenario_type:UI
  @ui_test
  Scenario: View User Accounts
    # Scenario ID: c57c89f1-dcdd-4d81-9cc9-b4e5faa0d500
    # Feature ID: 6fb90497-7fd1-404d-9bcc-a72af02af513
    # Scenario Type: UI
    # Description: Administrator can view the list of all user accounts in the system.
    Given the administrator is logged in to the admin panel
    When the administrator navigates to the user management section
    Then the list of user accounts is displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=6fb90497-7fd1-404d-9bcc-a72af02af513, scenario_id=c57c89f1-dcdd-4d81-9cc9-b4e5faa0d500, type=UI

  @scenario_id:cfaef45d-d020-4ecb-92e5-987c78e98dde
  @scenario_type:UI
  @ui_test
  Scenario: Edit User Account
    # Scenario ID: cfaef45d-d020-4ecb-92e5-987c78e98dde
    # Feature ID: 6fb90497-7fd1-404d-9bcc-a72af02af513
    # Scenario Type: UI
    # Description: Administrator can edit a specific user account's details.
    Given the administrator is logged in to the admin panel
    And the administrator has selected a user account to edit
    When the administrator updates the user account details
    Then the updated user account details are saved successfully
    And a confirmation message is displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=6fb90497-7fd1-404d-9bcc-a72af02af513, scenario_id=cfaef45d-d020-4ecb-92e5-987c78e98dde, type=UI

  @scenario_id:23a60830-b04b-457a-8ddf-943df95f60ff
  @scenario_type:UI
  @ui_test
  Scenario: Delete User Account
    # Scenario ID: 23a60830-b04b-457a-8ddf-943df95f60ff
    # Feature ID: 6fb90497-7fd1-404d-9bcc-a72af02af513
    # Scenario Type: UI
    # Description: Administrator can delete a user account from the system.
    Given the administrator is logged in to the admin panel
    And the administrator has selected a user account to delete
    When the administrator confirms the deletion
    Then the user account is removed from the list
    And a success message is displayed
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=6fb90497-7fd1-404d-9bcc-a72af02af513, scenario_id=23a60830-b04b-457a-8ddf-943df95f60ff, type=UI

  @scenario_id:dc27c98a-8ea4-49b5-9a70-50cf59e4d18e
  @scenario_type:UI
  @ui_test
  Scenario: Search User Accounts
    # Scenario ID: dc27c98a-8ea4-49b5-9a70-50cf59e4d18e
    # Feature ID: 6fb90497-7fd1-404d-9bcc-a72af02af513
    # Scenario Type: UI
    # Description: Administrator can search for user accounts by name or email.
    Given the administrator is logged in to the admin panel
    And the administrator is on the user management page
    When the administrator enters a search term in the search bar
    Then the list of user accounts is filtered based on the search term
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=6fb90497-7fd1-404d-9bcc-a72af02af513, scenario_id=dc27c98a-8ea4-49b5-9a70-50cf59e4d18e, type=UI
