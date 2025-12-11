@feature_id:2ddea2ac-8e11-4f6d-a3b7-c3f39b364bc4
@epic_id:85f48a84-a4a1-4370-84ca-87a3c67befd2
Feature: Referral and Loyalty Programs
  Implement referral and loyalty programs to encourage user sign-ups and retention.

  @scenario_id:847cce93-7d72-4da6-ab35-fa528f770322
  @scenario_type:API
  @api_test
  Scenario: User successfully refers a friend
    # Scenario ID: 847cce93-7d72-4da6-ab35-fa528f770322
    # Feature ID: 2ddea2ac-8e11-4f6d-a3b7-c3f39b364bc4
    # Scenario Type: API
    # Description: This scenario tests the functionality of the referral program, ensuring that both the referrer and the referred friend receive their respective bonuses.
    Given a registered user
    When the user shares a referral link with a friend
    Then the friend signs up using the referral link
    And the user receives a referral bonus
    And the friend gets a welcome bonus
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=2ddea2ac-8e11-4f6d-a3b7-c3f39b364bc4, scenario_id=847cce93-7d72-4da6-ab35-fa528f770322, type=API

  @scenario_id:02ec45be-7cc9-4f2f-b286-daed0250a3d7
  @scenario_type:UI
  @ui_test
  Scenario: User loyalty points accumulation
    # Scenario ID: 02ec45be-7cc9-4f2f-b286-daed0250a3d7
    # Feature ID: 2ddea2ac-8e11-4f6d-a3b7-c3f39b364bc4
    # Scenario Type: UI
    # Description: This scenario verifies that users accumulate loyalty points correctly after completing rides.
    Given a registered user
    When the user completes a series of rides
    Then the user earns loyalty points for each ride
    And the total points are displayed in the user's account
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=2ddea2ac-8e11-4f6d-a3b7-c3f39b364bc4, scenario_id=02ec45be-7cc9-4f2f-b286-daed0250a3d7, type=UI

  @scenario_id:c7faea5e-a4df-46db-bc4f-f2b06f842ee7
  @scenario_type:API
  @api_test
  Scenario: User redeems loyalty points for discounts
    # Scenario ID: c7faea5e-a4df-46db-bc4f-f2b06f842ee7
    # Feature ID: 2ddea2ac-8e11-4f6d-a3b7-c3f39b364bc4
    # Scenario Type: API
    # Description: This scenario checks that users can successfully redeem their loyalty points for discounts.
    Given a registered user with accumulated loyalty points
    When the user chooses to redeem points for a discount on a ride
    Then the discount is applied to the ride fare
    And the remaining loyalty points are updated accordingly
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=2ddea2ac-8e11-4f6d-a3b7-c3f39b364bc4, scenario_id=c7faea5e-a4df-46db-bc4f-f2b06f842ee7, type=API

  @scenario_id:8c6aab0f-84d2-439a-9ba4-b7edabd027b2
  @scenario_type:UI
  @ui_test
  Scenario: Referral program terms and conditions acceptance
    # Scenario ID: 8c6aab0f-84d2-439a-9ba4-b7edabd027b2
    # Feature ID: 2ddea2ac-8e11-4f6d-a3b7-c3f39b364bc4
    # Scenario Type: UI
    # Description: This scenario ensures that users are able to accept the terms and conditions of the referral program and receive confirmation.
    Given a user on the referral program page
    When the user clicks on the 'Accept Terms' button
    Then the user is shown a confirmation message
    And the terms and conditions are logged in the user's account
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=2ddea2ac-8e11-4f6d-a3b7-c3f39b364bc4, scenario_id=8c6aab0f-84d2-439a-9ba4-b7edabd027b2, type=UI
