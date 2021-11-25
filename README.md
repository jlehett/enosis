# `@unifire-js`

#### <b>Uniform solutions for a variety of web development problems.</b>

## Mono-Repo Directory

For the full list of packages offered by `@unifire-js`, please see below:

* [async](/packages/async)
    * <i>Uniform solutions for async operations.</i>
* [categorized-errors](/packages/categorized-errors)
    * <i>Uniform solutions for error handling.</i>
* [firebase](/packages/firebase)
    * <i>Uniform solutions for Firebase integrations.</i>
* [storybook-utils](/packages/storybook-utils)
    * <i>Uniform solutions for Storybook utilities.</i>

## Testing

### Running the tests

Each of the directories in `packages/` have their own test suites. To run all of the packages' tests at once, run the following command from the root directory of the mono-repo:

```
$ lerna run test
```

If you would like to only run one package's test suite, navigate to that package's directory and run the following command:

```
$ npm test
```

The scripts in each `package.json` will automatically transpile the libraries via `babel` before running the test suites. This is true even if they are run via `lerna`.

## Contributing

See [Contributing](/CONTRIBUTING.md) for more information on contributing to `@unifire-js`.