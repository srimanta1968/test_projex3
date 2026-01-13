@feature_id:110ec117-9501-4606-9609-08d983407b98
@epic_id:c04f1b90-e100-48f2-b686-df1486cc5ed1
Feature: Trip Matching
  Match users with similar trip requests to optimize rides.

  @scenario_id:9bd8c3c4-69d7-4bbd-aaa1-fde74ba07b98
  @scenario_type:API
  @api_test
  Scenario: Match Users with Similar Trip Requests
    # Scenario ID: 9bd8c3c4-69d7-4bbd-aaa1-fde74ba07b98
    # Feature ID: 110ec117-9501-4606-9609-08d983407b98
    # Scenario Type: API
    # Description: Verify that the system matches users who have similar trip requests based on location and time.
    Given a user has submitted a trip request from Location A to Location B at 5 PM
    When another user submits a trip request from Location A to Location B at 5 PM
    Then the system should match both users for the trip
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=110ec117-9501-4606-9609-08d983407b98, scenario_id=9bd8c3c4-69d7-4bbd-aaa1-fde74ba07b98, type=API

  @scenario_id:048cc319-00fb-4f82-86fd-b0b934d34137
  @scenario_type:API
  @api_test
  Scenario: No Match for Different Trip Requests
    # Scenario ID: 048cc319-00fb-4f82-86fd-b0b934d34137
    # Feature ID: 110ec117-9501-4606-9609-08d983407b98
    # Scenario Type: API
    # Description: Ensure that the system does not match users with different trip requests.
    Given a user has submitted a trip request from Location A to Location B at 5 PM
    When another user submits a trip request from Location A to Location C at 5 PM
    Then the system should not match these users
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=110ec117-9501-4606-9609-08d983407b98, scenario_id=048cc319-00fb-4f82-86fd-b0b934d34137, type=API

  @scenario_id:638ae1ed-c6d0-4f84-97a3-c0b72ecb3393
  @scenario_type:API
  @api_test
  Scenario: Prioritize Matches by Time
    # Scenario ID: 638ae1ed-c6d0-4f84-97a3-c0b72ecb3393
    # Feature ID: 110ec117-9501-4606-9609-08d983407b98
    # Scenario Type: API
    # Description: Check that the system prioritizes users with the closest departure times for trip matching.
    Given a user has submitted a trip request from Location A to Location B at 5 PM
    When another user submits a trip request from Location A to Location B at 4:50 PM
    Then the system should prioritize matching the second user with the first user
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=110ec117-9501-4606-9609-08d983407b98, scenario_id=638ae1ed-c6d0-4f84-97a3-c0b72ecb3393, type=API

  @scenario_id:69ab0c61-c809-4915-8afd-bcf2149c82a2
  @scenario_type:API
  @api_test
  Scenario: Multiple Matches for a Single Request
    # Scenario ID: 69ab0c61-c809-4915-8afd-bcf2149c82a2
    # Feature ID: 110ec117-9501-4606-9609-08d983407b98
    # Scenario Type: API
    # Description: Verify that the system can handle multiple matches for a single trip request.
    Given a user has submitted a trip request from Location A to Location B at 5 PM
    When three other users submit trip requests from Location A to Location B at 5 PM
    Then the system should match all users for the trip
    # Priority: medium
    # Status: draft
    # Test Runner Info: feature_id=110ec117-9501-4606-9609-08d983407b98, scenario_id=69ab0c61-c809-4915-8afd-bcf2149c82a2, type=API
