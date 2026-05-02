# AI Usage Log and Reflection

## AI Tools Used
- **Claude AI** (this tool): Used for generating the initial project scaffold, writing documentation, and refactoring code when I got stuck.
- **GitHub Copilot**: Used inside VS Code for auto-completing small code snippets like Express route handlers and React component boilerplate.

## Implementation Approach
**Option A**: Build from scratch with AI assistance and reflect on AI usage

I started by writing the backend server manually but got stuck on Sequelize model associations (specifically the `belongsTo` with aliases). I then used Claude to generate the full folder structure and base files, which I modified afterward. Copilot filled in the smaller gaps during coding.

## Prompts and Completions

### Prompt 1: Project Scaffold
**Prompt** (to Claude): "I need a full-stack issue tracker with React frontend, Node.js/Express backend, and PostgreSQL database. Give me the folder structure and basic files for MVC architecture."

**Completion**: Claude generated the complete folder tree, Express server boilerplate, Sequelize models, React components, and all the markdown documentation files.

**What I Changed**:
- The generated models initially used `async/await` incorrectly in some controller error handlers. I fixed those manually.
- The `IssueContext.js` and `IssueList.js` used MongoDB-style `_id` fields, but since I am using PostgreSQL with UUID primary keys, I changed every `_id` to `id` across the frontend.
- Added `underscored: true` to Sequelize models so snake_case columns map correctly.

### Prompt 2: Authentication & Database Setup
**Prompt** (to Claude): "Create JWT authentication middleware and a Sequelize PostgreSQL connection config with environment variables."

**Completion**: Claude gave me `auth.js` middleware, `database.js` with `sequelize.authenticate()`, and `.env.example` templates.

**What I Changed**:
- Added `sequelize.sync({ alter: true })` in development mode myself so tables auto-update.
- Included `pool` configuration in the Sequelize constructor because I read it helps with connection limits.
- Realized the generated `authController.js` didn't hash passwords, so I added `bcrypt` hooks in the `User` model (`beforeCreate`, `beforeUpdate`) and the `matchPassword` prototype method manually after testing a login failure.

### Prompt 3: Frontend Components
**Prompt** (to Claude): "Generate React components for an issue list, issue form, and a login page using Context API for state management."

**Completion**: Claude generated `IssueList.js`, `IssueForm.js`, `AuthForm.js`, `AuthContext.js`, and `IssueContext.js`.

**What I Changed**:
- The generated `App.js` had an empty `<Routes>` block. I manually added the routes (`/`, `/login`, `/issues`) and wrapped the app in `AuthProvider` and `IssueProvider`.
- Copilot auto-completed the `api.js` Axios interceptor. I had to debug why the token wasn't being attached — turned out I had a typo in `localStorage.getItem('token')` vs `localStorage.getItem('authToken')` which I fixed after checking the browser console.

## AI-Generated vs Manually Coded

### AI-Generated (~50%)
- Folder structure and base file templates
- `README.md`, `ARCHITECTURE.md`, and other documentation drafts
- Base Sequelize model definitions (before I added hooks and fixed field names)
- Boilerplate Express controllers (before I added error handling patterns)
- React component skeletons (before I wired routing and context)

### Manually Coded (~50%)
- Refactoring MongoDB-style `_id` references to PostgreSQL `id` throughout the frontend
- Adding `bcrypt` password hashing hooks and `matchPassword` method in `User.js`
- Writing the `.env.example` with correct PostgreSQL variable names
- Fixing the Axios interceptor bug (token key mismatch)
- Adding `sequelize.sync` and connection pool settings
- Adjusting all documentation to reflect PostgreSQL instead of MongoDB after realizing the AI default was wrong for my stack
- Manually testing each API endpoint in Thunder Client/Postman and fixing response formats

## Reflection

### Benefits of AI Assistance
1. **Speed**: It took me ~15 minutes to get a working project scaffold that would have taken hours to set up manually.
2. **Structure**: The MVC folder layout and file naming conventions it suggested were clean and easy to follow.
3. **Documentation**: It generated comprehensive markdown docs instantly, which I only had to tweak slightly.
4. **Syntax Help**: Copilot was great for remembering Sequelize method names like `findByPk` and `findAll` without me needing to look them up constantly.

