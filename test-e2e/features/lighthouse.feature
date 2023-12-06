Feature: Lighthouse

  Background:
    Given I open 'https://qavajs.github.io/' url

  Scenario: perform lighthouse audit with default config
    When I perform lighthouse audit and save results as 'lh'
    Then I expect '$lh.categories.performance.score' to be greater than '0.1'

  Scenario: perform lighthouse audit with provided config
    When I perform lighthouse audit and save results as 'lh':
    """
    {
        "extends": "lighthouse:default",
        "settings": {
            "formFactor": "desktop",
            "screenEmulation": {
                "mobile": false,
                "width": 1350,
                "height": 940,
                "deviceScaleFactor": 1,
                "disabled": false
            }
        }
    }
    """
    Then I expect '$lh.categories.performance.score' to be greater than '0.1'

  Scenario: perform lighthouse audit with provided config as memory value
    When I perform lighthouse audit with '$lhConfig' config and save results as 'lh'
    Then I expect '$lh.categories.performance.score' to be greater than '0.1'
