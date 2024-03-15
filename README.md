# Click AI / GitHub Actions / Run Tests

## Usage

```yaml

- name: Run tests
  uses: click-ai/run-tests@v1
  with:
    apiKey: ${{ secrets.CLICK_AI_API_KEY }}
    tests: |-
      # This will run all tests simultaneously, will run all tests if the array is empty
      [[
        "65942917c16ba99bb2b38f2f",
        "659dc7bcdceb9d988c9aa790"
      ]]
      # OR: This will run all tests sequentially
      [
        ["65942917c16ba99bb2b38f2f"],
        ["659dc7bcdceb9d988c9aa790"]
      ]
      # OR: This will run the first array of tests simultaneously, and after that the second array of tests simultaneously
      [
        ["65942917c16ba99bb2b38f2f"], <-- first array of tests
        [
          "659dc7bcdceb9d988c9aa790",
          "659dc7bcdceb9d988c9aa791"
        ] <-- second array of tests
      ]
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
