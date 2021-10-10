# Contributing to `@unifire-js`

As of right now, there is only one person working on `@unifire-js`. However, any contributions made by the community would be highly appreciated in order to make `@unifire-js` the one-stop shop for simplifying web development and ensuring consistency in codebases.

Here are some guidelines for contributing to the project:

* [Found an Issue?](#found-an-issue?)
* [Submission Guidelines](#submission-guidelines)

## Found an Issue?

If you find a bug in the source code, a mistake in the documentation, or some other issue, you can help by submitting an issue to our [GitHub Repository](https://github.com/jlehett/unifire-js). Feel free to create a pull request with a test demonstrating the bug and a fix!

## Submission Guidelines

### Submitting an Issue

When opening up an issue in GitHub, please provide as much of the following information as possible to help in determining the root cause:

* <b>Description of the Issue</b> - if an error is thrown, a non-minified stack trace helps
* <b>Motivation for or Use Case</b> - explain why this is a bug for you
* <b>Environment Configuration</b> - Node.js version, browser experiencing issue, and version of the library are all helpful
* <b>Reproduce the Error</b> - provide a live example, a (minimal) GitHub repo, or an unambiguous set of steps to reproduce
* <b>Suggest a Fix</b> - if you have an idea of where the issue may be occurring, that can be very helpful

### Submitting a Pull Request

The following is a list of guidelines to follow when submitting a pull request:

* Search the [GitHub repo](https://github.com/jlehett/unifire-js/issues) for an open or closed pull request that relates to your submission. You don't want to duplicate effort.
* Create an issue to discuss a change before submitting a PR.
* Create a fork of the GitHub repo to ensure that you can push your changes for us to review.
* Make your changes in a new git branch.
* Create your patch, <b>including appropriate test cases</b>, and plenty of jsdoc-style documentation. Patches without tests and/or documentation are much less likely to be merged.
* Avoid checking in files that shouldn't be tracked (e.g., `node_modules`, `.vscode`, etc.). If your development setup automatically creates some of these files, please add them to the `.gitignore` at the root of the package.
* Commit your changes using a commit message. We <i>may</i> introduce commit message guidelines in the future, but for now, try to keep it logical and have it accurately explain the commit's changes.
* Test your changes locally to ensure everything is in good working order. See the [README.md](/README.md) section on testing for information on how this works.
* Push your branch to your fork on GitHub.
* In GitHub, send a pull request to `unifire-js:master`.
* All pull requests must be reviewed by owners of the `unifire-js` repo, who will merge it when/if they feel it is good to go.

Releases will be made to NPM with fixes as deemed appropriate by the owners of the `unifire-js` repo.

### Updating Documentation

Currently, documentation is created manually for each package. While it is a lot of work, it currently is much easier to produce logical navigation for each package in this way.

The documentation setup is as follows:

* Root README.md has links to each package, with each of their main concept documentation files linked as well.
* Each packages' README.md has links to all necessarily standalone documentation files found in the package's `docs/` directory
* Standalone documentation files are stored <i>only</i> in each packages' `docs/` directory.

If anyone would like to experiment with ways to automate this documentation while still maintaining the same quality, feel free to propose a solution (and hopefully a PR)!