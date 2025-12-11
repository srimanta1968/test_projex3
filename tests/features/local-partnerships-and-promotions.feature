@feature_id:4ac6632a-f14e-4d18-8f7b-0c9b78544724
@epic_id:5d8163d1-7f8c-4f9f-be7c-6093e1914880
Feature: Local Partnerships and Promotions
  Establish partnerships with local businesses to offer promotions and special deals to users.

  @scenario_id:5a69a46c-2b71-42d6-8404-1f7016437b05
  @scenario_type:UI
  @ui_test
  Scenario: User views available promotions from local businesses
    # Scenario ID: 5a69a46c-2b71-42d6-8404-1f7016437b05
    # Feature ID: 4ac6632a-f14e-4d18-8f7b-0c9b78544724
    # Scenario Type: UI
    # Description: Ensure that users can access a list of promotions offered by local businesses through the app.
    Given The user is logged into the Quick Ride app
    When The user navigates to the promotions section
    Then The user should see a list of available promotions from local businesses
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=4ac6632a-f14e-4d18-8f7b-0c9b78544724, scenario_id=5a69a46c-2b71-42d6-8404-1f7016437b05, type=UI

  @scenario_id:67e8b177-27f8-4ef7-9c60-73178c42403a
  @scenario_type:UI
  @ui_test
  Scenario: User redeems a promotion from a local business
    # Scenario ID: 67e8b177-27f8-4ef7-9c60-73178c42403a
    # Feature ID: 4ac6632a-f14e-4d18-8f7b-0c9b78544724
    # Scenario Type: UI
    # Description: Verify that users can successfully redeem a promotion provided by a local business during a ride.
    Given The user is logged into the Quick Ride app
    And The user has selected a ride
    When The user chooses to apply a local business promotion
    Then The promotion should be applied to the ride fare
    And The user should see the updated fare reflecting the discount
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=4ac6632a-f14e-4d18-8f7b-0c9b78544724, scenario_id=67e8b177-27f8-4ef7-9c60-73178c42403a, type=UI

  @scenario_id:b2339b63-e833-4691-85f3-3be4e515615e
  @scenario_type:UI
  @ui_test
  Scenario: User shares a promotion with friends
    # Scenario ID: b2339b63-e833-4691-85f3-3be4e515615e
    # Feature ID: 4ac6632a-f14e-4d18-8f7b-0c9b78544724
    # Scenario Type: UI
    # Description: Check that users can share local business promotions with their friends through social media or messaging.
    Given The user is logged into the Quick Ride app
    And The user is viewing a promotion
    When The user clicks on the share button
    Then The user should be able to select a method to share the promotion
    And The promotion details should be shared successfully
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=4ac6632a-f14e-4d18-8f7b-0c9b78544724, scenario_id=b2339b63-e833-4691-85f3-3be4e515615e, type=UI

  @scenario_id:2cb32cc8-0696-4daa-bfc8-986b7528a593
  @scenario_type:API
  @api_test
  Scenario: User receives notifications about new promotions
    # Scenario ID: 2cb32cc8-0696-4daa-bfc8-986b7528a593
    # Feature ID: 4ac6632a-f14e-4d18-8f7b-0c9b78544724
    # Scenario Type: API
    # Description: Ensure that users receive timely notifications when new promotions from local businesses are available.
    Given The user has opted in for notifications
    When A new promotion is established with a local business
    Then The user should receive a notification about the new promotion
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=4ac6632a-f14e-4d18-8f7b-0c9b78544724, scenario_id=2cb32cc8-0696-4daa-bfc8-986b7528a593, type=API
