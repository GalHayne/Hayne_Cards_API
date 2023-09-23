<!-- ABOUT THE PROJECT -->
## About The Project
Server-side development for a web application that includes a management system that allows business users to post ads to the editor and delete them

### Built With
 [![Node][Node.js]][Node-url]  [![MongoDB][MongoDB]][MongoDB-url] 

<!-- GETTING STARTED -->
### Installation
1. Clone this project
 ```sh
   git clone https://github.com/selahben/BizCardsNodeJsServer.git
   ```
2. Install NPM packages
   ```sh
   npm i
   ```
### Starting
1.Run dev server
   ```sh
   npm run dev
   ```

## User end point
| URL | METHOD | ACTION | Authorization|
| --- | --- | --- | --- |
| /user | POST | All | Registered user|
| /useers/login | POST | All | Login |
| /useers | GET | Admin | Get all users |
| /useers/:id | GET | The Registered user or admin | Get user|
| /useers/:id | PUT | The Registered user | Edit user|
| /useers/:id | PATCH | The Registered user | Chsnge isBusiness status|
| /useers/:id | DELETE | The Registered user or admin  | Delete user|

## User model
```
  name: {
    first: {
      type: String,
      minlength: 2,
      maxlength: 255,
    },
    middle: {
      type: String,
      minlength: 0,
      maxlength: 255,
      default: "",
    },
    last: {
      type: String,
      minlength: 2,
      maxlength: 255,
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  phone: {
    type: String,
    minlength: 9,
    maxlength: 10,
  },
  email: {
    type: String,
    minlength: 6,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    minlength: 6,
    maxlength: 1024,
  },
  image: {
    url: {
      type: String,
      minlength: 0,
      maxlength: 1024,
      default: "",
    },
    alt: {
      type: String,
      minlength: 0,
      maxlength: 1024,
      default: "",
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  address: {
    state: {
      type: String,
      minlength: 0,
      maxlength: 400,
      default: "",
    },
    country: {
      type: String,
      minlength: 2,
      maxlength: 400,
    },
    city: {
      type: String,
      minlength: 2,
      maxlength: 400,
    },
    street: {
      type: String,
      minlength: 0,
      maxlength: 400,
      default: "",
    },
    houseNumber: {
      type: String,
      minlength: 0,
      maxlength: 8,
      default: "",
    },
    zip: {
      type: String,
      minlength: 0,
      maxlength: 14,
      default: "",
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  biz: {
    type: Boolean,
    default: false,
  },
  bizNumber: {
    type: String, // Change the data type to String
  },
  createdAt: { type: Date, default: Date.now },
  blockedUser: {
    type: Boolean,
    default: false,
  },
  wrongAttempts: { type: Array, default: null },
  cards: Array,
```
## Card end point
| URL | METHOD | ACTION | Authorization|
| --- | --- | --- | --- |
| /cards | GET | All | All cards|
| /cards/my-cards | GET | The Registered use | Get user cards |
| /cards/:id | GET | All | Get card |
| /cards| POST | Business user | Create new card|
| /cards/:id | PUT | The user who created the card | Edit card|
| /cards/:id | PATCH | A Registered user |Like card|
| /cards/:id | DELETE | he user who created the card or admin  | Delete card|

## Card model
```
title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  subtitle: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1024,
  },
  phone: {
    type: String,
    required: true,
    minlength: 9,
    maxlength: 10,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
    unique: false,
  },
  web: {
    type: String,
    minlength: 0,
    maxlength: 255,
    default: "",
  },
  image: {
    url: {
      type: String,
      minlength: 11,
      maxlength: 1024,
    },
    alt: {
      type: String,
      minlength: 2,
      maxlength: 1024,
    },
  },
  address: {
    state: {
      type: String,
      minlength: 0,
      maxlength: 255,
      default: "",
    },
    country: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    city: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    street: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    houseNumber: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 8,
    },
    zip: {
      type: String,
      minlength: 1,
      maxlength: 14,
    },
  },
  bizNumber: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 999_999_999,
    unique: true,
  },
  likes: {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  createdAt: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
```


### Libraries
- "node.js"
- "express"
- "mongoose"
- "joi"
- "bcrypt"
- "dotenv"
- "config"
- "jsonwebtoken"
- "cors"
- "chalk"
 -"ejs"
- "passport"
- "morgan"
- "lodash"
- "on-finished"
- "fs"
- "path"

### Features
1. Anyone can open a new user and start working.
2. There is a user who is defined as an administrator and has special premissions.
3. A user who enters a wrong password 3 times will be blocked to 24 hourse.
4. There is a logs folder where all errors with status 400 and above are saved with the error description

## ENJOY!!