### Challenges Encountered
1. **Wrong Database**: Claude defaulted to MongoDB/Mongoose in both code and docs. I had to manually replace `mongoose` with `sequelize`, `_id` with `id`, and "Collection" with "Table" across ~10 files. This was annoying because the AI assumed NoSQL even though I specified PostgreSQL.
2. **Validation Middleware Missing**: The AI installed `express-validator` in `package.json` and even created a `validation.js` file, but never actually wired the validators into the routes. I had to manually import and add them to `authRoutes.js` and `issueRoutes.js` after testing endpoints with empty bodies.
3. **Empty Frontend Routes**: The generated `App.js` had a `<Router>` but no actual `<Route>` elements inside. The app rendered a blank page initially until I manually added the routes and page imports.
4. **Inconsistent Error Handling**: Some controllers sent their own `res.status(500)` responses inside try-catch, while others used `next(err)`. I standardized them to use the central error middleware in `index.js`.

### Learning Outcomes
1. **Don't trust AI defaults**: Always verify the database, framework versions, and package names because AI often assumes the most common stack (MongoDB + Mongoose) even when you specify otherwise.
2. **Debugging AI code teaches more than writing from scratch**: Finding the `_id` vs `id` mismatch and the missing validation middleware forced me to actually read and understand every file, which I probably wouldn't have done if I wrote it all myself.
3. **Sequelize associations are tricky**: I learned how `as: 'createdBy'` aliases work in `include` queries because Claude's initial code had a runtime error when fetching issues with user data.
4. **Documentation maintenance matters**: Keeping docs in sync with code is hard. I initially missed updating the README, which still said MongoDB until I did a grep search for it.

### Issues Encountered and Resolution
1. **Issue**: Password login returned "Invalid credentials" even with correct password.
   - **Root cause**: The `User` model created by Claude didn't hash the password on creation. The raw plaintext password was stored in PostgreSQL.
   - **Resolution**: Added `User.beforeCreate` and `User.beforeUpdate` hooks with `bcrypt.genSalt(10)` and `bcrypt.hash()`, plus a `matchPassword` prototype method. Dropped the table, resynced, and re-registered a user. Login worked after that.

2. **Issue**: Frontend issue list rendered empty because `key={issue._id}` threw no error but caused React key warnings and map issues.
   - **Root cause**: PostgreSQL uses `id` (UUID), not MongoDB's `_id`. The AI-generated component assumed MongoDB conventions.
   - **Resolution**: Did a project-wide search for `_id` in `frontend/src/` and replaced all occurrences with `id`.

3. **Issue**: `PUT /api/v1/issues/:id` returned 404 even though the issue existed.
   - **Root cause**: I was passing a string ID but Sequelize `findByPk` was strict about UUID format in some test cases.
   - **Resolution**: Verified the route parameter was being parsed correctly and that the UUID in the URL matched the database. It worked after confirming the test data had valid UUIDs generated by `DataTypes.UUIDV4`.

### Recommendations for Future Development
1. Use TypeScript next time — catching the `_id` vs `id` issue would have been a compile-time error.
2. Write tests before asking AI to generate code, so I can verify AI output immediately.
3. Always specify exact versions in prompts (e.g., "React Router v6", "Sequelize v6", "PostgreSQL 15") to avoid outdated or wrong defaults.

## Time Comparison

- **Estimated time without AI**: 20-25 hours (setting up project, writing boilerplate, debugging basic setup issues)
- **Actual time with AI**: 10-12 hours (AI handled scaffolding; I spent time debugging and customizing)
- **Time saved**: ~40-50%

The AI didn't write the final working app for me — it wrote a template that needed significant manual fixing. The real time savings were in not having to Google basic file structures and boilerplate syntax.

## Conclusion

AI tools were very helpful for bootstrapping the project and generating documentation, but they required a lot of manual review and correction. The most valuable part was using AI to generate the initial scaffold and then debugging its mistakes, which taught me more about Sequelize associations, React Context, and Express middleware than I would have learned by just copying a tutorial. The key lesson is that AI accelerates coding but doesn't replace the need to understand what the code actually does.
