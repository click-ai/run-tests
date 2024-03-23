# Click AI / GitHub Actions / Run Tests

## Usage

```yaml

- name: Run tests
  uses: click-ai/run-tests@v1
  with:
    apiKey: ${{ secrets.CLICK_AI_API_KEY }}
    suiteId: 659dc7bcdceb9d988c9aa790 # Required, the suite ID to run the tests
    proxyUrls: |- 
        # Optional, if you need test a localhost server, we will expose it to the internet
        http://localhost:3000
    input: |-
      url=http://localhost:3000
      email=test@example.com
      password=12345678

```

### Inputs

 name    | description                                     |
 ------- | ----------------------------------------------- |
 `tests` | **[Required]** JSON list of test IDs to run, MUST be string[][]         |
 `apiKey`| **[Required]** Your Click AI API key.           |
 `input` | **[Optional]** Input to pass to the test.       |
