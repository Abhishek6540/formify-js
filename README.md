📦 @trusty_abhishek/form-builder

A reusable Form Builder component for Next.js & React projects.

This package helps you create dynamic forms easily and reuse them across projects.

📂 Folder Structure
form-builder-lib/
│
├── src/
│   ├── components/
│   │   └── FormBuilderContent.tsx  # Main component with "use client"
│   └── index.ts                     # Component exports
│
├── dist/                (auto generated after build)
│   ├── index.js
│   ├── index.d.ts
│
├── package.json
├── tsconfig.json
└── README.md
🧠 Explanation of Important Files
✅ src/components/FormBuilderContent.tsx

Main React component.

"use client";

export function FormBuilderContent() {
  return <div>My Form Builder</div>;
}

"use client" is important because Next.js App Router treats npm packages as Server Components by default.

✅ src/index.ts

This file exports your component:

export { FormBuilderContent } from "./components/FormBuilderContent";

This is the entry point of your npm package.

📦 package.json (Important)
{
  "name": "@trusty_abhishek/form-builder",
  "version": "1.0.5",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --dts --format esm --external react,next,react-dom"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "next": ">=13"
  },
  "license": "MIT"
}

⚙️ Install Required Tools
npm install -D tsup typescript
Why?
Command	Reason
tsup	To convert TypeScript into JavaScript bundle
typescript	To generate .d.ts type files
🏗 Build the Package
npm run build
Why?

This command:

converts src/index.ts → dist/index.js

creates dist/index.d.ts

creates ESM bundle

keeps react & next external

🔐 Login to npm
npm login
Why?

So npm knows whose account will publish the package.

🚀 Publish to npm
npm publish --access public
Why?

Publishes your package to npm registry

--access public makes scoped package public

📥 Install Package in Next.js Project
npm install @trusty_abhishek/form-builder
⚙️ Next.js Configuration (Important)

In your Next.js project, add in next.config.js:

const nextConfig = {
  transpilePackages: ["@trusty_abhishek/form-builder"],
};

module.exports = nextConfig;
Why?

Next.js does not transpile node_modules by default.
This allows your custom npm package to work correctly.

🧑‍💻 Usage in Next.js
"use client";

import { FormBuilderContent } from "@trusty_abhishek/form-builder";

export default function Page() {
  return (
    <div>
      <h1>My Form Builder</h1>
      <FormBuilderContent />
    </div>
  );
}
🛠 Common Errors & Fix
❌ Error: dynamic usage of require is not supported
✅ Fix:

In build script use:

--external react,next,react-dom

So react is not bundled with require().

❌ Cannot find module '@trusty_abhishek/form-builder'
✅ Fix:

Check:

dist/index.js exists

src/index.ts exports component

reinstall package

npm uninstall @trusty_abhishek/form-builder
npm install @trusty_abhishek/form-builder
🔁 Update Version

Every time before publishing:

"version": "1.0.6"

Then:

npm run build
npm publish --access public
🧪 Verify Build Output
cat node_modules/@trusty_abhishek/form-builder/dist/index.js | grep require

It should return nothing.

🎯 Features

✅ Works with Next.js App Router

✅ Reusable form builder

✅ TypeScript support

✅ ESM compatible

✅ Lightweight

✅ Customizable

👨‍💻 Author

Abhishek (trusty_abhishek)
npm: https://www.npmjs.com/~trusty_abhishek

⭐ Example Workflow Summary
npm install -D tsup typescript
npm run build
npm login
npm publish --access public

Then in Next app:

npm install @trusty_abhishek/form-builder


If Tailwind CSS classes from @trusty_abhishek/form-builder are not working, you need to allow Tailwind to scan this package.

✅ Step 1: Add package path in tailwind.config.js
// tailwind.config.ts or tailwind.config.js
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // 👇 required for form-builder package
    "./node_modules/@trusty_abhishek/form-builder/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
✅ Step 2: Add @source in your global CSS file (Tailwind v4 users)

If you are using Tailwind v4 with PostCSS (@import "tailwindcss"), add this line in your global CSS file (example: app/globals.css):

@import "tailwindcss";

/* 👇 required for form-builder package */
@source "../node_modules/@trusty_abhishek/form-builder/dist/**/*.{js,mjs}";

Path may vary depending on where your globals.css file is located.

✅ Step 3: Restart the dev server
npm run dev