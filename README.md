# Click AI / GitHub Actions / Run Tests

## Usage

```yaml

- name: Run tests
  uses: click-ai/run-tests@v1
  with:
    apiKey: ${{ secrets.CLICK_AI_API_KEY }}
    tests: |-
      65942917c16ba99bb2b38f2f
      659dc7bcdceb9d988c9aa790
```

### Inputs

| name    | description                                     |
| ------- | ----------------------------------------------- |
| `tests` | **[Required]** List of test IDs to run.         |
| ------- | ----------------------------------------------- |
| `apiKey`| **[Required]** Your Click AI API key.           |
| ------- | ----------------------------------------------- |
