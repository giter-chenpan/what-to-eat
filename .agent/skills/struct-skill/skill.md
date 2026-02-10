---
name: projectStruct
description: monile app project struct
---

## when use this skill
when you need to understand the file organization, directory usage, or find specific functional modules of the `apps/mobile` project, please refer to this description.

## project struct

project is a **Next.js App Router** mobile app。

```
apps/mobile
├── app/                  # app directory
│   ├── assets/           # static resources and images 
│   ├── common/           # common tools and request configuration
│   │   ├── request.ts    # API request encapsulation
│   │   └── utils.ts      # common auxiliary functions
│   ├── components/       # reusable UI components
│   │   ├── tabNav/       # bottom navigation bar component
│   │   ├── timesShow/    # time display component
│   │   └── transItem/    # translation item component
│   ├── dishes/           # [route] dishes related pages
│   ├── login/            # [route] login page
│   ├── nav/              # [route] main navigation container
│   │   ├── home/         # [sub route] home page
│   │   ├── mine/         # [sub route] personal center
│   │   ├── times/        # [sub route] count related
│   │   ├── translation/  # [sub route] translation page
│   │   └── layout.tsx    # navigation page's shared layout
│   ├── words/            # [route] words related pages
│   ├── globals.css       # global style file
│   ├── layout.tsx        # root layout component
│   ├── page.tsx          # root page (entry)
│   └── povider.tsx       # global Context Provider configuration
├── .agent/               # Agent configuration and skills
├── next.config.mjs       # Next.js configuration file
├── tailwind.config.ts    # Tailwind CSS configuration file
├── tsconfig.json         # TypeScript configuration file
└── package.json          # project dependencies configuration
```

## key convention
1. **route**: use Next.js App Router，file system is route。
2. **style**: use **Tailwind CSS** (`tailwind.config.ts`) and global CSS (`globals.css`)。
3. **component**: common components put in `app/components`，page-specific components are recommended to be placed in the corresponding page directory。
4. **request**: use `app/common/request.ts` to uniformly manage API requests。
