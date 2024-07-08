
# Music Archive

An app hosting information about music bands. This archive is community driven - users are able to make update or create requests which then are going to go into a queue. Requests are reviewed by administrators - they can be rejected or approved, committing them to database.

# Setting Up

### Environmental Variables

Use the provided example env, no extra variables are required.

### Run Locally

In the project directory

Install dependencies

```bash
  npm install
```
Start server with an in-memory database

```bash
  npm run dev:mem -w server
```
Start client in another terminal

```bash
  npm run dev -w client
```

### Running Tests

Run tests

```bash
  npm run test -w server
```
Run coverage

```bash
  npm run coverage -w server
```
