## Shopping store

<!-- ABOUT THE PROJECT -->
## About The Project
Server-side development for a web application that includes a management system that allows business users to post ads to the editor and delete them

### Built With
 [![Node][Node.js]][Node-url]  [![MongoDB][MongoDB]][MongoDB-url]  [![Express][Express.js]][Express-url]  [![Bcrypt][Bcrypt.js]][Bcrypt-url]  [![JWT][JWT]][JWT-url]  [![joi][joi]][joi-url] [![Morgan][Morgan]][Morgan-url]
 [![Mongoose][Mongoose.js]][Mongoose-url]  [![Chalk][Chalk]][Chalk-url]  [![Cors][Cors]][Cors-url]



<!-- GETTING STARTED -->
### Installation

_Chalk should only 4.1.2 version._

1. Install NPM packages
   ```sh
   npm install
   ```
2. Install Chalk version:
   ```sh
   npm i chalk@4.1.2 
   ```
### Starting

 _Run dev server:_
 
1.Run dev server
   ```sh
   npm run dev
   ```


### More info 

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
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    middle: { type: String },
    last: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255,
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
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
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
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
      required: true,
      minlength: 2,
      maxlength: 400,
    },
    city: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 400,
    },
    street: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 400,
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
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  biz: {
    type: Boolean,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  cards: Array,
});
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
    required: true,
    minlength: 6,
    maxlength: 255,
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
});
```


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png
[Node.js]: https://img.shields.io/badge/node.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Node-url]: https://nodejs.org/
[MongoDB]: https://img.shields.io/badge/mongoDB-20232A?style=for-the-badge&logo=mongoDB&logoColor=green
[MongoDB-url]: https://www.mongodb.com/
[Express.js]: https://img.shields.io/badge/Express.js-35495E?style=for-the-badge&logo=expressjs&logoColor=4FC08D
[Express-url]: https://expressjs.com/
[Bcrypt.js]: https://img.shields.io/badge/Bcrypt.js-DD0031?style=for-the-badge&logo=bcrypt&logoColor=white
[Bcrypt-url]: https://yepcode.io/
[JWT]: https://img.shields.io/badge/JWT-4A4A55?style=for-the-badge&logo=jwt&logoColor=FF3E00
[JWT-url]: https://jwt.io/
[joi]: https://img.shields.io/badge/joi-FF2D20?style=for-the-badge&logo=joil&logoColor=white
[joi-url]:https://joi.dev/
[Morgan]: https://img.shields.io/badge/Morgan-563D7C?style=for-the-badge&logo=morgan&logoColor=white
[Morgan-url]:https://coralogix.com/
[Mongoose.js]: https://img.shields.io/badge/Mongoose-0769AD?style=for-the-badge&logo=mongoose&logoColor=white
[Mongoose-url]: https://mongoosejs.com/
[Chalk]: https://img.shields.io/badge/Chalk-8A2BE2?style=for-the-badge&logo=chalk&logoColor=white
[Chalk-url]: https://www.npmjs.com/package/chalk
[Cors]: https://img.shields.io/badge/Cors-0769AD?style=for-the-badge&logo=cors&logoColor=white
[Cors-url]: https://www.npmjs.com/package/cors
